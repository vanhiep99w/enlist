package com.enlist.be.controller;

import com.enlist.be.dto.DictionaryWordRequest;
import com.enlist.be.dto.DictionaryWordResponse;
import com.enlist.be.service.DictionaryService;
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
    public ResponseEntity<DictionaryWordResponse> saveWord(
            @RequestParam Long userId,
            @RequestBody DictionaryWordRequest request) {
        return ResponseEntity.ok(dictionaryService.saveWord(userId, request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DictionaryWordResponse>> getUserDictionary(@PathVariable Long userId) {
        return ResponseEntity.ok(dictionaryService.getUserDictionary(userId));
    }

    @GetMapping("/session/{userId}/{sessionId}")
    public ResponseEntity<List<DictionaryWordResponse>> getSessionDictionary(
            @PathVariable Long userId,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(dictionaryService.getSessionDictionary(userId, sessionId));
    }

    @DeleteMapping("/{userId}/{wordId}")
    public ResponseEntity<Void> deleteWord(
            @PathVariable Long userId,
            @PathVariable Long wordId) {
        dictionaryService.deleteWord(userId, wordId);
        return ResponseEntity.ok().build();
    }
}
