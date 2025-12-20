package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressSummary {
    private Integer totalSentences;
    private Double averageAccuracy;
    private Integer totalPoints;
    private Integer totalAttempts;
    private Integer activeDays;
}
