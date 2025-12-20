package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SentenceSubmitRequest {
    private String userTranslation;
    private Boolean isRetry;
    private Long parentSubmissionId;
}
