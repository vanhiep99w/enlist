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
    private String explanation;
    private String quickFix;
    private String category;
    private String learningTip;
}
