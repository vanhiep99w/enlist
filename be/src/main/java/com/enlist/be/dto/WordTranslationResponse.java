package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordTranslationResponse {
    private String word;
    private String translation;
    private String partOfSpeech;
    private String example;
    private String exampleTranslation;
}
