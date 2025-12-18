package com.enlist.be.service;

import com.enlist.be.dto.*;
import com.enlist.be.entity.Paragraph;
import com.enlist.be.entity.ParagraphSession;
import com.enlist.be.entity.SentenceSubmission;
import com.enlist.be.repository.ParagraphRepository;
import com.enlist.be.repository.ParagraphSessionRepository;
import com.enlist.be.repository.SentenceSubmissionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final ParagraphRepository paragraphRepository;
    private final ParagraphSessionRepository sessionRepository;
    private final SentenceSubmissionRepository submissionRepository;
    private final AIService aiService;
    private final CreditsService creditsService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public SessionResponse createSession(SessionCreateRequest request) {
        Paragraph paragraph = paragraphRepository.findById(request.getParagraphId())
                .orElseThrow(() -> new RuntimeException("Paragraph not found: " + request.getParagraphId()));

        var existingSession = sessionRepository.findFirstByUserIdAndParagraphIdAndStatusOrderByIdDesc(
                request.getUserId(), request.getParagraphId(), ParagraphSession.Status.IN_PROGRESS);
        
        if (existingSession.isPresent()) {
            return SessionResponse.fromEntity(existingSession.get());
        }

        ParagraphSession session = ParagraphSession.builder()
                .userId(request.getUserId())
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
        int currentIndex = session.getCurrentSentenceIndex();

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
        int pointsEarned = calculatePoints(accuracy);

        String feedbackJson = null;
        try {
            feedbackJson = objectMapper.writeValueAsString(feedback);
        } catch (JsonProcessingException e) {
            log.error("Error serializing feedback", e);
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
                .build();

        submissionRepository.save(submission);

        session.setTotalPoints(session.getTotalPoints() + pointsEarned);

        boolean passedThreshold = accuracy >= 80.0;
        boolean isLastSentence = session.isLastSentence();
        int nextIndex = currentIndex;
        String nextSentence = null;

        if (passedThreshold) {
            if (!isLastSentence) {
                session.advanceToNextSentence();
                nextIndex = session.getCurrentSentenceIndex();
                nextSentence = sentences.get(nextIndex);
            } else {
                session.complete();
                creditsService.awardPointsForSession(session.getUserId(), session.getTotalPoints(), true);
            }
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
}
