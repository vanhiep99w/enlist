package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParagraphCreateRequest {
    private String title;
    private String content;
    private String difficulty;
    private String topic;
}
