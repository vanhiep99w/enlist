package com.enlist.be.controller;

import com.enlist.be.dto.SpendCreditsRequest;
import com.enlist.be.dto.SpendCreditsResponse;
import com.enlist.be.dto.UserCreditsResponse;
import com.enlist.be.service.CreditsService;
import com.enlist.be.service.DailyGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final CreditsService creditsService;
    private final DailyGoalService dailyGoalService;

    @GetMapping("/{userId}/credits")
    public ResponseEntity<UserCreditsResponse> getUserCredits(@PathVariable Long userId) {
        return ResponseEntity.ok(creditsService.getUserCredits(userId));
    }

    @PostMapping("/credits/spend")
    public ResponseEntity<SpendCreditsResponse> spendCredits(@RequestBody SpendCreditsRequest request) {
        return ResponseEntity.ok(creditsService.spendCredits(request));
    }

    @GetMapping("/{userId}/daily-progress")
    public ResponseEntity<Map<String, Object>> getDailyProgress(@PathVariable Long userId) {
        return ResponseEntity.ok(dailyGoalService.getDailyProgress(userId));
    }

    @PutMapping("/{userId}/daily-goal")
    public ResponseEntity<Map<String, Object>> setDailyGoal(
            @PathVariable Long userId,
            @RequestBody Map<String, Integer> request) {
        Integer goal = request.get("dailyGoal");
        dailyGoalService.setDailyGoal(userId, goal);
        return ResponseEntity.ok(dailyGoalService.getDailyProgress(userId));
    }
}
