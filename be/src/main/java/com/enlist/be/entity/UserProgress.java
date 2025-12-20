package com.enlist.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "sentences_completed")
    @Builder.Default
    private Integer sentencesCompleted = 0;

    @Column(name = "accuracy_rate")
    @Builder.Default
    private Double accuracyRate = 0.0;

    @Column(name = "total_attempts")
    @Builder.Default
    private Integer totalAttempts = 0;

    @Column(name = "successful_attempts")
    @Builder.Default
    private Integer successfulAttempts = 0;

    @Column(name = "points_earned")
    @Builder.Default
    private Integer pointsEarned = 0;

    @Column(name = "time_spent_minutes")
    @Builder.Default
    private Integer timeSpentMinutes = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void incrementSentences() {
        this.sentencesCompleted++;
    }

    public void recordAttempt(boolean successful) {
        this.totalAttempts++;
        if (successful) {
            this.successfulAttempts++;
        }
        updateAccuracyRate();
    }

    public void addPoints(int points) {
        this.pointsEarned += points;
    }

    public void addTimeSpent(int minutes) {
        this.timeSpentMinutes += minutes;
    }

    private void updateAccuracyRate() {
        if (this.totalAttempts > 0) {
            this.accuracyRate = (double) this.successfulAttempts / this.totalAttempts * 100;
        }
    }
}
