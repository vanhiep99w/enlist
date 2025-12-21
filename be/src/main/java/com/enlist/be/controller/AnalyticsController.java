package com.enlist.be.controller;

import com.enlist.be.dto.ProgressAnalyticsResponse;
import com.enlist.be.service.ErrorAnalyticsService;
import com.enlist.be.service.ProgressAnalyticsService;
import com.enlist.be.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final ErrorAnalyticsService errorAnalyticsService;
    private final ProgressAnalyticsService progressAnalyticsService;

    @GetMapping("/errors")
    public ResponseEntity<Map<String, Object>> getDetailedErrorAnalytics() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(errorAnalyticsService.getDetailedAnalytics(userId));
    }

    @GetMapping("/errors/distribution")
    public ResponseEntity<Map<String, Object>> getErrorDistribution() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(errorAnalyticsService.getErrorDistribution(userId));
    }

    @GetMapping("/errors/trends")
    public ResponseEntity<Map<String, Object>> getErrorTrends(@RequestParam(defaultValue = "7") int days) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(errorAnalyticsService.getErrorTrend(userId, days));
    }

    @GetMapping("/errors/weak-areas")
    public ResponseEntity<List<Map<String, Object>>> getWeakAreas() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(errorAnalyticsService.getWeakAreas(userId));
    }

    @GetMapping("/errors/top")
    public ResponseEntity<List<Map<String, Object>>> getTopErrors(@RequestParam(defaultValue = "5") int limit) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(errorAnalyticsService.getMostCommonErrors(userId, limit));
    }

    @GetMapping("/common-mistakes")
    public ResponseEntity<List<Map<String, Object>>> getCommonMistakes(@RequestParam(defaultValue = "10") int limit) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(errorAnalyticsService.getMostCommonErrors(userId, limit));
    }

    @GetMapping("/progress")
    public ResponseEntity<ProgressAnalyticsResponse> getProgressAnalytics(@RequestParam(defaultValue = "30") int days) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(progressAnalyticsService.getProgressAnalytics(userId, days));
    }
}
