package com.enlist.be.dto;

import com.enlist.be.entity.DictionaryWord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DictionaryWordResponse {
    private Long id;
    private Long sessionId;
    private String word;
    private String translation;
    private String context;
    private LocalDateTime createdAt;

    public static DictionaryWordResponse fromEntity(DictionaryWord entity) {
        return DictionaryWordResponse.builder()
                .id(entity.getId())
                .sessionId(entity.getSessionId())
                .word(entity.getWord())
                .translation(entity.getTranslation())
                .context(entity.getContext())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
