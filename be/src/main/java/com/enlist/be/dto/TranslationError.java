package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslationError {
    private String type;
    private String position;
    private String issue;
    private String correction;
    private String quickFix;
    private String category;
    private Integer startIndex;
    private Integer endIndex;
    private String errorText;
}
