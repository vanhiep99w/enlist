package com.enlist.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "session_summaries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private ParagraphSession session;

    @Column(name = "paragraph_id", nullable = false)
    private Long paragraphId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "total_sentences", nullable = false)
    private Integer totalSentences;

    @Column(name = "completed_sentences", nullable = false)
    private Integer completedSentences;

    @Column(name = "average_accuracy", nullable = false)
    private Double averageAccuracy;

    @Column(name = "total_errors", nullable = false)
    @Builder.Default
    private Integer totalErrors = 0;

    @Column(name = "grammar_errors", nullable = false)
    @Builder.Default
    private Integer grammarErrors = 0;

    @Column(name = "word_choice_errors", nullable = false)
    @Builder.Default
    private Integer wordChoiceErrors = 0;

    @Column(name = "naturalness_errors", nullable = false)
    @Builder.Default
    private Integer naturalnessErrors = 0;

    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "errors_json", columnDefinition = "TEXT")
    private String errorsJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
