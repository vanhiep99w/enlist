package com.enlist.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_metrics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIMetrics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "operation_type", nullable = false)
    private String operationType; // EVALUATE_TRANSLATION, TRANSLATE_WORD, GENERATE_PARAGRAPH
    
    @Column(name = "prompt_length")
    private Integer promptLength;
    
    @Column(name = "response_length")
    private Integer responseLength;
    
    @Column(name = "latency_ms")
    private Long latencyMs;
    
    @Column(name = "success")
    private Boolean success;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    // Translation-specific metrics
    @Column(name = "accuracy")
    private Double accuracy;
    
    @Column(name = "difficulty_level")
    private Integer difficultyLevel;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
