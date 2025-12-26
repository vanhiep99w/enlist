package com.enlist.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "random_session_paragraphs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RandomSessionParagraph {

    public enum Status {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        SKIPPED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "random_session_id", nullable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private RandomSession randomSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paragraph_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Paragraph paragraph;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paragraph_session_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private ParagraphSession paragraphSession;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "difficulty_level", nullable = false)
    private Integer difficultyLevel;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "error_summary_json", columnDefinition = "TEXT")
    private String errorSummaryJson;

    @Column(name = "vocab_targeted_json", columnDefinition = "TEXT")
    private String vocabTargetedJson;

    @Column(name = "accuracy")
    private Double accuracy;

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;

    @Column(name = "points_earned")
    @Builder.Default
    private Integer pointsEarned = 0;

    @Column(name = "credits_earned")
    @Builder.Default
    private Integer creditsEarned = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void complete(Double accuracy, Integer timeSpent, Integer points, Integer credits) {
        this.status = Status.COMPLETED;
        this.accuracy = accuracy;
        this.timeSpentSeconds = timeSpent;
        this.pointsEarned = points;
        this.creditsEarned = credits;
        this.completedAt = LocalDateTime.now();
    }

    public void skip() {
        this.status = Status.SKIPPED;
        this.completedAt = LocalDateTime.now();
    }

    public void start() {
        this.status = Status.IN_PROGRESS;
    }
}
