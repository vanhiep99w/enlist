package com.enlist.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sentence_submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SentenceSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ParagraphSession session;

    @Column(name = "sentence_index", nullable = false)
    private Integer sentenceIndex;

    @Column(name = "original_sentence", columnDefinition = "TEXT")
    private String originalSentence;

    @Column(name = "user_translation", columnDefinition = "TEXT")
    private String userTranslation;

    @Column(name = "correct_translation", columnDefinition = "TEXT")
    private String correctTranslation;

    @Builder.Default
    private Double accuracy = 0.0;

    @Column(name = "grammar_score")
    private Integer grammarScore;

    @Column(name = "word_choice_score")
    private Integer wordChoiceScore;

    @Column(name = "naturalness_score")
    private Integer naturalnessScore;

    @Column(name = "feedback_json", columnDefinition = "TEXT")
    private String feedbackJson;

    @Column(name = "points_earned")
    @Builder.Default
    private Integer pointsEarned = 0;

    private Boolean skipped;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "retry_attempt")
    @Builder.Default
    private Integer retryAttempt = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_submission_id")
    private SentenceSubmission parentSubmission;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
