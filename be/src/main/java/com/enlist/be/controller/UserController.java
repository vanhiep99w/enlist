package com.enlist.be.controller;

import com.enlist.be.dto.SpendCreditsRequest;
import com.enlist.be.dto.SpendCreditsResponse;
import com.enlist.be.dto.UserCreditsResponse;
import com.enlist.be.entity.UserAchievement;
import com.enlist.be.service.AchievementService;
import com.enlist.be.service.CreditsService;
import com.enlist.be.service.DailyGoalService;
import com.enlist.be.service.StreakService;
import com.enlist.be.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final CreditsService creditsService;
    private final DailyGoalService dailyGoalService;
    private final StreakService streakService;
    private final AchievementService achievementService;

    @GetMapping("/credits")
    public ResponseEntity<UserCreditsResponse> getUserCredits() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(creditsService.getUserCredits(userId));
    }

    @PostMapping("/credits/spend")
    public ResponseEntity<SpendCreditsResponse> spendCredits(@RequestBody SpendCreditsRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(creditsService.spendCredits(userId, request));
    }

    @GetMapping("/daily-progress")
    public ResponseEntity<Map<String, Object>> getDailyProgress() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(dailyGoalService.getDailyProgress(userId));
    }

    @PutMapping("/daily-goal")
    public ResponseEntity<Map<String, Object>> setDailyGoal(@RequestBody Map<String, Integer> request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Integer goal = request.get("dailyGoal");
        dailyGoalService.setDailyGoal(userId, goal);
        return ResponseEntity.ok(dailyGoalService.getDailyProgress(userId));
    }

    @GetMapping("/streak")
    public ResponseEntity<Map<String, Integer>> getStreak() {
        Long userId = SecurityUtils.getCurrentUserId();
        Map<String, Integer> streak = new HashMap<>();
        streak.put("currentStreak", streakService.getCurrentStreak(userId));
        streak.put("longestStreak", streakService.getLongestStreak(userId));
        return ResponseEntity.ok(streak);
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<UserAchievement>> getUserAchievements() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(achievementService.getUserAchievements(userId));
    }
}
