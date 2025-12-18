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
public class TranslationFeedback {
    private ScoreBreakdown scores;
    private List<TranslationError> errors;
    private List<String> suggestions;
    private String correctTranslation;
    private List<ArticleTip> articleTips;
    private List<CollocationHighlight> collocationHighlights;
    private List<ReasoningTip> reasoningTips;
    private List<RegisterTip> registerTips;
}
