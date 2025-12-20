package com.enlist.be.dto;

import com.enlist.be.entity.SentenceSubmission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SentenceSubmissionResponse {
    private Long id;
    private int sentenceIndex;
    private String originalSentence;
    private String userTranslation;
    private String correctTranslation;
    private double accuracy;
    private Integer grammarScore;
    private Integer wordChoiceScore;
    private Integer naturalnessScore;
    private int pointsEarned;
    private boolean skipped;
    private int retryAttempt;
    private Long parentSubmissionId;
    private boolean isLastSentence;
    private int nextSentenceIndex;
    private String nextSentence;
    private LocalDateTime submittedAt;
    private TranslationFeedback feedback;

    public static SentenceSubmissionResponse fromEntity(SentenceSubmission submission, TranslationFeedback feedback, boolean isLastSentence, int nextSentenceIndex, String nextSentence) {
        return SentenceSubmissionResponse.builder()
                .id(submission.getId())
                .sentenceIndex(submission.getSentenceIndex())
                .originalSentence(submission.getOriginalSentence())
                .userTranslation(submission.getUserTranslation())
                .correctTranslation(submission.getCorrectTranslation())
                .accuracy(submission.getAccuracy())
                .grammarScore(submission.getGrammarScore())
                .wordChoiceScore(submission.getWordChoiceScore())
                .naturalnessScore(submission.getNaturalnessScore())
                .pointsEarned(submission.getPointsEarned())
                .skipped(Boolean.TRUE.equals(submission.getSkipped()))
                .retryAttempt(submission.getRetryAttempt() != null ? submission.getRetryAttempt() : 0)
                .parentSubmissionId(submission.getParentSubmission() != null ? submission.getParentSubmission().getId() : null)
                .isLastSentence(isLastSentence)
                .nextSentenceIndex(nextSentenceIndex)
                .nextSentence(nextSentence)
                .submittedAt(submission.getSubmittedAt())
                .feedback(feedback)
                .build();
    }
}
