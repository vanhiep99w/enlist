package com.enlist.be.controller;

import com.enlist.be.dto.TranslationFeedback;
import com.enlist.be.dto.TranslationRequest;
import com.enlist.be.dto.TranslationResponse;
import com.enlist.be.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/translate")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TranslationController {

    private final AIService aiService;

    @PostMapping("/evaluate")
    public ResponseEntity<TranslationResponse> evaluate(@RequestBody TranslationRequest request) {
        TranslationFeedback feedback = aiService.evaluateTranslation(
                request.getOriginalText(),
                request.getUserTranslation()
        );

        TranslationResponse response = TranslationResponse.builder()
                .submissionId(System.currentTimeMillis())
                .feedback(feedback)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/word")
    public ResponseEntity<Map<String, String>> translateWord(@RequestBody String word) {
        Map<String, String> translation = aiService.translateWord(word);
        return ResponseEntity.ok(translation);
    }
}
