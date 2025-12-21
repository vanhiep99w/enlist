package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreviousAttemptResponse {
    private Long sessionId;
    private LocalDateTime completedAt;
    private Double averageAccuracy;
    private Integer totalErrors;
    private Integer completedSentences;
    private Integer totalSentences;
    private Integer totalPoints;
}
