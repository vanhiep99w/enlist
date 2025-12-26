package com.enlist.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParagraphCacheService {

    private final StringRedisTemplate redisTemplate;
    private final AIService aiService;
    
    private final AtomicLong cacheHits = new AtomicLong(0);
    private final AtomicLong cacheMisses = new AtomicLong(0);
    private final AtomicLong totalLatency = new AtomicLong(0);
    private final AtomicLong requestCount = new AtomicLong(0);

    private static final String CACHE_KEY_PREFIX = "paragraph:cache:";
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    /**
     * Get cached paragraph or generate new one
     */
    public String getCachedParagraph(Integer difficultyLevel, String targetLanguage,
                                     String errorSummary, String vocabSuggestions) {
        return getCachedParagraph(difficultyLevel, targetLanguage, errorSummary, vocabSuggestions, null);
    }

    public String getCachedParagraph(Integer difficultyLevel, String targetLanguage,
                                     String errorSummary, String vocabSuggestions, String previousParagraph) {
        long startTime = System.currentTimeMillis();
        
        // Skip caching if we have context-specific parameters (error summary, vocab, or previous paragraph)
        // These make each request unique, so caching would be ineffective
        boolean hasContext = (errorSummary != null && !errorSummary.isEmpty()) ||
                            (vocabSuggestions != null && !vocabSuggestions.isEmpty()) ||
                            (previousParagraph != null && !previousParagraph.isEmpty());
        
        if (hasContext) {
            log.info("Generating context-specific paragraph for difficulty {} (no cache)", difficultyLevel);
            String generated = aiService.generateParagraph(difficultyLevel, targetLanguage, 
                                                          errorSummary, vocabSuggestions, previousParagraph);
            long latency = System.currentTimeMillis() - startTime;
            recordMetrics(latency);
            cacheMisses.incrementAndGet();
            return generated;
        }
        
        String cacheKey = buildCacheKey(difficultyLevel, targetLanguage);
        
        // Try to get from cache
        String cached = redisTemplate.opsForValue().get(cacheKey);
        
        if (cached != null) {
            cacheHits.incrementAndGet();
            long latency = System.currentTimeMillis() - startTime;
            recordMetrics(latency);
            log.info("Cache HIT for difficulty {} ({}ms)", difficultyLevel, latency);
            return cached;
        }
        
        // Cache miss - generate new paragraph
        cacheMisses.incrementAndGet();
        log.info("Cache MISS for difficulty {}", difficultyLevel);
        
        String generated = aiService.generateParagraph(difficultyLevel, targetLanguage, 
                                                       errorSummary, vocabSuggestions, previousParagraph);
        
        // Cache the result
        redisTemplate.opsForValue().set(cacheKey, generated, CACHE_TTL);
        
        // Pre-generate next difficulty levels asynchronously
        preGenerateNextLevels(difficultyLevel, targetLanguage);
        
        long latency = System.currentTimeMillis() - startTime;
        recordMetrics(latency);
        
        return generated;
    }

    /**
     * Asynchronously pre-generate paragraphs for next difficulty levels
     */
    @Async
    public void preGenerateNextLevels(Integer currentDifficulty, String targetLanguage) {
        try {
            // Pre-generate for current +1 and +2 difficulty
            for (int offset = 1; offset <= 2; offset++) {
                int nextDifficulty = Math.min(currentDifficulty + offset, 10);
                String cacheKey = buildCacheKey(nextDifficulty, targetLanguage);
                
                // Only generate if not already cached
                if (Boolean.FALSE.equals(redisTemplate.hasKey(cacheKey))) {
                    log.info("Pre-generating paragraph for difficulty {}", nextDifficulty);
                    String paragraph = aiService.generateParagraph(nextDifficulty, targetLanguage, 
                                                                   null, null);
                    redisTemplate.opsForValue().set(cacheKey, paragraph, CACHE_TTL);
                }
            }
        } catch (Exception e) {
            log.error("Error pre-generating paragraphs: {}", e.getMessage());
        }
    }

    /**
     * Pre-generate paragraphs using tentative performance metrics
     * Generates for predicted next difficulties based on current session performance
     */
    @Async
    public void prefetchWithTentativeMetrics(Integer currentDifficulty, String targetLanguage,
                                             Double currentAccuracy, String errorSummary, 
                                             String vocabSuggestions) {
        try {
            // Predict next difficulty based on tentative accuracy
            Integer predictedNext = predictNextDifficulty(currentDifficulty, currentAccuracy);
            
            log.info("Prefetching for predicted difficulty {} (current: {}, tentative accuracy: {})",
                    predictedNext, currentDifficulty, currentAccuracy);
            
            // Prefetch for predicted difficulty
            String cacheKey = buildCacheKey(predictedNext, targetLanguage);
            if (Boolean.FALSE.equals(redisTemplate.hasKey(cacheKey))) {
                String paragraph = aiService.generateParagraph(predictedNext, targetLanguage,
                                                              errorSummary, vocabSuggestions);
                redisTemplate.opsForValue().set(cacheKey, paragraph, CACHE_TTL);
                log.info("Prefetched paragraph for predicted difficulty {}", predictedNext);
            }
            
            // Also prefetch neighboring difficulties as backup
            int[] backupDifficulties = {
                Math.max(predictedNext - 1, 1),
                Math.min(predictedNext + 1, 10)
            };
            
            for (int backup : backupDifficulties) {
                if (backup != predictedNext) {
                    String backupKey = buildCacheKey(backup, targetLanguage);
                    if (Boolean.FALSE.equals(redisTemplate.hasKey(backupKey))) {
                        String backupParagraph = aiService.generateParagraph(backup, targetLanguage,
                                                                            null, null);
                        redisTemplate.opsForValue().set(backupKey, backupParagraph, CACHE_TTL);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error prefetching with tentative metrics: {}", e.getMessage());
        }
    }
    
    private Integer predictNextDifficulty(Integer currentDifficulty, Double tentativeAccuracy) {
        if (tentativeAccuracy == null) {
            return currentDifficulty;
        }
        
        if (tentativeAccuracy >= 90.0) {
            return Math.min(currentDifficulty + 1, 10);
        } else if (tentativeAccuracy >= 70.0) {
            return currentDifficulty;
        } else {
            return Math.max(currentDifficulty - 1, 1);
        }
    }

    /**
     * Warm up cache for all difficulty levels
     */
    @Async
    public void warmupCache(String targetLanguage) {
        log.info("Starting cache warmup for language: {}", targetLanguage);
        
        for (int difficulty = 1; difficulty <= 10; difficulty++) {
            try {
                String cacheKey = buildCacheKey(difficulty, targetLanguage);
                
                if (Boolean.FALSE.equals(redisTemplate.hasKey(cacheKey))) {
                    String paragraph = aiService.generateParagraph(difficulty, targetLanguage, 
                                                                   null, null);
                    redisTemplate.opsForValue().set(cacheKey, paragraph, CACHE_TTL);
                    log.info("Warmed up cache for difficulty {}", difficulty);
                    
                    // Small delay to avoid overwhelming AI service
                    Thread.sleep(1000);
                }
            } catch (Exception e) {
                log.error("Error warming up cache for difficulty {}: {}", difficulty, e.getMessage());
            }
        }
        
        log.info("Cache warmup completed");
    }

    /**
     * Get cache statistics
     */
    public CacheStats getStats() {
        long hits = cacheHits.get();
        long misses = cacheMisses.get();
        long total = hits + misses;
        
        double hitRate = total > 0 ? (double) hits / total * 100 : 0;
        double avgLatency = requestCount.get() > 0 
            ? (double) totalLatency.get() / requestCount.get() 
            : 0;
        
        log.info("Cache Stats - Hits: {}, Misses: {}, Hit Rate: {:.2f}%, Avg Latency: {:.2f}ms",
                hits, misses, hitRate, avgLatency);
        
        return new CacheStats(hits, misses, hitRate, avgLatency);
    }

    private String buildCacheKey(Integer difficulty, String targetLanguage) {
        return CACHE_KEY_PREFIX + difficulty + ":" + (targetLanguage != null ? targetLanguage : "en");
    }

    private void recordMetrics(long latency) {
        totalLatency.addAndGet(latency);
        requestCount.incrementAndGet();
        
        // Log stats every 100 requests
        if (requestCount.get() % 100 == 0) {
            getStats();
        }
    }

    public record CacheStats(long hits, long misses, double hitRate, double avgLatency) {}
}
