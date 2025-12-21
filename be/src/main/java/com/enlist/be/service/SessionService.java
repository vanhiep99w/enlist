package com.enlist.be.service;

import com.enlist.be.dto.*;
import com.enlist.be.entity.ErrorAnalytics;
import com.enlist.be.entity.Paragraph;
import com.enlist.be.entity.ParagraphSession;
import com.enlist.be.entity.SentenceSubmission;
import com.enlist.be.entity.SessionSummary;
import com.enlist.be.repository.ErrorAnalyticsRepository;
import com.enlist.be.repository.ParagraphRepository;
import com.enlist.be.repository.ParagraphSessionRepository;
import com.enlist.be.repository.SentenceSubmissionRepository;
import com.enlist.be.repository.SessionSummaryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final ParagraphRepository paragraphRepository;
    private final ParagraphSessionRepository sessionRepository;
    private final SentenceSubmissionRepository submissionRepository;
    private final SessionSummaryRepository sessionSummaryRepository;
    private final ErrorAnalyticsRepository errorAnalyticsRepository;
    private final AIService aiService;
    private final CreditsService creditsService;
    private final DailyGoalService dailyGoalService;
    private final ReviewService reviewService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public SessionResponse createSession(Long userId, SessionCreateRequest request) {
        Paragraph paragraph = paragraphRepository.findById(request.getParagraphId())
                .orElseThrow(() -> new RuntimeException("Paragraph not found: " + request.getParagraphId()));

        var existingSession = sessionRepository.findFirstByUserIdAndParagraphIdAndStatusOrderByIdDesc(
                userId, request.getParagraphId(), ParagraphSession.Status.IN_PROGRESS);
        
        if (existingSession.isPresent()) {
            return SessionResponse.fromEntity(existingSession.get());
        }

        ParagraphSession session = ParagraphSession.builder()
                .userId(userId)
                .paragraph(paragraph)
                .currentSentenceIndex(0)
                .status(ParagraphSession.Status.IN_PROGRESS)
                .totalPoints(0)
                .totalCredits(6)
                .build();

        ParagraphSession saved = sessionRepository.save(session);
        return SessionResponse.fromEntity(saved);
    }

    public SessionResponse getSession(Long sessionId) {
        ParagraphSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        return SessionResponse.fromEntity(session);
    }

    @Transactional
    public SentenceSubmissionResponse submitTranslation(Long sessionId, SentenceSubmitRequest request) {
        ParagraphSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        if (session.getStatus() != ParagraphSession.Status.IN_PROGRESS) {
            throw new RuntimeException("Session is not in progress");
        }

        Paragraph paragraph = session.getParagraph();
        List<String> sentences = paragraph.getSentences();
        
        boolean isRetry = Boolean.TRUE.equals(request.getIsRetry()) && request.getParentSubmissionId() != null;
        SentenceSubmission parentSubmission = null;
        int currentIndex;
        
        if (isRetry) {
            parentSubmission = submissionRepository.findById(request.getParentSubmissionId())
                    .orElseThrow(() -> new RuntimeException("Parent submission not found: " + request.getParentSubmissionId()));
            currentIndex = parentSubmission.getSentenceIndex();
        } else {
            currentIndex = session.getCurrentSentenceIndex();
        }

        if (currentIndex >= sentences.size()) {
            throw new RuntimeException("No more sentences to translate");
        }

        String originalSentence = sentences.get(currentIndex);
        
        // Get paragraph context and previous translations for tense consistency
        String paragraphContext = paragraph.getContent();
        List<String> previousTranslations = session.getSubmissions().stream()
                .filter(s -> !Boolean.TRUE.equals(s.getSkipped()) && s.getCorrectTranslation() != null)
                .sorted((a, b) -> a.getSentenceIndex() - b.getSentenceIndex())
                .map(SentenceSubmission::getCorrectTranslation)
                .toList();
        
        TranslationFeedback feedback = aiService.evaluateTranslation(
                originalSentence, 
                request.getUserTranslation(),
                paragraphContext,
                previousTranslations
        );

        double accuracy = calculateAccuracy(feedback);
        int pointsEarned = isRetry ? 0 : calculatePoints(accuracy);

        String feedbackJson = null;
        try {
            feedbackJson = objectMapper.writeValueAsString(feedback);
        } catch (JsonProcessingException e) {
            log.error("Error serializing feedback", e);
        }

        int retryAttempt = 0;
        if (isRetry) {
            retryAttempt = (parentSubmission.getRetryAttempt() != null ? parentSubmission.getRetryAttempt() : 0) + 1;
        }

        SentenceSubmission submission = SentenceSubmission.builder()
                .session(session)
                .sentenceIndex(currentIndex)
                .originalSentence(originalSentence)
                .userTranslation(request.getUserTranslation())
                .correctTranslation(feedback.getCorrectTranslation())
                .accuracy(accuracy)
                .grammarScore(feedback.getScores() != null ? feedback.getScores().getGrammarScore() : null)
                .wordChoiceScore(feedback.getScores() != null ? feedback.getScores().getWordChoiceScore() : null)
                .naturalnessScore(feedback.getScores() != null ? feedback.getScores().getNaturalnessScore() : null)
                .feedbackJson(feedbackJson)
                .pointsEarned(pointsEarned)
                .skipped(false)
                .retryAttempt(retryAttempt)
                .parentSubmission(parentSubmission)
                .build();

        submissionRepository.save(submission);

        trackErrors(session.getUserId(), feedback);

        if (!isRetry) {
            session.setTotalPoints(session.getTotalPoints() + pointsEarned);
        }

        if (accuracy < 80.0 && !isRetry) {
            reviewService.addToReviewQueue(session.getUserId(), submission.getId());
        }

        boolean passedThreshold = accuracy >= 80.0;
        boolean isLastSentence = session.isLastSentence();
        int nextIndex = currentIndex;
        String nextSentence = null;

        // Increment daily progress when user passes a sentence (not retry)
        if (passedThreshold && !isRetry) {
            dailyGoalService.incrementDailyProgress(session.getUserId());
            
            if (!isLastSentence) {
                session.advanceToNextSentence();
                nextIndex = session.getCurrentSentenceIndex();
                nextSentence = sentences.get(nextIndex);
            } else {
                session.complete();
                createSessionSummary(session);
                creditsService.awardPointsForSession(session.getUserId(), session.getTotalPoints(), true);
            }
        } else if (isLastSentence && !passedThreshold) {
            // If failed the last sentence, still mark as complete (user finished all attempts)
            session.complete();
            createSessionSummary(session);
            creditsService.awardPointsForSession(session.getUserId(), session.getTotalPoints(), true);
        }

        sessionRepository.save(session);

        return SentenceSubmissionResponse.fromEntity(submission, feedback, isLastSentence, nextIndex, nextSentence);
    }

    @Transactional
    public SentenceSubmissionResponse skipSentence(Long sessionId) {
        ParagraphSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        if (session.getStatus() != ParagraphSession.Status.IN_PROGRESS) {
            throw new RuntimeException("Session is not in progress");
        }

        if (session.getTotalCredits() <= 0) {
            throw new RuntimeException("No credits remaining to skip");
        }

        Paragraph paragraph = session.getParagraph();
        List<String> sentences = paragraph.getSentences();
        int currentIndex = session.getCurrentSentenceIndex();

        String originalSentence = sentences.get(currentIndex);

        SentenceSubmission submission = SentenceSubmission.builder()
                .session(session)
                .sentenceIndex(currentIndex)
                .originalSentence(originalSentence)
                .skipped(true)
                .pointsEarned(0)
                .accuracy(0.0)
                .build();

        submissionRepository.save(submission);

        session.setTotalCredits(session.getTotalCredits() - 1);

        boolean isLastSentence = session.isLastSentence();
        int nextIndex = currentIndex;
        String nextSentence = null;

        if (!isLastSentence) {
            session.advanceToNextSentence();
            nextIndex = session.getCurrentSentenceIndex();
            nextSentence = sentences.get(nextIndex);
        } else {
            session.complete();
            createSessionSummary(session);
            creditsService.awardPointsForSession(session.getUserId(), session.getTotalPoints(), true);
        }

        sessionRepository.save(session);

        return SentenceSubmissionResponse.fromEntity(submission, null, isLastSentence, nextIndex, nextSentence);
    }

    public SessionProgressResponse getProgress(Long sessionId) {
        ParagraphSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        int totalSentences = session.getParagraph().getSentenceCount();
        int completedSentences = session.getCompletedSentenceCount();
        double progressPercentage = totalSentences > 0 ? (completedSentences * 100.0 / totalSentences) : 0;

        return SessionProgressResponse.builder()
                .sessionId(session.getId())
                .completedSentences(completedSentences)
                .totalSentences(totalSentences)
                .progressPercentage(progressPercentage)
                .averageAccuracy(session.getAverageAccuracy())
                .totalPoints(session.getTotalPoints())
                .status(session.getStatus().name())
                .build();
    }

    public List<SessionResponse> getUserSessions(Long userId) {
        return sessionRepository.findByUserId(userId).stream()
                .map(SessionResponse::fromEntity)
                .toList();
    }

    private double calculateAccuracy(TranslationFeedback feedback) {
        if (feedback.getScores() == null) {
            return 0.0;
        }
        ScoreBreakdown scores = feedback.getScores();
        int grammar = scores.getGrammarScore();
        int wordChoice = scores.getWordChoiceScore();
        int naturalness = scores.getNaturalnessScore();
        return (grammar + wordChoice + naturalness) / 3.0;
    }

    private int calculatePoints(double accuracy) {
        if (accuracy >= 90) return 20;
        if (accuracy >= 80) return 15;
        if (accuracy >= 70) return 10;
        if (accuracy >= 60) return 5;
        return 2;
    }

    private void trackErrors(Long userId, TranslationFeedback feedback) {
        if (feedback == null || feedback.getScores() == null) {
            return;
        }

        ScoreBreakdown scores = feedback.getScores();
        
        if (scores.getGrammarScore() < 80) {
            trackErrorCategory(userId, ErrorAnalytics.ErrorType.GRAMMAR, extractGrammarCategory(feedback));
        }
        
        if (scores.getWordChoiceScore() < 80) {
            trackErrorCategory(userId, ErrorAnalytics.ErrorType.WORD_CHOICE, extractWordChoiceCategory(feedback));
        }
        
        if (scores.getNaturalnessScore() < 80) {
            trackErrorCategory(userId, ErrorAnalytics.ErrorType.NATURALNESS, extractNaturalnessCategory(feedback));
        }
    }

    private void trackErrorCategory(Long userId, ErrorAnalytics.ErrorType errorType, String errorCategory) {
        if (errorCategory == null || errorCategory.isEmpty()) {
            errorCategory = "general";
        }

        var existingError = errorAnalyticsRepository.findByUserIdAndErrorTypeAndErrorCategory(
                userId, errorType, errorCategory);

        if (existingError.isPresent()) {
            ErrorAnalytics error = existingError.get();
            error.incrementCount();
            errorAnalyticsRepository.save(error);
        } else {
            ErrorAnalytics newError = ErrorAnalytics.builder()
                    .userId(userId)
                    .errorType(errorType)
                    .errorCategory(errorCategory)
                    .count(1)
                    .lastOccurrence(LocalDateTime.now())
                    .build();
            errorAnalyticsRepository.save(newError);
        }
    }

    private String extractGrammarCategory(TranslationFeedback feedback) {
        if (feedback.getErrors() == null || feedback.getErrors().isEmpty()) {
            return "general";
        }
        
        for (TranslationError error : feedback.getErrors()) {
            String errorType = error.getType().toLowerCase();
            if (errorType.contains("article")) return "article";
            if (errorType.contains("tense") || errorType.contains("verb")) return "verb_tense";
            if (errorType.contains("preposition")) return "preposition";
            if (errorType.contains("agreement") || errorType.contains("subject")) return "agreement";
            if (errorType.contains("plural") || errorType.contains("number")) return "number";
        }
        
        return "general";
    }

    private String extractWordChoiceCategory(TranslationFeedback feedback) {
        if (feedback.getErrors() == null || feedback.getErrors().isEmpty()) {
            return "general";
        }
        
        for (TranslationError error : feedback.getErrors()) {
            String errorType = error.getType().toLowerCase();
            if (errorType.contains("vocabulary") || errorType.contains("word")) return "vocabulary";
            if (errorType.contains("synonym")) return "synonym";
            if (errorType.contains("collocation")) return "collocation";
        }
        
        return "general";
    }

    private String extractNaturalnessCategory(TranslationFeedback feedback) {
        if (feedback.getErrors() == null || feedback.getErrors().isEmpty()) {
            return "general";
        }
        
        for (TranslationError error : feedback.getErrors()) {
            String errorType = error.getType().toLowerCase();
            if (errorType.contains("flow") || errorType.contains("fluency")) return "flow";
            if (errorType.contains("awkward") || errorType.contains("natural")) return "awkwardness";
            if (errorType.contains("idiom")) return "idiom";
        }
        
        return "general";
    }

    private void createSessionSummary(ParagraphSession session) {
        List<SentenceSubmission> submissions = session.getSubmissions();
        int grammarErrors = 0;
        int wordChoiceErrors = 0;
        int naturalnessErrors = 0;
        int totalErrors = 0;

        List<Map<String, Object>> allErrors = new ArrayList<>();

        for (SentenceSubmission submission : submissions) {
            if (Boolean.TRUE.equals(submission.getSkipped())) {
                continue;
            }

            if (submission.getFeedbackJson() != null) {
                try {
                    Map<String, Object> feedback = objectMapper.readValue(
                        submission.getFeedbackJson(), 
                        new TypeReference<Map<String, Object>>() {}
                    );
                    
                    Object errorsObj = feedback.get("errors");
                    if (errorsObj instanceof List<?>) {
                        List<?> errors = (List<?>) errorsObj;
                        for (Object errorObj : errors) {
                            if (errorObj instanceof Map<?, ?>) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> errorMap = (Map<String, Object>) errorObj;
                                String type = (String) errorMap.get("type");
                                
                                if (type != null) {
                                    String typeLower = type.toLowerCase();
                                    if (typeLower.contains("grammar")
                                            || typeLower.contains("tense")
                                            || typeLower.contains("article")
                                            || typeLower.contains("preposition")) {
                                        grammarErrors++;
                                    } else if (typeLower.contains("word")
                                            || typeLower.contains("vocabulary")) {
                                        wordChoiceErrors++;
                                    } else if (typeLower.contains("natural")
                                            || typeLower.contains("flow")) {
                                        naturalnessErrors++;
                                    }
                                    totalErrors++;

                                    Map<String, Object> errorDetail = Map.of(
                                        "sentenceIndex", submission.getSentenceIndex(),
                                        "originalSentence", submission.getOriginalSentence() != null
                                                ? submission.getOriginalSentence() : "",
                                        "userTranslation", submission.getUserTranslation() != null
                                                ? submission.getUserTranslation() : "",
                                        "type", type,
                                        "quickFix", errorMap.get("quickFix") != null
                                                ? errorMap.get("quickFix") : "",
                                        "correction", errorMap.get("correction") != null
                                                ? errorMap.get("correction") : ""
                                    );
                                    allErrors.add(errorDetail);
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("Error parsing feedback JSON for summary", e);
                }
            }
        }

        String errorsJson = null;
        try {
            errorsJson = objectMapper.writeValueAsString(allErrors);
        } catch (JsonProcessingException e) {
            log.error("Error serializing errors JSON", e);
        }

        SessionSummary summary = SessionSummary.builder()
            .session(session)
            .paragraphId(session.getParagraph().getId())
            .userId(session.getUserId())
            .totalSentences(session.getParagraph().getSentenceCount())
            .completedSentences(session.getCompletedSentenceCount())
            .averageAccuracy(session.getAverageAccuracy())
            .totalErrors(totalErrors)
            .grammarErrors(grammarErrors)
            .wordChoiceErrors(wordChoiceErrors)
            .naturalnessErrors(naturalnessErrors)
            .totalPoints(session.getTotalPoints())
            .errorsJson(errorsJson)
            .build();

        sessionSummaryRepository.save(summary);
    }

    public SessionSummaryResponse getSessionSummary(Long sessionId) {
        ParagraphSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        // Check if session is completed
        if (session.getStatus() != ParagraphSession.Status.COMPLETED) {
            throw new RuntimeException("Session not completed yet: " + sessionId);
        }

        SessionSummary summary = sessionSummaryRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new RuntimeException("Session summary not found: " + sessionId));

        List<SessionSummaryResponse.ErrorDetail> errorDetails = new ArrayList<>();
        if (summary.getErrorsJson() != null) {
            try {
                List<Map<String, Object>> errors = objectMapper.readValue(
                    summary.getErrorsJson(),
                    new TypeReference<List<Map<String, Object>>>() {}
                );
                
                for (Map<String, Object> error : errors) {
                    errorDetails.add(SessionSummaryResponse.ErrorDetail.builder()
                        .sentenceIndex((Integer) error.get("sentenceIndex"))
                        .originalSentence((String) error.get("originalSentence"))
                        .userTranslation((String) error.get("userTranslation"))
                        .type((String) error.get("type"))
                        .quickFix((String) error.get("quickFix"))
                        .correction((String) error.get("correction"))
                        .build());
                }
            } catch (Exception e) {
                log.error("Error parsing errors JSON", e);
            }
        }

        return SessionSummaryResponse.builder()
            .sessionId(session.getId())
            .paragraphId(session.getParagraph().getId())
            .paragraphTitle(session.getParagraph().getTitle())
            .totalSentences(summary.getTotalSentences())
            .completedSentences(summary.getCompletedSentences())
            .averageAccuracy(summary.getAverageAccuracy())
            .totalErrors(summary.getTotalErrors())
            .totalPoints(summary.getTotalPoints())
            .completedAt(session.getCompletedAt())
            .errorBreakdown(SessionSummaryResponse.ErrorBreakdown.builder()
                .grammarErrors(summary.getGrammarErrors())
                .wordChoiceErrors(summary.getWordChoiceErrors())
                .naturalnessErrors(summary.getNaturalnessErrors())
                .build())
            .allErrors(errorDetails)
            .build();
    }
}
