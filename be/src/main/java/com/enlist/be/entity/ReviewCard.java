package com.enlist.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "review_cards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sentence_id", nullable = false)
    private Long sentenceId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "next_review_date", nullable = false)
    private LocalDateTime nextReviewDate;

    @Column(name = "interval_days", nullable = false)
    @Builder.Default
    private Integer intervalDays = 1;

    @Column(name = "ease_factor", nullable = false)
    @Builder.Default
    private Double easeFactor = 2.5;

    @Column(name = "repetitions")
    @Builder.Default
    private Integer repetitions = 0;

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
}
