package com.enlist.be.controller;

import com.enlist.be.entity.User;
import com.enlist.be.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<User>> getGlobalLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(limit));
    }

    @GetMapping("/rank/{userId}")
    public ResponseEntity<Integer> getUserRank(@PathVariable Long userId) {
        return ResponseEntity.ok(leaderboardService.getUserRank(userId));
    }
}
