package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressDataPoint {
    private LocalDate date;
    private Integer sentencesCompleted;
    private Double accuracyRate;
    private Integer pointsEarned;
    private Integer totalAttempts;
}
