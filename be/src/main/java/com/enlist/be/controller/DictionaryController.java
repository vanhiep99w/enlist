package com.enlist.be.controller;

import com.enlist.be.dto.DictionaryWordRequest;
import com.enlist.be.dto.DictionaryWordResponse;
import com.enlist.be.service.DictionaryService;
import com.enlist.be.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dictionary")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @PostMapping("/save")
    public ResponseEntity<DictionaryWordResponse> saveWord(@Valid @RequestBody DictionaryWordRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(dictionaryService.saveWord(userId, request));
    }

    @GetMapping("/user")
    public ResponseEntity<List<DictionaryWordResponse>> getUserDictionary() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(dictionaryService.getUserDictionary(userId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<DictionaryWordResponse>> getSessionDictionary(@PathVariable Long sessionId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(dictionaryService.getSessionDictionary(userId, sessionId));
    }

    @DeleteMapping("/{wordId}")
    public ResponseEntity<Void> deleteWord(@PathVariable Long wordId) {
        Long userId = SecurityUtils.getCurrentUserId();
        dictionaryService.deleteWord(userId, wordId);
        return ResponseEntity.ok().build();
    }
}
