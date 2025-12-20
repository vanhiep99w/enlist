package com.enlist.be.service;

import com.enlist.be.config.GroqConfig;
import com.enlist.be.dto.GoodPoint;
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
        if (isGibberishInput(userTranslation)) {
            return createGibberishFeedback(userTranslation);
        }
        
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
            
            validateAndFixErrorPositions(feedback, userTranslation);
            
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
        
        String tenseHint = "";
        if (paragraphContext != null && !paragraphContext.isEmpty()) {
            contextSection.append("\n                PARAGRAPH CONTEXT (Full Vietnamese paragraph for reference):\n                ");
            contextSection.append(paragraphContext);
            contextSection.append("\n                ");
            
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
                
                IMPORTANT: Evaluate ONLY the student's translation of the CURRENT SENTENCE above. Do NOT translate other sentences.
                
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
                      "correction": "<ONLY the corrected word/phrase to replace errorText>",
                      "quickFix": "<one-line fix suggestion>",
                      "category": "<optional: ARTICLE|COLLOCATION|PREPOSITION|VERB_FORM|WORD_ORDER|REGISTER|null>",
                      "startIndex": <character index where error starts>,
                      "endIndex": <character index where error ends>,
                      "errorText": "<exact text from student's translation that contains the error>"
                    }
                  ],
                  "suggestions": ["<improvement tip 1>", ...],
                  "correctTranslation": "<COMPLETE and ACCURATE translation>",
                  "goodPoints": [
                    {
                      "phrase": "<exact phrase from student's translation that was good>",
                      "reason": "<why this is good, in Vietnamese>",
                      "type": "WORD_CHOICE|GRAMMAR|NATURALNESS"
                    }
                  ]
                }
                
                SCORING PHILOSOPHY - BE ENCOURAGING, NOT PUNITIVE:
                Focus on MEANING first. If the student conveys the correct meaning, start from a high base score (85-90%%) and only deduct for errors.
                
                ⚠️ CRITICAL - CORRECT TRANSLATION REQUIREMENTS:
                The correctTranslation field MUST be a COMPLETE translation of the original Vietnamese sentence.
                Include ALL parts of the original meaning (subject, verb, object, modifiers, clauses).
                
                ALWAYS include goodPoints to highlight what the student did well.
                
                ⚠️ CRITICAL - DETECT NONSENSE/GIBBERISH INPUT:
                If the student's translation is random letters, single words, or completely unrelated text,
                then ALL scores MUST be 0-10%%. Do NOT be lenient with nonsense input.
                
                Error severity levels:
                - CRITICAL (score 0-10%%): Nonsense, gibberish, random characters
                - IGNORE (0 points): Capitalization errors, minor punctuation
                - MINOR (-2 to -5 points): Article errors, slight word order differences
                - MODERATE (-5 to -10 points): Wrong prepositions, tenses, spelling, missing words
                - MAJOR (-10 to -20 points): Missing key words, wrong meaning
                
                ⚠️⚠️⚠️ MISSING VERB \"BE\" (is/am/are/was/were) - ALWAYS CHECK
                Vietnamese doesn't require \"be\" verbs, so students OFTEN forget them.
                
                ⚠️ VIETNAMESE FOOD & CULTURAL TERMS - TRANSLATION ACCURACY:
                Vietnamese food names must be translated accurately (e.g., \"bánh cuốn\" = \"rice rolls\" NOT \"noodles\").
                
                Scoring guide:
                - grammarScore: Start at 95 if meaning is correct. Score 0-10 for nonsense.
                - wordChoiceScore: Start at 95 if words convey meaning. Score 0-10 for nonsense.
                - naturalnessScore: Start at 90 for understandable translations. Score 0-10 for nonsense.
                - overallScore: weighted average (Grammar 40%%, Word Choice 30%%, Naturalness 30%%)
                
                PARAGRAPH COHERENCE - CRITICAL:
                If paragraph context describes PAST events, ALL sentences should use PAST TENSE.
                
                ERROR POSITION CALCULATION - CRITICAL:
                - startIndex: 0-based index of first character of error
                - endIndex: 0-based index AFTER last character (exclusive)
                - errorText: exact substring from student's translation
                - correction: ONLY the replacement for errorText, NOT the entire sentence
                
                ⚠️ FOR MISSING WORDS (e.g., missing "has"/"is"/"are"):
                - Find the position where the word SHOULD be inserted
                - Set startIndex to the index BEFORE where word should be inserted
                - Set endIndex to startIndex + 1 (highlight one space or the next word's first character)
                - Set errorText to empty string "" or the character at that position
                - Set correction to the missing word (e.g., "has ")
                Example: "The class twelve students" → missing "has" between "class" and "twelve"
                  startIndex: 10 (index of space after "class"), endIndex: 11, errorText: " ", correction: " has"
                
                ⚠️ CRITICAL - SEPARATE ERRORS FOR EACH ISSUE:
                Create INDIVIDUAL error entries for each distinct mistake.
                
                ⚠️⚠️⚠️ FINAL CHECK - MOST IMPORTANT
                VERIFY that every \"correction\" value appears EXACTLY in the \"correctTranslation\" string.
                """.formatted(contextSection.toString(), tenseHint, originalText, userTranslation);
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
                Integer startIndex = errorNode.has("startIndex") && !errorNode.path("startIndex").isNull() 
                        ? errorNode.path("startIndex").asInt() : null;
                Integer endIndex = errorNode.has("endIndex") && !errorNode.path("endIndex").isNull() 
                        ? errorNode.path("endIndex").asInt() : null;
                        
                errors.add(TranslationError.builder()
                        .type(errorNode.path("type").asText())
                        .position(errorNode.path("position").asText())
                        .issue(errorNode.path("issue").asText())
                        .correction(errorNode.path("correction").asText())
                        .quickFix(errorNode.path("quickFix").asText())
                        .category(errorNode.path("category").asText(null))
                        .startIndex(startIndex)
                        .endIndex(endIndex)
                        .errorText(errorNode.path("errorText").asText(null))
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

        String correctTranslation = feedbackNode.path("correctTranslation").asText("");
        
        if (correctTranslation == null || correctTranslation.trim().isEmpty()) {
            log.warn("AI response missing correctTranslation field - returning default feedback");
            return createDefaultFeedback();
        }

        List<GoodPoint> goodPoints = new ArrayList<>();
        JsonNode goodPointsNode = feedbackNode.path("goodPoints");
        if (goodPointsNode.isArray()) {
            for (JsonNode pointNode : goodPointsNode) {
                goodPoints.add(GoodPoint.builder()
                        .phrase(pointNode.path("phrase").asText())
                        .reason(pointNode.path("reason").asText())
                        .type(pointNode.path("type").asText())
                        .build());
            }
        }

        return TranslationFeedback.builder()
                .scores(scores)
                .errors(errors)
                .suggestions(suggestions)
                .correctTranslation(correctTranslation)
                .goodPoints(goodPoints)
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
    
    private void validateAndFixErrorPositions(TranslationFeedback feedback, String userTranslation) {
        if (feedback.getErrors() == null) return;
        
        for (TranslationError error : feedback.getErrors()) {
            Integer startIndex = error.getStartIndex();
            Integer endIndex = error.getEndIndex();
            String errorText = error.getErrorText();
            
            if (startIndex == null || endIndex == null) continue;
            
            if (startIndex < 0 || endIndex > userTranslation.length() || startIndex >= endIndex) {
                if (errorText != null && !errorText.isEmpty()) {
                    int foundIndex = userTranslation.indexOf(errorText);
                    if (foundIndex >= 0) {
                        error.setStartIndex(foundIndex);
                        error.setEndIndex(foundIndex + errorText.length());
                        log.debug("Fixed error position for '{}': {} -> {}", errorText, startIndex, foundIndex);
                    } else {
                        int foundIndexIgnoreCase = userTranslation.toLowerCase().indexOf(errorText.toLowerCase());
                        if (foundIndexIgnoreCase >= 0) {
                            error.setStartIndex(foundIndexIgnoreCase);
                            error.setEndIndex(foundIndexIgnoreCase + errorText.length());
                            error.setErrorText(userTranslation.substring(foundIndexIgnoreCase, foundIndexIgnoreCase + errorText.length()));
                        } else {
                            error.setStartIndex(null);
                            error.setEndIndex(null);
                        }
                    }
                } else {
                    error.setStartIndex(null);
                    error.setEndIndex(null);
                }
                continue;
            }
            
            String actualText = userTranslation.substring(startIndex, endIndex);
            if (errorText != null && !errorText.equals(actualText)) {
                int foundIndex = userTranslation.indexOf(errorText);
                if (foundIndex >= 0) {
                    error.setStartIndex(foundIndex);
                    error.setEndIndex(foundIndex + errorText.length());
                    log.debug("Corrected error position for '{}': was [{},{}], now [{},{}]", 
                            errorText, startIndex, endIndex, foundIndex, foundIndex + errorText.length());
                } else {
                    int foundIndexIgnoreCase = userTranslation.toLowerCase().indexOf(errorText.toLowerCase());
                    if (foundIndexIgnoreCase >= 0) {
                        error.setStartIndex(foundIndexIgnoreCase);
                        error.setEndIndex(foundIndexIgnoreCase + errorText.length());
                        error.setErrorText(userTranslation.substring(foundIndexIgnoreCase, foundIndexIgnoreCase + errorText.length()));
                    } else {
                        error.setErrorText(actualText);
                    }
                }
            } else if (errorText == null) {
                error.setErrorText(actualText);
            }
        }
    }
    
    private boolean isGibberishInput(String input) {
        if (input == null || input.trim().isEmpty()) {
            return true;
        }
        
        String trimmed = input.trim().toLowerCase();
        
        if (trimmed.length() < 2) {
            return true;
        }
        
        String[] gibberishPatterns = {"abc", "xyz", "asdf", "qwerty", "test", "aaa", "bbb", "ccc", "123", "xxx"};
        for (String pattern : gibberishPatterns) {
            if (trimmed.equals(pattern) || trimmed.matches("^[" + pattern.charAt(0) + "]+$")) {
                return true;
            }
        }
        
        if (!trimmed.contains(" ") && trimmed.length() < 4) {
            return true;
        }
        
        if (trimmed.matches("^[bcdfghjklmnpqrstvwxyz]+$") && trimmed.length() < 6) {
            return true;
        }
        
        if (trimmed.matches("^(.)\\1+$")) {
            return true;
        }
        
        return false;
    }
    
    private TranslationFeedback createGibberishFeedback(String userTranslation) {
        return TranslationFeedback.builder()
                .scores(ScoreBreakdown.builder()
                        .grammarScore(0)
                        .wordChoiceScore(0)
                        .naturalnessScore(0)
                        .overallScore(0)
                        .build())
                .errors(List.of(
                        TranslationError.builder()
                                .type("GRAMMAR")
                                .position("entire input")
                                .issue("Input không phải là một câu dịch hợp lệ")
                                .correction("Vui lòng nhập bản dịch tiếng Anh đầy đủ")
                                .quickFix("Hãy đọc câu tiếng Việt và dịch sang tiếng Anh")
                                .build()
                ))
                .suggestions(List.of("Vui lòng nhập một bản dịch tiếng Anh hợp lệ cho câu tiếng Việt."))
                .correctTranslation("")
                .build();
    }

    public Map<String, String> translateWord(String word) {
        return translateWord(word, null);
    }

    public Map<String, String> translateWord(String word, String context) {
        String contextSection = "";
        if (context != null && !context.isEmpty()) {
            contextSection = String.format("""
                
                SENTENCE CONTEXT:
                "%s"
                
                Use this context to determine the correct meaning and choose the most appropriate translation.
                """, context);
        }

        String prompt = String.format("""
                Detect the language of this word/phrase and translate it:
                - If ENGLISH -> translate to Vietnamese
                - If VIETNAMESE -> translate to English
                %s
                Word/Phrase: %s
                
                IMPORTANT: Keep example sentences SHORT (maximum 10-15 words). Use simple, clear examples.
                
                Respond with ONLY valid JSON (no markdown, no explanation):
                {
                  "word": "%s",
                  "translation": "<translation in target language based on context>",
                  "partOfSpeech": "<noun|verb|adjective|adverb|phrase|preposition|conjunction|etc>",
                  "example": "<SHORT example sentence using this word - max 10-15 words>",
                  "exampleTranslation": "<translation of the example to target language>"
                }
                """, contextSection, word, word);

        Map<String, Object> requestBody = Map.of(
                "model", groqConfig.getWordTranslation().getModel(),
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", groqConfig.getWordTranslation().getMaxTokens(),
                "temperature", groqConfig.getWordTranslation().getTemperature()
        );

        try {
            String response = groqClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Groq API response for word '{}': {}", word, response);

            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            log.info("AI content before cleaning: {}", content);
            
            content = cleanJsonContent(content);
            log.info("AI content after cleaning: {}", content);

            JsonNode translationNode = objectMapper.readTree(content);
            Map<String, String> result = Map.of(
                    "word", translationNode.path("word").asText(word),
                    "translation", translationNode.path("translation").asText(""),
                    "partOfSpeech", translationNode.path("partOfSpeech").asText(""),
                    "example", translationNode.path("example").asText(""),
                    "exampleTranslation", translationNode.path("exampleTranslation").asText("")
            );
            log.info("Translation result: {}", result);
            return result;
        } catch (Exception e) {
            log.error("Error translating word '{}': {}", word, e.getMessage(), e);
            return Map.of("word", word, "translation", "", "partOfSpeech", "", "example", "", "exampleTranslation", "");
        }
    }
}
