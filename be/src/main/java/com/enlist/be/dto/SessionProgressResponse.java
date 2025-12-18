package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionProgressResponse {
    private Long sessionId;
    private int completedSentences;
    private int totalSentences;
    private double progressPercentage;
    private double averageAccuracy;
    private int totalPoints;
    private String status;
}
