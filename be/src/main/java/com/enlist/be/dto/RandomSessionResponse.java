package com.enlist.be.dto;

import com.enlist.be.entity.RandomSession;
import com.enlist.be.entity.RandomSessionParagraph;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RandomSessionResponse {
    private Long id;
    private Long userId;
    private String status;
    private Integer currentDifficulty;
    private Integer initialDifficulty;
    private String targetLanguage;
    private Integer totalParagraphsCompleted;
    private Integer totalPoints;
    private Integer totalCredits;
    private Double averageAccuracy;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private RandomSessionParagraphDTO currentParagraph;
    private List<RandomSessionParagraphDTO> paragraphs;

    public static RandomSessionResponse fromEntity(RandomSession session) {
        RandomSessionParagraphDTO currentParagraph = null;
        if (session.getParagraphs() != null && !session.getParagraphs().isEmpty()) {
            // Get the latest PENDING or IN_PROGRESS paragraph by orderIndex
            var lastParagraph = session.getParagraphs().stream()
                    .filter(p -> p.getStatus() == RandomSessionParagraph.Status.IN_PROGRESS 
                            || p.getStatus() == RandomSessionParagraph.Status.PENDING)
                    .max((p1, p2) -> Integer.compare(p1.getOrderIndex(), p2.getOrderIndex()))
                    .orElse(session.getParagraphs().stream()
                            .max((p1, p2) -> Integer.compare(p1.getOrderIndex(), p2.getOrderIndex()))
                            .orElse(null));
            
            if (lastParagraph != null) {
                currentParagraph = RandomSessionParagraphDTO.fromEntity(lastParagraph);
            }
        }

        List<RandomSessionParagraphDTO> paragraphs = session.getParagraphs() != null
                ? session.getParagraphs().stream()
                        .map(RandomSessionParagraphDTO::fromEntity)
                        .collect(Collectors.toList())
                : List.of();

        return RandomSessionResponse.builder()
                .id(session.getId())
                .userId(session.getUserId())
                .status(session.getStatus().name())
                .currentDifficulty(session.getCurrentDifficulty())
                .initialDifficulty(session.getInitialDifficulty())
                .targetLanguage(session.getTargetLanguage())
                .totalParagraphsCompleted(session.getTotalParagraphsCompleted())
                .totalPoints(session.getTotalPoints())
                .totalCredits(session.getTotalCredits())
                .averageAccuracy(session.getAverageAccuracy())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .currentParagraph(currentParagraph)
                .paragraphs(paragraphs)
                .build();
    }
}
