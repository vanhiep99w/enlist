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
public class RegisterTip {
    private String casualWord;
    private String formalWord;
    private String context;
    private String explanation;
    private List<String> formalAlternatives;
}
