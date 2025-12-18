package com.enlist.be.dto;

import com.enlist.be.entity.ParagraphSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private Long paragraphId;
    private String paragraphTitle;
    private String status;
    private int currentSentenceIndex;
    private int totalSentences;
    private int completedSentences;
    private double averageAccuracy;
    private int totalPoints;
    private int totalCredits;
    private String currentSentence;
    private List<String> allSentences;
    private String fullContent;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public static SessionResponse fromEntity(ParagraphSession session) {
        var paragraph = session.getParagraph();
        var sentences = paragraph.getSentences();
        String currentSentence = null;
        if (session.getCurrentSentenceIndex() < sentences.size()) {
            currentSentence = sentences.get(session.getCurrentSentenceIndex());
        }

        return SessionResponse.builder()
                .id(session.getId())
                .paragraphId(paragraph.getId())
                .paragraphTitle(paragraph.getTitle())
                .status(session.getStatus().name())
                .currentSentenceIndex(session.getCurrentSentenceIndex())
                .totalSentences(paragraph.getSentenceCount())
                .completedSentences(session.getCompletedSentenceCount())
                .averageAccuracy(session.getAverageAccuracy())
                .totalPoints(session.getTotalPoints())
                .totalCredits(session.getTotalCredits())
                .currentSentence(currentSentence)
                .allSentences(sentences)
                .fullContent(paragraph.getContent())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .build();
    }
}
