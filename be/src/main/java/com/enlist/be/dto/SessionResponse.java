package com.enlist.be.dto;

import com.enlist.be.entity.ParagraphSession;
import com.enlist.be.entity.SentenceSubmission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private Map<Integer, String> completedTranslations;

    public static SessionResponse fromEntity(ParagraphSession session) {
        var paragraph = session.getParagraph();
        var sentences = paragraph.getSentences();
        String currentSentence = null;
        if (session.getCurrentSentenceIndex() < sentences.size()) {
            currentSentence = sentences.get(session.getCurrentSentenceIndex());
        }

        Map<Integer, String> completedTranslations = new HashMap<>();
        if (session.getSubmissions() != null) {
            for (SentenceSubmission submission : session.getSubmissions()) {
                if (submission.getAccuracy() != null && submission.getAccuracy() >= 80 
                        && submission.getUserTranslation() != null 
                        && !Boolean.TRUE.equals(submission.getSkipped())) {
                    completedTranslations.put(submission.getSentenceIndex(), submission.getUserTranslation());
                }
            }
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
                .completedTranslations(completedTranslations)
                .build();
    }
}
