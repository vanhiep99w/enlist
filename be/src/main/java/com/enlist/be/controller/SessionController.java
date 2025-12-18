package com.enlist.be.controller;

import com.enlist.be.dto.*;
import com.enlist.be.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<SessionResponse> createSession(@RequestBody SessionCreateRequest request) {
        return ResponseEntity.ok(sessionService.createSession(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSession(id));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SentenceSubmissionResponse> submitTranslation(
            @PathVariable Long id,
            @RequestBody SentenceSubmitRequest request) {
        return ResponseEntity.ok(sessionService.submitTranslation(id, request));
    }

    @PostMapping("/{id}/skip")
    public ResponseEntity<SentenceSubmissionResponse> skipSentence(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.skipSentence(id));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<SessionProgressResponse> getProgress(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getProgress(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SessionResponse>> getUserSessions(@PathVariable Long userId) {
        return ResponseEntity.ok(sessionService.getUserSessions(userId));
    }
}
