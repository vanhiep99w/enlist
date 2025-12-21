package com.enlist.be.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DictionaryWordRequest {
    private Long sessionId;

    @NotBlank(message = "Word is required")
    private String word;

    @NotBlank(message = "Translation is required")
    private String translation;

    private String context;

    @NotNull(message = "Examples are required")
    @Size(min = 2, message = "At least 2 examples are required")
    @Valid
    private List<ExampleSentence> examples;
}
