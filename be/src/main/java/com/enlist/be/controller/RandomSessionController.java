package com.enlist.be.controller;

import com.enlist.be.dto.RandomSessionCreateRequest;
import com.enlist.be.dto.RandomSessionResponse;
import com.enlist.be.service.RandomSessionService;
import com.enlist.be.service.RateLimitService;
import com.enlist.be.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/random-sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RandomSessionController {

    private final RandomSessionService randomSessionService;
    private final RateLimitService rateLimitService;

    @PostMapping
    public ResponseEntity<RandomSessionResponse> createRandomSession(
            @RequestBody RandomSessionCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(randomSessionService.createRandomSession(userId, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RandomSessionResponse> getRandomSession(@PathVariable Long id) {
        return ResponseEntity.ok(randomSessionService.getRandomSession(id));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<RandomSessionResponse> endRandomSession(@PathVariable Long id) {
        return ResponseEntity.ok(randomSessionService.endRandomSession(id));
    }

    @GetMapping("/user")
    public ResponseEntity<List<RandomSessionResponse>> getUserRandomSessions() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(randomSessionService.getUserRandomSessions(userId));
    }

    @PostMapping("/{id}/next-paragraph")
    public ResponseEntity<RandomSessionResponse> generateNextParagraph(@PathVariable Long id) {
        return ResponseEntity.ok(randomSessionService.generateNextParagraphForSession(id));
    }

    @GetMapping("/usage-stats")
    public ResponseEntity<RateLimitService.UsageStats> getUsageStats() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(rateLimitService.getUserUsageStats(userId));
    }
}
