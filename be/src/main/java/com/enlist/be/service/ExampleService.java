package com.enlist.be.service;

import com.enlist.be.config.GroqConfig;
import com.enlist.be.dto.WordExampleResponse;
import com.enlist.be.entity.WordExample;
import com.enlist.be.repository.WordExampleRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExampleService {

    private final WordExampleRepository wordExampleRepository;
    private final GroqConfig groqConfig;
    private final WebClient webClient;
    private final RedisTemplate<String, Object> redisTemplate;
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

    public List<WordExampleResponse> getExamplesForWord(String word) {
        String cacheKey = "word_examples:" + word.toLowerCase();
        
        @SuppressWarnings("unchecked")
        List<WordExampleResponse> cached = (List<WordExampleResponse>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.info("Retrieved {} examples for '{}' from cache", cached.size(), word);
            return cached;
        }

        List<WordExample> dbExamples = wordExampleRepository.findByWordIgnoreCase(word);
        
        if (!dbExamples.isEmpty()) {
            List<WordExampleResponse> responses = dbExamples.stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
            
            redisTemplate.opsForValue().set(cacheKey, responses, 24, TimeUnit.HOURS);
            log.info("Retrieved {} examples for '{}' from database", responses.size(), word);
            return responses;
        }

        List<WordExampleResponse> aiExamples = generateExamplesFromAI(word);
        
        for (WordExampleResponse response : aiExamples) {
            WordExample entity = WordExample.builder()
                    .word(word)
                    .exampleSentence(response.getExampleSentence())
                    .translation(response.getTranslation())
                    .source(response.getSource())
                    .build();
            wordExampleRepository.save(entity);
        }

        redisTemplate.opsForValue().set(cacheKey, aiExamples, 24, TimeUnit.HOURS);
        log.info("Generated and cached {} examples for '{}' from AI", aiExamples.size(), word);
        
        return aiExamples;
    }

    private List<WordExampleResponse> generateExamplesFromAI(String word) {
        String prompt = String.format(
                "Generate 3 example sentences for the Vietnamese word '%s'. " +
                "For each example, provide:\n" +
                "1. A Vietnamese sentence using the word\n" +
                "2. English translation of the sentence\n\n" +
                "Format your response as JSON array:\n" +
                "[{\"sentence\": \"...\", \"translation\": \"...\"}]",
                word
        );

        Map<String, Object> requestBody = Map.of(
                "model", groqConfig.getModel(),
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 500,
                "temperature", 0.7
        );

        try {
            String response = groqClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseAIResponse(response, word);
        } catch (Exception e) {
            log.error("Error generating examples from AI: {}", e.getMessage(), e);
            return getDefaultExamples(word);
        }
    }

    private List<WordExampleResponse> parseAIResponse(String response, String word) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode content = root.path("choices").get(0).path("message").path("content");
            String contentText = content.asText();

            int jsonStart = contentText.indexOf('[');
            int jsonEnd = contentText.lastIndexOf(']') + 1;
            
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                String jsonArray = contentText.substring(jsonStart, jsonEnd);
                JsonNode examples = objectMapper.readTree(jsonArray);

                List<WordExampleResponse> result = new ArrayList<>();
                for (JsonNode example : examples) {
                    result.add(WordExampleResponse.builder()
                            .word(word)
                            .exampleSentence(example.path("sentence").asText())
                            .translation(example.path("translation").asText())
                            .source("AI")
                            .build());
                }
                return result;
            }
        } catch (Exception e) {
            log.error("Error parsing AI response: {}", e.getMessage(), e);
        }
        
        return getDefaultExamples(word);
    }

    private List<WordExampleResponse> getDefaultExamples(String word) {
        return List.of(
                WordExampleResponse.builder()
                        .word(word)
                        .exampleSentence("Example not available")
                        .translation("Translation not available")
                        .source("System")
                        .build()
        );
    }

    private WordExampleResponse toResponse(WordExample entity) {
        return WordExampleResponse.builder()
                .id(entity.getId())
                .word(entity.getWord())
                .exampleSentence(entity.getExampleSentence())
                .translation(entity.getTranslation())
                .source(entity.getSource())
                .build();
    }
}
