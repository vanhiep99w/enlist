package com.enlist.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "word_examples")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordExample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String word;

    @Column(name = "example_sentence", nullable = false, columnDefinition = "TEXT")
    private String exampleSentence;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String translation;

    @Column(nullable = false)
    private String source;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
