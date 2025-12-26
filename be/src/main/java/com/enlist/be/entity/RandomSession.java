package com.enlist.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "random_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RandomSession {

    public enum Status {
        ACTIVE,
        COMPLETED,
        ABANDONED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "current_difficulty")
    @Builder.Default
    private Integer currentDifficulty = 1;

    @Column(name = "initial_difficulty")
    @Builder.Default
    private Integer initialDifficulty = 1;

    @Column(name = "target_language")
    private String targetLanguage;

    @Column(name = "config_json", columnDefinition = "TEXT")
    private String configJson;

    @Column(name = "total_paragraphs_completed")
    @Builder.Default
    private Integer totalParagraphsCompleted = 0;

    @Column(name = "total_points")
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "total_credits")
    @Builder.Default
    private Integer totalCredits = 0;

    @Column(name = "average_accuracy")
    @Builder.Default
    private Double averageAccuracy = 0.0;

    @OneToMany(mappedBy = "randomSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RandomSessionParagraph> paragraphs = new ArrayList<>();

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void complete() {
        this.status = Status.COMPLETED;
        this.endedAt = LocalDateTime.now();
    }

    public void abandon() {
        this.status = Status.ABANDONED;
        this.endedAt = LocalDateTime.now();
    }

    public void incrementParagraphsCompleted() {
        this.totalParagraphsCompleted++;
    }

    public void updateDifficulty(Integer newDifficulty) {
        if (newDifficulty >= 1 && newDifficulty <= 10) {
            this.currentDifficulty = newDifficulty;
        }
    }
}
