package com.enlist.be.controller;

import com.enlist.be.dto.ProgressAnalyticsResponse;
import com.enlist.be.service.ErrorAnalyticsService;
import com.enlist.be.service.ProgressAnalyticsService;
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

    @GetMapping("/errors/{userId}")
    public ResponseEntity<Map<String, Object>> getDetailedErrorAnalytics(@PathVariable Long userId) {
        return ResponseEntity.ok(errorAnalyticsService.getDetailedAnalytics(userId));
    }

    @GetMapping("/errors/{userId}/distribution")
    public ResponseEntity<Map<String, Object>> getErrorDistribution(@PathVariable Long userId) {
        return ResponseEntity.ok(errorAnalyticsService.getErrorDistribution(userId));
    }

    @GetMapping("/errors/{userId}/trends")
    public ResponseEntity<Map<String, Object>> getErrorTrends(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(errorAnalyticsService.getErrorTrend(userId, days));
    }

    @GetMapping("/errors/{userId}/weak-areas")
    public ResponseEntity<List<Map<String, Object>>> getWeakAreas(@PathVariable Long userId) {
        return ResponseEntity.ok(errorAnalyticsService.getWeakAreas(userId));
    }

    @GetMapping("/errors/{userId}/top")
    public ResponseEntity<List<Map<String, Object>>> getTopErrors(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(errorAnalyticsService.getMostCommonErrors(userId, limit));
    }

    @GetMapping("/common-mistakes/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getCommonMistakes(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(errorAnalyticsService.getMostCommonErrors(userId, limit));
    }

    @GetMapping("/progress/{userId}")
    public ResponseEntity<ProgressAnalyticsResponse> getProgressAnalytics(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(progressAnalyticsService.getProgressAnalytics(userId, days));
    }
}
