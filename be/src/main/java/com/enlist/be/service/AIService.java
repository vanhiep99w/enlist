package com.enlist.be.service;

import com.enlist.be.config.GroqConfig;
import com.enlist.be.dto.ArticleTip;
import com.enlist.be.dto.CollocationHighlight;
import com.enlist.be.dto.ReasoningTip;
import com.enlist.be.dto.RegisterTip;
import com.enlist.be.dto.ScoreBreakdown;
import com.enlist.be.dto.TranslationError;
import com.enlist.be.dto.TranslationFeedback;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final GroqConfig groqConfig;
    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private WebClient groqClient;

    @PostConstruct
    public void init() {
        groqClient = webClient.mutate()
                .baseUrl(groqConfig.getUrl())
                .defaultHeader("Authorization", "Bearer " + groqConfig.getKey())
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public TranslationFeedback evaluateTranslation(String originalText, String userTranslation) {
        return evaluateTranslation(originalText, userTranslation, null, null);
    }

    public TranslationFeedback evaluateTranslation(String originalText, String userTranslation, String paragraphContext, List<String> previousTranslations) {
        String prompt = buildPrompt(originalText, userTranslation, paragraphContext, previousTranslations);
        
        String normalizedUser = normalizeForComparison(userTranslation);

        Map<String, Object> requestBody = Map.of(
                "model", groqConfig.getModel(),
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", groqConfig.getMaxTokens(),
                "temperature", groqConfig.getTemperature()
        );

        try {
            String response = groqClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            TranslationFeedback feedback = parseResponse(response);
            
            String normalizedCorrect = normalizeForComparison(feedback.getCorrectTranslation());
            if (normalizedUser.equals(normalizedCorrect)) {
                return createPerfectScoreFeedback(userTranslation);
            }
            
            return feedback;
        } catch (Exception e) {
            log.error("Error calling Groq API: {}", e.getMessage(), e);
            return createDefaultFeedback();
        }
    }

    private String buildPrompt(String originalText, String userTranslation, String paragraphContext, List<String> previousTranslations) {
        StringBuilder contextSection = new StringBuilder();
        
        // Add tense detection hint based on paragraph context
        String tenseHint = "";
        if (paragraphContext != null && !paragraphContext.isEmpty()) {
            contextSection.append("\n                PARAGRAPH CONTEXT (Full Vietnamese paragraph for reference):\n                ");
            contextSection.append(paragraphContext);
            contextSection.append("\n                ");
            
            // Detect if paragraph is about past events
            String lowerContext = paragraphContext.toLowerCase();
            if (lowerContext.contains("tháng trước") || lowerContext.contains("hôm qua") || 
                lowerContext.contains("năm ngoái") || lowerContext.contains("tuần trước") ||
                lowerContext.contains("đã") || lowerContext.contains("hồi")) {
                tenseHint = "\n                ⚠️ CRITICAL: This paragraph describes PAST EVENTS. The student's translation MUST use PAST TENSE (was/were/went/had, NOT is/am/are/go/have).\n                ";
            }
        }
        
        if (previousTranslations != null && !previousTranslations.isEmpty()) {
            contextSection.append("\n                PREVIOUS SENTENCES TRANSLATED BY STUDENT:\n                ");
            for (int i = 0; i < previousTranslations.size(); i++) {
                contextSection.append(String.format("%d. %s\n                ", i + 1, previousTranslations.get(i)));
            }
        }
        
        return """
                You are an English language teacher evaluating a Vietnamese-to-English translation for Vietnamese learners.
                %s%s
                Original Vietnamese sentence to translate: %s
                Student's Translation: %s
                
                Evaluate the translation and respond with ONLY valid JSON (no markdown, no explanation outside JSON):
                {
                  "scores": {
                    "grammarScore": <0-100>,
                    "wordChoiceScore": <0-100>,
                    "naturalnessScore": <0-100>,
                    "overallScore": <weighted average>
                  },
                  "errors": [
                    {
                      "type": "GRAMMAR|WORD_CHOICE|NATURALNESS",
                      "position": "<where in sentence>",
                      "issue": "<what's wrong>",
                      "correction": "<corrected phrase>",
                      "explanation": "<detailed explanation in Vietnamese>",
                      "quickFix": "<one-line fix suggestion>",
                      "category": "<optional: ARTICLE|COLLOCATION|PREPOSITION|VERB_FORM|WORD_ORDER|REGISTER|null>",
                      "learningTip": "<optional: memory tip for Vietnamese speakers>"
                    }
                  ],
                  "suggestions": ["<improvement tip 1>", ...],
                  "correctTranslation": "<student's translation with all typos, spelling, grammar, and punctuation corrected - preserve their word choices when correct>",
                  "articleTips": [
                    {
                      "context": "<when this article rule applies>",
                      "rule": "<the rule in Vietnamese>",
                      "example": "<example sentence>"
                    }
                  ],
                  "collocationHighlights": [
                    {
                      "incorrect": "<wrong collocation used>",
                      "correct": "<correct collocation>",
                      "explanation": "<why in Vietnamese>",
                      "relatedCollocations": ["<similar correct collocations>"]
                    }
                  ],
                  "reasoningTips": [
                    {
                      "incorrectWord": "<word used incorrectly, e.g. 'for'>",
                      "correctWord": "<correct word, e.g. 'because'>",
                      "context": "<when to use which word>",
                      "explanation": "<detailed explanation in Vietnamese>",
                      "examples": ["<example sentence 1>", "<example sentence 2>"]
                    }
                  ],
                  "registerTips": [
                    {
                      "casualWord": "<casual/informal word used, e.g. 'cute'>",
                      "formalWord": "<formal alternative, e.g. 'lovely'>",
                      "context": "<when formality matters>",
                      "explanation": "<explanation in Vietnamese about tone/register>",
                      "formalAlternatives": ["<other formal options>"]
                    }
                  ]
                }
                
                SPECIAL ATTENTION for Vietnamese learners:
                
                1. ARTICLES (a/an/the/this/that): Vietnamese has no articles, so pay extra attention to:
                   - Missing articles (common mistake: "I want buy car" → "I want to buy a car")
                   - Wrong article choice (a vs the)
                   - Add articleTips array with Vietnamese explanations and memory tricks
                   - Explain when to use: a/an (first mention, general), the (specific, already mentioned), no article (uncountable, plural general)
                
                2. COLLOCATIONS: Vietnamese speakers often translate word-by-word:
                   - "make a decision" NOT "do a decision"
                   - "take a photo" NOT "make a photo"
                   - "have breakfast" NOT "eat breakfast"
                   - Add collocationHighlights for any collocation errors with related correct patterns
                
                3. PREPOSITIONS: Different from Vietnamese patterns
                
                4. REASONING WORDS (for/because/since/as): Vietnamese speakers often confuse these:
                   - "because" introduces a REASON clause (Vì/Bởi vì): "I stayed home because I was sick"
                   - "for" is FORMAL and used with NOUNS or short phrases: "famous for its beauty"
                   - "since" can mean REASON or TIME: "Since you're here, let's start" (reason) / "since 2020" (time)
                   - "as" is formal for reason: "As it was late, we left"
                   - Add reasoningTips when student confuses these words
                
                5. REGISTER/FORMALITY: Vietnamese speakers may not distinguish casual vs formal tone:
                   - "cute" is casual/informal → "lovely", "delightful", "charming" for formal contexts
                   - "awesome", "cool" are casual → "excellent", "outstanding" for business/academic
                   - "gonna", "wanna" are informal → "going to", "want to" for formal writing
                   - "kids" is casual → "children" for formal contexts
                   - Add registerTips when word choice doesn't match expected formality level
                
                SCORING PHILOSOPHY - BE ENCOURAGING, NOT PUNITIVE:
                Focus on MEANING first. If the student conveys the correct meaning, start from a high base score (85-90%%) and only deduct for errors.
                
                Error severity levels (deduct accordingly):
                - IGNORE (0 points): Capitalization errors (\"i\" vs \"I\"), minor punctuation, extra spaces
                - MINOR (-2 to -5 points): Common Vietnamese learner mistakes like article errors (\"a breakfast\" vs \"breakfast\"), slight word order differences that don't affect meaning
                - MODERATE (-5 to -10 points): Wrong prepositions, incorrect verb tenses, collocation errors
                - MAJOR (-10 to -20 points): Missing key words, wrong meaning, incomprehensible grammar
                
                Scoring guide:
                - grammarScore: syntax, verb forms, articles, prepositions, sentence structure. Start at 95 if meaning is correct.
                - wordChoiceScore: vocabulary accuracy, collocations, word forms. Start at 95 if words convey the meaning.
                - naturalnessScore: natural phrasing, tone, fluency, idiomatic expressions. Start at 90 for understandable translations.
                - overallScore: weighted average (Grammar 40%%, Word Choice 30%%, Naturalness 30%%)
                
                IMPORTANT: A translation that conveys the same meaning with minor errors should score 85-95%%. 
                Only translations with significant meaning errors or major grammar issues should score below 80%%.
                
                PARAGRAPH COHERENCE - CRITICAL:
                If paragraph context is provided, you MUST ensure tense consistency:
                - If the paragraph describes PAST events (e.g., "Tháng trước tôi đi...", "Hôm qua...", "Năm ngoái..."), ALL sentences should use PAST TENSE
                - If student uses present tense for a past-context paragraph, mark as GRAMMAR error and correct to past tense
                - The correctTranslation MUST use the appropriate tense matching the paragraph context
                - Example: If context is about "last month's trip", "I'm in the hotel" should be corrected to "I was in the hotel"
                """.formatted(contextSection.toString(), originalText, userTranslation);
    }

    private TranslationFeedback parseResponse(String response) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(response);
        JsonNode choices = root.path("choices");

        if (choices.isEmpty()) {
            log.warn("No choices in Groq API response");
            return createDefaultFeedback();
        }

        String content = choices.get(0).path("message").path("content").asText();
        content = cleanJsonContent(content);

        JsonNode feedbackNode = objectMapper.readTree(content);

        JsonNode scoresNode = feedbackNode.path("scores");
        ScoreBreakdown scores = ScoreBreakdown.builder()
                .grammarScore(scoresNode.path("grammarScore").asInt(0))
                .wordChoiceScore(scoresNode.path("wordChoiceScore").asInt(0))
                .naturalnessScore(scoresNode.path("naturalnessScore").asInt(0))
                .overallScore(scoresNode.path("overallScore").asInt(0))
                .build();

        List<TranslationError> errors = new ArrayList<>();
        JsonNode errorsNode = feedbackNode.path("errors");
        if (errorsNode.isArray()) {
            for (JsonNode errorNode : errorsNode) {
                errors.add(TranslationError.builder()
                        .type(errorNode.path("type").asText())
                        .position(errorNode.path("position").asText())
                        .issue(errorNode.path("issue").asText())
                        .correction(errorNode.path("correction").asText())
                        .explanation(errorNode.path("explanation").asText())
                        .quickFix(errorNode.path("quickFix").asText())
                        .category(errorNode.path("category").asText(null))
                        .learningTip(errorNode.path("learningTip").asText(null))
                        .build());
            }
        }

        List<String> suggestions = new ArrayList<>();
        JsonNode suggestionsNode = feedbackNode.path("suggestions");
        if (suggestionsNode.isArray()) {
            for (JsonNode suggestion : suggestionsNode) {
                suggestions.add(suggestion.asText());
            }
        }

        List<ArticleTip> articleTips = new ArrayList<>();
        JsonNode articleTipsNode = feedbackNode.path("articleTips");
        if (articleTipsNode.isArray()) {
            for (JsonNode tipNode : articleTipsNode) {
                articleTips.add(ArticleTip.builder()
                        .context(tipNode.path("context").asText())
                        .rule(tipNode.path("rule").asText())
                        .example(tipNode.path("example").asText())
                        .build());
            }
        }

        List<CollocationHighlight> collocationHighlights = new ArrayList<>();
        JsonNode collocationsNode = feedbackNode.path("collocationHighlights");
        if (collocationsNode.isArray()) {
            for (JsonNode collNode : collocationsNode) {
                List<String> relatedCollocations = new ArrayList<>();
                JsonNode relatedNode = collNode.path("relatedCollocations");
                if (relatedNode.isArray()) {
                    for (JsonNode related : relatedNode) {
                        relatedCollocations.add(related.asText());
                    }
                }
                collocationHighlights.add(CollocationHighlight.builder()
                        .incorrect(collNode.path("incorrect").asText())
                        .correct(collNode.path("correct").asText())
                        .explanation(collNode.path("explanation").asText())
                        .relatedCollocations(relatedCollocations)
                        .build());
            }
        }

        List<ReasoningTip> reasoningTips = new ArrayList<>();
        JsonNode reasoningTipsNode = feedbackNode.path("reasoningTips");
        if (reasoningTipsNode.isArray()) {
            for (JsonNode tipNode : reasoningTipsNode) {
                List<String> examples = new ArrayList<>();
                JsonNode examplesNode = tipNode.path("examples");
                if (examplesNode.isArray()) {
                    for (JsonNode example : examplesNode) {
                        examples.add(example.asText());
                    }
                }
                reasoningTips.add(ReasoningTip.builder()
                        .incorrectWord(tipNode.path("incorrectWord").asText())
                        .correctWord(tipNode.path("correctWord").asText())
                        .context(tipNode.path("context").asText())
                        .explanation(tipNode.path("explanation").asText())
                        .examples(examples)
                        .build());
            }
        }

        List<RegisterTip> registerTips = new ArrayList<>();
        JsonNode registerTipsNode = feedbackNode.path("registerTips");
        if (registerTipsNode.isArray()) {
            for (JsonNode tipNode : registerTipsNode) {
                List<String> formalAlternatives = new ArrayList<>();
                JsonNode alternativesNode = tipNode.path("formalAlternatives");
                if (alternativesNode.isArray()) {
                    for (JsonNode alt : alternativesNode) {
                        formalAlternatives.add(alt.asText());
                    }
                }
                registerTips.add(RegisterTip.builder()
                        .casualWord(tipNode.path("casualWord").asText())
                        .formalWord(tipNode.path("formalWord").asText())
                        .context(tipNode.path("context").asText())
                        .explanation(tipNode.path("explanation").asText())
                        .formalAlternatives(formalAlternatives)
                        .build());
            }
        }

        String correctTranslation = feedbackNode.path("correctTranslation").asText("");

        return TranslationFeedback.builder()
                .scores(scores)
                .errors(errors)
                .suggestions(suggestions)
                .correctTranslation(correctTranslation)
                .articleTips(articleTips)
                .collocationHighlights(collocationHighlights)
                .reasoningTips(reasoningTips)
                .registerTips(registerTips)
                .build();
    }

    private String cleanJsonContent(String content) {
        content = content.trim();
        if (content.startsWith("```json")) {
            content = content.substring(7);
        } else if (content.startsWith("```")) {
            content = content.substring(3);
        }
        if (content.endsWith("```")) {
            content = content.substring(0, content.length() - 3);
        }
        return content.trim();
    }

    private TranslationFeedback createDefaultFeedback() {
        return TranslationFeedback.builder()
                .scores(ScoreBreakdown.builder()
                        .grammarScore(0)
                        .wordChoiceScore(0)
                        .naturalnessScore(0)
                        .overallScore(0)
                        .build())
                .errors(List.of())
                .suggestions(List.of("Unable to evaluate translation. Please try again."))
                .correctTranslation("")
                .build();
    }
    
    private String normalizeForComparison(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .trim()
                .replaceAll("\\s+", " ")
                .replaceAll("[^a-z0-9\\s]", "");
    }
    
    private TranslationFeedback createPerfectScoreFeedback(String userTranslation) {
        return TranslationFeedback.builder()
                .scores(ScoreBreakdown.builder()
                        .grammarScore(100)
                        .wordChoiceScore(100)
                        .naturalnessScore(100)
                        .overallScore(100)
                        .build())
                .errors(List.of())
                .suggestions(List.of("Perfect translation!"))
                .correctTranslation(userTranslation)
                .build();
    }
}
