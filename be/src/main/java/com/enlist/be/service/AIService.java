package com.enlist.be.service;

import com.enlist.be.config.GroqConfig;
import com.enlist.be.dto.ArticleTip;
import com.enlist.be.dto.CollocationHighlight;
import com.enlist.be.dto.GoodPoint;
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
        // Check for gibberish/nonsense input before calling AI
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
            
            // Validate and fix error positions
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
                      "correction": "<ONLY the corrected word/phrase to replace errorText - MUST match what's used in correctTranslation>",
                      "explanation": "<detailed explanation in Vietnamese>",
                      "quickFix": "<one-line fix suggestion>",
                      "category": "<optional: ARTICLE|COLLOCATION|PREPOSITION|VERB_FORM|WORD_ORDER|REGISTER|null>",
                      "learningTip": "<optional: memory tip for Vietnamese speakers>",
                      "startIndex": <character index where error starts in student's translation>,
                      "endIndex": <character index where error ends in student's translation>,
                      "errorText": "<exact text from student's translation that contains the error>"
                    }
                  ],
                  "suggestions": ["<improvement tip 1>", ...],
                  "correctTranslation": "<COMPLETE and ACCURATE translation of the original Vietnamese sentence - must capture ALL meaning from the original, not just fix student errors>",
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
                  ],
                  "overallComment": "<1-2 sentence summary in Vietnamese: what went well, what to improve>",
                  "goodPoints": [
                    {
                      "phrase": "<exact phrase from student's translation that was good>",
                      "reason": "<why this is good, in Vietnamese>",
                      "type": "WORD_CHOICE|GRAMMAR|NATURALNESS"
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
                
                ⚠️ CRITICAL - CORRECT TRANSLATION REQUIREMENTS:
                The correctTranslation field MUST be a COMPLETE translation of the original Vietnamese sentence:
                - Include ALL parts of the original meaning (subject, verb, object, modifiers, clauses)
                - Do NOT just fix the student's errors - provide the FULL correct translation
                - Example: If original is "Cuối tuần là thời gian quý báu để gia đình tôi sum họp"
                  - WRONG: "Weekend is a valuable time" (incomplete - missing "for my family to gather")
                  - CORRECT: "The weekend is a valuable time for my family to gather"
                
                ALWAYS include goodPoints to highlight what the student did well:
                - Good word choices that match the context
                - Correct grammar patterns (especially articles, prepositions)
                - Natural-sounding phrases or idiomatic expressions
                - Include at least 1-2 goodPoints for any translation that shows genuine effort
                
                ⚠️ CRITICAL - DETECT NONSENSE/GIBBERISH INPUT:
                If the student's translation is:
                - Random letters or characters (e.g., \"abc\", \"xyz\", \"asdf\")
                - Single words that don't form a sentence
                - Completely unrelated to the original text
                - Not a valid English sentence or attempt at translation
                Then ALL scores MUST be 0-10%%. Do NOT be lenient with nonsense input.
                
                Error severity levels (deduct accordingly):
                - CRITICAL (score 0-10%%): Nonsense, gibberish, random characters, or completely unrelated text
                - IGNORE (0 points): Capitalization errors (\"i\" vs \"I\"), minor punctuation, extra spaces
                - MINOR (-2 to -5 points): Common Vietnamese learner mistakes like article errors (\"a breakfast\" vs \"breakfast\"), slight word order differences that don't affect meaning
                - MODERATE (-5 to -10 points): Wrong prepositions, incorrect verb tenses, collocation errors, SPELLING ERRORS
                - MAJOR (-10 to -20 points): Missing key words, wrong meaning, incomprehensible grammar, WRONG TRANSLATION of Vietnamese cultural terms
                
                ⚠️ SPELLING ERRORS - MUST DETECT:
                Always check for and mark spelling mistakes as WORD_CHOICE errors:
                - "noddle" → "noodle", "specical" → "special", "breakfest" → "breakfast"
                - Even if the word is close, if it's misspelled, mark it as an error
                
                ⚠️ VIETNAMESE FOOD & CULTURAL TERMS - TRANSLATION ACCURACY:
                Vietnamese food names must be translated accurately:
                - "bánh cuốn" = "rice rolls" or "steamed rice rolls" (NOT "noodles")
                - "phở" = "pho" or "Vietnamese noodle soup"
                - "bánh mì" = "Vietnamese sandwich" or "banh mi"
                - "cà phê sữa đá" = "iced coffee with condensed milk" (NOT just "coffee")
                If student uses wrong food translation (e.g., "noodles" for "bánh cuốn"), mark as WORD_CHOICE error with correct translation.
                
                Scoring guide:
                - grammarScore: syntax, verb forms, articles, prepositions, sentence structure. Start at 95 if meaning is correct. Score 0-10 for nonsense.
                - wordChoiceScore: vocabulary accuracy, collocations, word forms. Start at 95 if words convey the meaning. Score 0-10 for nonsense.
                - naturalnessScore: natural phrasing, tone, fluency, idiomatic expressions. Start at 90 for understandable translations. Score 0-10 for nonsense.
                - overallScore: weighted average (Grammar 40%%, Word Choice 30%%, Naturalness 30%%)
                
                IMPORTANT: A translation that conveys the same meaning with minor errors should score 85-95%%. 
                Only translations with significant meaning errors or major grammar issues should score below 80%%.
                Nonsense or gibberish input MUST score below 10%%.
                
                PARAGRAPH COHERENCE - CRITICAL:
                If paragraph context is provided, you MUST ensure tense consistency:
                - If the paragraph describes PAST events (e.g., "Tháng trước tôi đi...", "Hôm qua...", "Năm ngoái..."), ALL sentences should use PAST TENSE
                - If student uses present tense for a past-context paragraph, mark as GRAMMAR error and correct to past tense
                - The correctTranslation MUST use the appropriate tense matching the paragraph context
                - Example: If context is about "last month's trip", "I'm in the hotel" should be corrected to "I was in the hotel"
                
                ERROR POSITION CALCULATION - CRITICAL:
                For each error, you MUST provide accurate character positions:
                - startIndex: 0-based index of the first character of the error in the student's translation
                - endIndex: 0-based index of the character AFTER the last character of the error (exclusive)
                - errorText: the exact substring from student's translation (must match translation.substring(startIndex, endIndex))
                - correction: ONLY the replacement for errorText, NOT the entire corrected sentence
                - Example: "I go to school" - if "go" is wrong:
                  - startIndex=2, endIndex=4, errorText="go", correction="went" (NOT "I went to school")
                - Example: "it have any type" - if "it have" should be "There are":
                  - startIndex=0, endIndex=7, errorText="it have", correction="There are"
                - For missing words (e.g., missing article), use the position where word should be inserted, with startIndex=endIndex
                
                ⚠️ CRITICAL - SEPARATE ERRORS FOR EACH ISSUE:
                Create INDIVIDUAL error entries for each distinct mistake. Do NOT combine multiple errors into one large span.
                - Example: "my mother prepare the breakfast with noddle" has multiple errors:
                  - Error 1: startIndex=10, endIndex=17, errorText="prepare", correction="prepares" (GRAMMAR: verb agreement)
                  - Error 2: startIndex=18, endIndex=31, errorText="the breakfast", correction="a special breakfast" (WORD_CHOICE: wrong article + missing adjective)
                  - Error 3: startIndex=37, endIndex=43, errorText="noddle", correction="rice rolls" (WORD_CHOICE: wrong translation)
                - WRONG: Only catching some errors and missing others
                - Each error should target the SMALLEST possible span containing just that specific mistake
                
                ⚠️ CATCH ALL ERRORS - DO NOT MISS ANY:
                Compare student's translation word-by-word with correctTranslation:
                - GRAMMAR: subject-verb agreement (prepare→prepares), tense, articles
                - WORD_CHOICE: wrong words, missing words (like "special"), wrong translations
                - SPELLING: typos (noddle→noodle, but use correctTranslation term)
                If a word/phrase in student's text differs from correctTranslation, it's likely an error!
                
                ⚠️ IMPORTANT: The "correction" field must be a DIRECT REPLACEMENT for "errorText". 
                If you replace errorText with correction in the original sentence, it should produce the correct sentence.
                NEVER put the entire corrected sentence in the "correction" field.
                
                ⚠️⚠️⚠️ FINAL CHECK - MOST IMPORTANT ⚠️⚠️⚠️
                Before returning your response, VERIFY that every "correction" value in the errors array 
                appears EXACTLY in the "correctTranslation" string.
                
                STEP-BY-STEP PROCESS:
                1. First, write the correctTranslation (complete, accurate translation of original Vietnamese)
                2. For each error, check: does my "correction" value appear in correctTranslation?
                   - YES → keep it
                   - NO → change correction to match what's in correctTranslation
                
                EXAMPLE OF WRONG vs RIGHT:
                - Original Vietnamese: "bánh cuốn và cà phê"
                - correctTranslation: "rice rolls and coffee"
                - Student wrote: "noddle and caffee"
                
                ❌ WRONG corrections: noddle→"noodle", caffee→"cafe" (these don't appear in correctTranslation!)
                ✅ RIGHT corrections: noddle→"rice rolls", caffee→"coffee" (these match correctTranslation!)
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
                        .explanation(errorNode.path("explanation").asText())
                        .quickFix(errorNode.path("quickFix").asText())
                        .category(errorNode.path("category").asText(null))
                        .learningTip(errorNode.path("learningTip").asText(null))
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
        String overallComment = feedbackNode.path("overallComment").asText(null);

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
                .articleTips(articleTips)
                .collocationHighlights(collocationHighlights)
                .reasoningTips(reasoningTips)
                .registerTips(registerTips)
                .overallComment(overallComment)
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
            
            // Validate indices are within bounds
            if (startIndex < 0 || endIndex > userTranslation.length() || startIndex >= endIndex) {
                // Try to find errorText in the user translation and fix indices
                if (errorText != null && !errorText.isEmpty()) {
                    int foundIndex = userTranslation.indexOf(errorText);
                    if (foundIndex >= 0) {
                        error.setStartIndex(foundIndex);
                        error.setEndIndex(foundIndex + errorText.length());
                        log.debug("Fixed error position for '{}': {} -> {}", errorText, startIndex, foundIndex);
                    } else {
                        // Try case-insensitive search
                        int foundIndexIgnoreCase = userTranslation.toLowerCase().indexOf(errorText.toLowerCase());
                        if (foundIndexIgnoreCase >= 0) {
                            error.setStartIndex(foundIndexIgnoreCase);
                            error.setEndIndex(foundIndexIgnoreCase + errorText.length());
                            error.setErrorText(userTranslation.substring(foundIndexIgnoreCase, foundIndexIgnoreCase + errorText.length()));
                        } else {
                            // Clear invalid positions
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
            
            // Verify errorText matches the substring at the given positions
            String actualText = userTranslation.substring(startIndex, endIndex);
            if (errorText != null && !errorText.equals(actualText)) {
                // AI provided wrong indices, try to find the actual position of errorText
                int foundIndex = userTranslation.indexOf(errorText);
                if (foundIndex >= 0) {
                    error.setStartIndex(foundIndex);
                    error.setEndIndex(foundIndex + errorText.length());
                    log.debug("Corrected error position for '{}': was [{},{}], now [{},{}]", 
                            errorText, startIndex, endIndex, foundIndex, foundIndex + errorText.length());
                } else {
                    // Try case-insensitive search
                    int foundIndexIgnoreCase = userTranslation.toLowerCase().indexOf(errorText.toLowerCase());
                    if (foundIndexIgnoreCase >= 0) {
                        error.setStartIndex(foundIndexIgnoreCase);
                        error.setEndIndex(foundIndexIgnoreCase + errorText.length());
                        error.setErrorText(userTranslation.substring(foundIndexIgnoreCase, foundIndexIgnoreCase + errorText.length()));
                    } else {
                        // Keep the actual text from the given positions as errorText
                        error.setErrorText(actualText);
                    }
                }
            } else if (errorText == null) {
                // Set errorText from the actual substring
                error.setErrorText(actualText);
            }
        }
    }
    
    private boolean isGibberishInput(String input) {
        if (input == null || input.trim().isEmpty()) {
            return true;
        }
        
        String trimmed = input.trim().toLowerCase();
        
        // Too short to be a valid sentence (less than 2 characters)
        if (trimmed.length() < 2) {
            return true;
        }
        
        // Common gibberish patterns
        String[] gibberishPatterns = {"abc", "xyz", "asdf", "qwerty", "test", "aaa", "bbb", "ccc", "123", "xxx"};
        for (String pattern : gibberishPatterns) {
            if (trimmed.equals(pattern) || trimmed.matches("^[" + pattern.charAt(0) + "]+$")) {
                return true;
            }
        }
        
        // Single short word (less than 4 chars) without spaces - likely not a valid translation
        if (!trimmed.contains(" ") && trimmed.length() < 4) {
            return true;
        }
        
        // Only consonants or only the same repeated character
        if (trimmed.matches("^[bcdfghjklmnpqrstvwxyz]+$") && trimmed.length() < 6) {
            return true;
        }
        
        // Repeated single character
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
                                .explanation("Bạn cần nhập một câu tiếng Anh hoàn chỉnh để dịch câu tiếng Việt đã cho.")
                                .quickFix("Hãy đọc câu tiếng Việt và dịch sang tiếng Anh")
                                .build()
                ))
                .suggestions(List.of("Vui lòng nhập một bản dịch tiếng Anh hợp lệ cho câu tiếng Việt."))
                .correctTranslation("")
                .build();
    }

    public Map<String, String> translateWord(String word) {
        String prompt = String.format("""
                Detect the language of this word/phrase and translate it:
                - If ENGLISH -> translate to Vietnamese
                - If VIETNAMESE -> translate to English
                
                Word/Phrase: %s
                
                Respond with ONLY valid JSON (no markdown, no explanation):
                {
                  "word": "%s",
                  "translation": "<translation in target language>",
                  "partOfSpeech": "<noun|verb|adjective|adverb|phrase|preposition|conjunction|etc>",
                  "example": "<example sentence using this word in its original language>",
                  "exampleTranslation": "<translation of the example to target language>"
                }
                """, word, word);

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
