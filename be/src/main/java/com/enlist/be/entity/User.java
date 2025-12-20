package com.enlist.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    @Column(name = "total_points")
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "credits")
    @Builder.Default
    private Integer credits = 10;

    @Column(name = "sessions_completed")
    @Builder.Default
    private Integer sessionsCompleted = 0;

    @Column(name = "daily_goal")
    @Builder.Default
    private Integer dailyGoal = 10;

    @Column(name = "daily_progress_count")
    @Builder.Default
    private Integer dailyProgressCount = 0;

    @Column(name = "last_progress_reset_date")
    private LocalDate lastProgressResetDate;

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

    public void addPoints(int points) {
        this.totalPoints += points;
    }

    public boolean spendCredits(int amount) {
        if (this.credits >= amount) {
            this.credits -= amount;
            return true;
        }
        return false;
    }

    public void earnCredits(int amount) {
        this.credits += amount;
    }

    public void incrementSessionsCompleted() {
        this.sessionsCompleted++;
    }
}
