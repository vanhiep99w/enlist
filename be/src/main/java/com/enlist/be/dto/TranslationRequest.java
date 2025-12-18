package com.enlist.be.dto;

import lombok.Data;

@Data
public class TranslationRequest {
    private Long exerciseId;
    private String originalText;
    private String userTranslation;
}
