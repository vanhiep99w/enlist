package com.enlist.be.dto;

import com.enlist.be.entity.RandomSessionParagraph;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RandomSessionParagraphDTO {
    private Long id;
    private Long randomSessionId;
    private Long paragraphId;
    private Long paragraphSessionId;
    private String paragraphTitle;
    private String paragraphContent;
    private Integer orderIndex;
    private Integer difficultyLevel;
    private String status;
    private Double accuracy;
    private Integer timeSpentSeconds;
    private Integer pointsEarned;
    private Integer creditsEarned;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public static RandomSessionParagraphDTO fromEntity(RandomSessionParagraph entity) {
        var builder = RandomSessionParagraphDTO.builder()
                .id(entity.getId())
                .randomSessionId(entity.getRandomSession() != null ? entity.getRandomSession().getId() : null)
                .paragraphSessionId(entity.getParagraphSession() != null ? entity.getParagraphSession().getId() : null)
                .orderIndex(entity.getOrderIndex())
                .difficultyLevel(entity.getDifficultyLevel())
                .status(entity.getStatus().name())
                .accuracy(entity.getAccuracy())
                .timeSpentSeconds(entity.getTimeSpentSeconds())
                .pointsEarned(entity.getPointsEarned())
                .creditsEarned(entity.getCreditsEarned())
                .createdAt(entity.getCreatedAt())
                .completedAt(entity.getCompletedAt());

        try {
            if (entity.getParagraph() != null) {
                builder.paragraphId(entity.getParagraph().getId())
                        .paragraphTitle(entity.getParagraph().getTitle())
                        .paragraphContent(entity.getParagraph().getContent());
            }
        } catch (jakarta.persistence.EntityNotFoundException e) {
            builder.paragraphId(null)
                    .paragraphTitle("[Deleted Paragraph]")
                    .paragraphContent("");
        }

        return builder.build();
    }
}
