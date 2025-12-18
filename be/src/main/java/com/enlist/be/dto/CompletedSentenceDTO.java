package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompletedSentenceDTO {
    private String correctTranslation;
    private String userTranslation;
    private String originalSentence;
    private double accuracy;
    private List<ErrorDTO> errors;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDTO {
        private String type;
        private String quickFix;
        private String correction;
    }
}
