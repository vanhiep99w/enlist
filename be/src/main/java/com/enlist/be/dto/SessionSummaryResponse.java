package com.enlist.be.dto;

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
public class SessionSummaryResponse {
    private Long sessionId;
    private Long paragraphId;
    private String paragraphTitle;
    private Integer totalSentences;
    private Integer completedSentences;
    private Double averageAccuracy;
    private Integer totalErrors;
    private Integer totalPoints;
    private LocalDateTime completedAt;
    private ErrorBreakdown errorBreakdown;
    private List<ErrorDetail> allErrors;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorBreakdown {
        private Integer grammarErrors;
        private Integer wordChoiceErrors;
        private Integer naturalnessErrors;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDetail {
        private Integer sentenceIndex;
        private String originalSentence;
        private String userTranslation;
        private String type;
        private String quickFix;
        private String correction;
    }
}
