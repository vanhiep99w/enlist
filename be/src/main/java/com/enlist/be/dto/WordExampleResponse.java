package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordExampleResponse {

    private Long id;
    private String word;
    private String exampleSentence;
    private String translation;
    private String source;
}
