package com.enlist.be.entity;

import com.enlist.be.converter.ExampleSentenceListConverter;
import com.enlist.be.dto.ExampleSentence;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dictionary_words")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DictionaryWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(nullable = false)
    private String word;

    @Column(nullable = false)
    private String translation;

    @Column(columnDefinition = "TEXT")
    private String context;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = ExampleSentenceListConverter.class)
    @Builder.Default
    private List<ExampleSentence> examples = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
