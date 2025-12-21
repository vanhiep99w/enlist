package com.enlist.be.dto;

import com.enlist.be.entity.Paragraph;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParagraphResponse {
    private Long id;
    private String title;
    private String content;
    private String difficulty;
    private String topic;
    private int sentenceCount;
    private List<String> sentences;
    private String completionStatus;

    public static ParagraphResponse fromEntity(Paragraph paragraph) {
        return ParagraphResponse.builder()
                .id(paragraph.getId())
                .title(paragraph.getTitle())
                .content(paragraph.getContent())
                .difficulty(paragraph.getDifficulty())
                .topic(paragraph.getTopic())
                .sentenceCount(paragraph.getSentenceCount())
                .sentences(paragraph.getSentences())
                .completionStatus("not_started")
                .build();
    }

    public static ParagraphResponse fromEntityWithStatus(Paragraph paragraph, String completionStatus) {
        return ParagraphResponse.builder()
                .id(paragraph.getId())
                .title(paragraph.getTitle())
                .content(paragraph.getContent())
                .difficulty(paragraph.getDifficulty())
                .topic(paragraph.getTopic())
                .sentenceCount(paragraph.getSentenceCount())
                .sentences(paragraph.getSentences())
                .completionStatus(completionStatus)
                .build();
    }
}
