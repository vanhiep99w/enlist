package com.enlist.be.service;

import com.enlist.be.dto.RandomSessionCreateRequest;
import com.enlist.be.dto.RandomSessionResponse;
import com.enlist.be.entity.Paragraph;
import com.enlist.be.entity.ParagraphSession;
import com.enlist.be.entity.RandomSession;
import com.enlist.be.entity.RandomSessionParagraph;
import com.enlist.be.repository.ParagraphRepository;
import com.enlist.be.repository.ParagraphSessionRepository;
import com.enlist.be.repository.RandomSessionParagraphRepository;
import com.enlist.be.repository.RandomSessionRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RandomSessionService {

    private final RandomSessionRepository randomSessionRepository;
    private final RandomSessionParagraphRepository randomSessionParagraphRepository;
    private final ParagraphRepository paragraphRepository;
    private final ParagraphSessionRepository paragraphSessionRepository;
    private final AIService aiService;
    private final ParagraphCacheService paragraphCacheService;
    private final RateLimitService rateLimitService;
    private final EntityManager entityManager;

    @Transactional
    public RandomSessionResponse createRandomSession(Long userId, RandomSessionCreateRequest request) {
        Integer initialDifficulty = request.getInitialDifficulty() != null 
                ? Math.min(Math.max(request.getInitialDifficulty(), 1), 10) 
                : 1;

        RandomSession randomSession = RandomSession.builder()
                .userId(userId)
                .status(RandomSession.Status.ACTIVE)
                .currentDifficulty(initialDifficulty)
                .initialDifficulty(initialDifficulty)
                .targetLanguage(request.getTargetLanguage() != null ? request.getTargetLanguage() : "en")
                .totalParagraphsCompleted(0)
                .totalPoints(0)
                .totalCredits(0)
                .averageAccuracy(0.0)
                .startedAt(LocalDateTime.now())
                .build();

        RandomSession saved = randomSessionRepository.save(randomSession);
        randomSessionRepository.flush();

        log.info("Created random session with ID: {}", saved.getId());

        // Generate first paragraph
        RandomSessionResponse response = generateNextParagraph(saved);

        log.info("Generated response - currentParagraph: {}, paragraphs count: {}", 
                response.getCurrentParagraph() != null ? response.getCurrentParagraph().getId() : "null",
                response.getParagraphs() != null ? response.getParagraphs().size() : 0);

        return response;
    }

    public RandomSessionResponse getRandomSession(Long randomSessionId) {
        RandomSession session = randomSessionRepository.findByIdWithParagraphs(randomSessionId)
                .orElseThrow(() -> new RuntimeException("Random session not found: " + randomSessionId));
        return RandomSessionResponse.fromEntity(session);
    }

    @Transactional
    public RandomSessionResponse endRandomSession(Long randomSessionId) {
        RandomSession session = randomSessionRepository.findById(randomSessionId)
                .orElseThrow(() -> new RuntimeException("Random session not found: " + randomSessionId));

        session.complete();
        randomSessionRepository.save(session);

        return RandomSessionResponse.fromEntity(session);
    }

    public List<RandomSessionResponse> getUserRandomSessions(Long userId) {
        List<RandomSession> sessions = randomSessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return sessions.stream()
                .map(RandomSessionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public RandomSessionResponse generateNextParagraphForSession(Long randomSessionId) {
        RandomSession session = randomSessionRepository.findById(randomSessionId)
                .orElseThrow(() -> new RuntimeException("Random session not found: " + randomSessionId));
        
        if (session.getStatus() != RandomSession.Status.ACTIVE) {
            throw new RuntimeException("Session is not active: " + randomSessionId);
        }
        
        return generateNextParagraph(session);
    }

    @Transactional
    public RandomSessionResponse generateNextParagraph(RandomSession randomSession) {
        Paragraph selectedParagraph = null;
        
        try {
            // Try to generate AI paragraph
            String generatedContent = generateAIParagraph(randomSession);
            
            // Create a new paragraph entity for the AI-generated content
            selectedParagraph = Paragraph.builder()
                    .title("AI Generated - Level " + randomSession.getCurrentDifficulty())
                    .content(generatedContent)
                    .difficulty(mapDifficultyToString(randomSession.getCurrentDifficulty()))
                    .topic("AI Generated")
                    .build();
            
            selectedParagraph = paragraphRepository.save(selectedParagraph);
            paragraphRepository.flush();
            
        } catch (Exception e) {
            log.error("Failed to generate AI paragraph for session {}: {}", 
                    randomSession.getId(), e.getMessage());
            // Fallback to pre-generated paragraph pool
            selectedParagraph = selectParagraphFromPool(randomSession);
        }
        
        if (selectedParagraph == null) {
            throw new RuntimeException("No paragraphs available for difficulty: " 
                    + randomSession.getCurrentDifficulty());
        }

        return createRandomSessionParagraph(randomSession, selectedParagraph);
    }

    private String generateAIParagraph(RandomSession randomSession) {
        // Check rate limit before generating
        if (!rateLimitService.canGenerateParagraph(randomSession.getUserId())) {
            log.warn("Rate limit exceeded for user {}, falling back to curated content",
                randomSession.getUserId());
            throw new RateLimitExceededException("AI paragraph generation limit exceeded");
        }

        // Collect error summary and vocab suggestions from recent paragraphs
        List<RandomSessionParagraph> recentParagraphs = randomSessionParagraphRepository
                .findByRandomSessionIdOrderByOrderIndexAsc(randomSession.getId())
                .stream()
                .filter(p -> p.getStatus() == RandomSessionParagraph.Status.COMPLETED)
                .toList();

        String errorSummary = null;
        String vocabSuggestions = null;
        String previousParagraphContent = null;

        if (!recentParagraphs.isEmpty()) {
            // Get the last completed paragraph's error summary
            RandomSessionParagraph lastParagraph = recentParagraphs.get(recentParagraphs.size() - 1);
            errorSummary = lastParagraph.getErrorSummaryJson();
            vocabSuggestions = lastParagraph.getVocabTargetedJson();
            
            // Get previous paragraph content for context
            try {
                if (lastParagraph.getParagraph() != null) {
                    previousParagraphContent = lastParagraph.getParagraph().getContent();
                }
            } catch (Exception e) {
                log.warn("Could not load previous paragraph content: {}", e.getMessage());
            }
        }

        // Use cache service for better performance
        String result = paragraphCacheService.getCachedParagraph(
                randomSession.getCurrentDifficulty(),
                randomSession.getTargetLanguage(),
                errorSummary,
                vocabSuggestions,
                previousParagraphContent
        );

        // Record successful generation for rate limiting
        rateLimitService.recordParagraphGeneration(randomSession.getUserId());

        return result;
    }

    private Paragraph selectParagraphFromPool(RandomSession randomSession) {
        // Get a random paragraph matching the current difficulty
        String difficultyString = mapDifficultyToString(randomSession.getCurrentDifficulty());
        
        List<Paragraph> paragraphs = paragraphRepository.findByDifficulty(difficultyString);
        
        if (paragraphs.isEmpty()) {
            log.warn("No paragraphs found for difficulty: {}, trying fallback", difficultyString);
            // Fallback to all paragraphs
            paragraphs = paragraphRepository.findAll();
            if (paragraphs.isEmpty()) {
                return null;
            }
        }

        // Select a random paragraph
        return paragraphs.get((int) (Math.random() * paragraphs.size()));
    }

    private RandomSessionResponse createRandomSessionParagraph(RandomSession randomSession, 
                                                                Paragraph selectedParagraph) {

        // Create ParagraphSession for the selected paragraph
        ParagraphSession paragraphSession = ParagraphSession.builder()
                .userId(randomSession.getUserId())
                .paragraph(selectedParagraph)
                .currentSentenceIndex(0)
                .status(ParagraphSession.Status.NOT_STARTED)
                .totalPoints(0)
                .totalCredits(6)
                .build();
        
        ParagraphSession savedParagraphSession = paragraphSessionRepository.save(paragraphSession);

        log.info("Created ParagraphSession with ID: {}", savedParagraphSession.getId());

        // Create RandomSessionParagraph linking to the paragraph session
        int nextOrderIndex = randomSessionParagraphRepository
                .findByRandomSessionIdOrderByOrderIndexAsc(randomSession.getId())
                .stream()
                .mapToInt(RandomSessionParagraph::getOrderIndex)
                .max()
                .orElse(-1) + 1;

        RandomSessionParagraph randomSessionParagraph = RandomSessionParagraph.builder()
                .randomSession(randomSession)
                .paragraph(selectedParagraph)
                .paragraphSession(savedParagraphSession)
                .orderIndex(nextOrderIndex)
                .difficultyLevel(randomSession.getCurrentDifficulty())
                .status(RandomSessionParagraph.Status.PENDING)
                .build();

        RandomSessionParagraph savedRsp = randomSessionParagraphRepository.save(randomSessionParagraph);
        randomSessionParagraphRepository.flush();

        log.info("Created RandomSessionParagraph with ID: {}, paragraphSessionId: {}", 
                savedRsp.getId(), savedRsp.getParagraphSession().getId());

        // Clear first-level cache and query fresh
        entityManager.flush();
        entityManager.clear();

        // Query to get the updated session with all paragraphs
        RandomSession refreshed = randomSessionRepository.findByIdWithParagraphs(randomSession.getId())
                .orElseThrow(() -> new RuntimeException("Random session not found"));

        log.info("Refreshed session has {} paragraphs", refreshed.getParagraphs().size());
        if (!refreshed.getParagraphs().isEmpty()) {
            log.info("First paragraph session ID: {}", 
                    refreshed.getParagraphs().get(0).getParagraphSession().getId());
        }

        return RandomSessionResponse.fromEntity(refreshed);
    }

    private String mapDifficultyToString(Integer difficultyLevel) {
        if (difficultyLevel <= 3) {
            return "easy";
        } else if (difficultyLevel <= 6) {
            return "medium";
        } else {
            return "hard";
        }
    }

    @Transactional
    public void onParagraphSessionCompleted(Long paragraphSessionId, Double accuracy, 
                                            Integer timeSpent, Integer points, Integer credits) {
        RandomSessionParagraph rsp = randomSessionParagraphRepository.findByParagraphSessionId(paragraphSessionId)
                .orElseThrow(() -> new RuntimeException("Not part of a random session"));

        rsp.complete(accuracy, timeSpent, points, credits);
        randomSessionParagraphRepository.save(rsp);

        RandomSession randomSession = rsp.getRandomSession();
        randomSession.incrementParagraphsCompleted();
        randomSession.setTotalPoints(randomSession.getTotalPoints() + points);
        randomSession.setTotalCredits(randomSession.getTotalCredits() + credits);

        // Update average accuracy
        List<RandomSessionParagraph> completedParagraphs = randomSessionParagraphRepository
                .findByRandomSessionIdAndStatus(randomSession.getId(), RandomSessionParagraph.Status.COMPLETED);
        
        if (!completedParagraphs.isEmpty()) {
            double avgAccuracy = completedParagraphs.stream()
                    .filter(p -> p.getAccuracy() != null)
                    .mapToDouble(RandomSessionParagraph::getAccuracy)
                    .average()
                    .orElse(0.0);
            randomSession.setAverageAccuracy(avgAccuracy);
        }

        randomSessionRepository.save(randomSession);

        // Adjust difficulty and generate next paragraph
        adjustDifficultyAndGenerateNext(randomSession, accuracy);
    }

    @Transactional
    public void onParagraphCompleted(Long randomSessionParagraphId, Double accuracy, Integer timeSpent, 
                                     Integer points, Integer credits) {
        RandomSessionParagraph rsp = randomSessionParagraphRepository.findById(randomSessionParagraphId)
                .orElseThrow(() -> new RuntimeException("RandomSessionParagraph not found"));

        rsp.complete(accuracy, timeSpent, points, credits);
        randomSessionParagraphRepository.save(rsp);

        RandomSession randomSession = rsp.getRandomSession();
        randomSession.incrementParagraphsCompleted();
        randomSession.setTotalPoints(randomSession.getTotalPoints() + points);
        randomSession.setTotalCredits(randomSession.getTotalCredits() + credits);

        // Update average accuracy
        List<RandomSessionParagraph> completedParagraphs = randomSessionParagraphRepository
                .findByRandomSessionIdAndStatus(randomSession.getId(), RandomSessionParagraph.Status.COMPLETED);
        
        if (!completedParagraphs.isEmpty()) {
            double avgAccuracy = completedParagraphs.stream()
                    .filter(p -> p.getAccuracy() != null)
                    .mapToDouble(RandomSessionParagraph::getAccuracy)
                    .average()
                    .orElse(0.0);
            randomSession.setAverageAccuracy(avgAccuracy);
        }

        randomSessionRepository.save(randomSession);

        // Adjust difficulty and generate next paragraph
        adjustDifficultyAndGenerateNext(randomSession, accuracy);
    }

    private void adjustDifficultyAndGenerateNext(RandomSession randomSession, Double recentAccuracy) {
        Integer currentDifficulty = randomSession.getCurrentDifficulty();
        Integer newDifficulty = currentDifficulty;

        // More gradual difficulty progression
        if (recentAccuracy >= 95.0) {
            // Excellent performance - increase by 1
            newDifficulty = Math.min(currentDifficulty + 1, 10);
        } else if (recentAccuracy >= 85.0) {
            // Good performance - keep same difficulty or slight increase every 2-3 paragraphs
            int completedCount = randomSession.getTotalParagraphsCompleted();
            if (completedCount % 2 == 0 && currentDifficulty < 10) {
                newDifficulty = currentDifficulty + 1;
            }
        } else if (recentAccuracy >= 70.0) {
            // Acceptable performance - maintain current difficulty
        } else if (recentAccuracy >= 50.0) {
            // Struggling - decrease by 1
            newDifficulty = Math.max(currentDifficulty - 1, 1);
        } else {
            // Very poor performance - decrease by 2 to provide easier content
            newDifficulty = Math.max(currentDifficulty - 2, 1);
        }

        randomSession.updateDifficulty(newDifficulty);
        randomSessionRepository.save(randomSession);

        log.info("Adjusted difficulty from {} to {} based on accuracy {}", 
                currentDifficulty, newDifficulty, recentAccuracy);

        // Generate next paragraph
        generateNextParagraph(randomSession);
    }
}
