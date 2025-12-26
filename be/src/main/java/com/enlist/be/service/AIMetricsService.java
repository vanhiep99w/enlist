package com.enlist.be.service;

import com.enlist.be.entity.AIMetrics;
import com.enlist.be.repository.AIMetricsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIMetricsService {
    
    private final AIMetricsRepository metricsRepository;
    
    @Transactional
    public void logMetrics(String operationType, int promptLength, int responseLength, 
                          long latencyMs, boolean success, String errorMessage, 
                          Double accuracy, Integer difficultyLevel, Long userId) {
        try {
            AIMetrics metrics = AIMetrics.builder()
                    .operationType(operationType)
                    .promptLength(promptLength)
                    .responseLength(responseLength)
                    .latencyMs(latencyMs)
                    .success(success)
                    .errorMessage(errorMessage)
                    .accuracy(accuracy)
                    .difficultyLevel(difficultyLevel)
                    .userId(userId)
                    .build();
            
            metricsRepository.save(metrics);
            
            log.info("AI Metrics logged - Operation: {}, Latency: {}ms, Prompt: {} chars, "
                    + "Response: {} chars, Success: {}", 
                    operationType, latencyMs, promptLength, responseLength, success);
        } catch (Exception e) {
            log.error("Failed to log AI metrics: {}", e.getMessage());
        }
    }
    
    public void logTranslationEvaluation(int promptLength, int responseLength, long latencyMs, 
                                        boolean success, String errorMessage, Double accuracy, 
                                        Integer difficultyLevel, Long userId) {
        logMetrics("EVALUATE_TRANSLATION", promptLength, responseLength, latencyMs, 
                  success, errorMessage, accuracy, difficultyLevel, userId);
    }
    
    public void logWordTranslation(int promptLength, int responseLength, long latencyMs, 
                                   boolean success, String errorMessage) {
        logMetrics("TRANSLATE_WORD", promptLength, responseLength, latencyMs, 
                  success, errorMessage, null, null, null);
    }
    
    public void logParagraphGeneration(int promptLength, int responseLength, long latencyMs, 
                                      boolean success, String errorMessage, Integer difficultyLevel) {
        logMetrics("GENERATE_PARAGRAPH", promptLength, responseLength, latencyMs, 
                  success, errorMessage, null, difficultyLevel, null);
    }
}
