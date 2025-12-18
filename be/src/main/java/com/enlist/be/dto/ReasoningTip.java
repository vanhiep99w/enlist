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
public class ReasoningTip {
    private String incorrectWord;
    private String correctWord;
    private String context;
    private String explanation;
    private List<String> examples;
}
