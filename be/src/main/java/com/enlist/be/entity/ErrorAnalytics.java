package com.enlist.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "error_analytics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "error_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ErrorType errorType;

    @Column(name = "error_category", nullable = false)
    private String errorCategory;

    @Column(name = "count", nullable = false)
    @Builder.Default
    private Integer count = 1;

    @Column(name = "last_occurrence", nullable = false)
    private LocalDateTime lastOccurrence;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (lastOccurrence == null) {
            lastOccurrence = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void incrementCount() {
        this.count++;
        this.lastOccurrence = LocalDateTime.now();
    }

    public enum ErrorType {
        GRAMMAR,
        WORD_CHOICE,
        NATURALNESS
    }
}
