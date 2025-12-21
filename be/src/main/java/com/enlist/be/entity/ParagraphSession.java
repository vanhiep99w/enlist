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
@Table(name = "paragraph_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParagraphSession {

    public enum Status {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        ABANDONED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paragraph_id", nullable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Paragraph paragraph;

    @Column(name = "current_sentence_index")
    @Builder.Default
    private Integer currentSentenceIndex = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.NOT_STARTED;

    @Column(name = "total_points")
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "total_credits")
    @Builder.Default
    private Integer totalCredits = 0;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SentenceSubmission> submissions = new ArrayList<>();

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
    }

    public void advanceToNextSentence() {
        if (paragraph != null && currentSentenceIndex < paragraph.getSentenceCount() - 1) {
            currentSentenceIndex++;
        }
    }

    public boolean isLastSentence() {
        return paragraph != null && currentSentenceIndex >= paragraph.getSentenceCount() - 1;
    }

    public void complete() {
        this.status = Status.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public double getAverageAccuracy() {
        if (submissions == null || submissions.isEmpty()) {
            return 0.0;
        }
        return submissions.stream()
                .mapToDouble(SentenceSubmission::getAccuracy)
                .average()
                .orElse(0.0);
    }

    public int getCompletedSentenceCount() {
        if (submissions == null) {
            return 0;
        }
        return (int) submissions.stream()
                .map(SentenceSubmission::getSentenceIndex)
                .distinct()
                .count();
    }
}
