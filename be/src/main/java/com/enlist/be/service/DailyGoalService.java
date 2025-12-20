package com.enlist.be.service;

import com.enlist.be.entity.User;
import com.enlist.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DailyGoalService {

    private final UserRepository userRepository;

    @Transactional
    public void incrementDailyProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        resetProgressIfNeeded(user);
        user.setDailyProgressCount(user.getDailyProgressCount() + 1);
        userRepository.save(user);

        log.debug("Incremented daily progress for user {}: {}/{}", 
                userId, user.getDailyProgressCount(), user.getDailyGoal());
    }

    @Transactional
    public void setDailyGoal(Long userId, Integer goal) {
        if (goal == null || goal <= 0) {
            throw new IllegalArgumentException("Daily goal must be positive");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setDailyGoal(goal);
        userRepository.save(user);

        log.info("Updated daily goal for user {} to {}", userId, goal);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDailyProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        resetProgressIfNeeded(user);

        Map<String, Object> progress = new HashMap<>();
        progress.put("dailyGoal", user.getDailyGoal());
        progress.put("progressCount", user.getDailyProgressCount());
        progress.put("goalAchieved", user.getDailyProgressCount() >= user.getDailyGoal());
        progress.put("percentage", calculatePercentage(user.getDailyProgressCount(), user.getDailyGoal()));
        progress.put("lastResetDate", user.getLastProgressResetDate());

        return progress;
    }

    @Transactional(readOnly = true)
    public boolean isGoalAchieved(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        resetProgressIfNeeded(user);
        return user.getDailyProgressCount() >= user.getDailyGoal();
    }

    private void resetProgressIfNeeded(User user) {
        LocalDate today = LocalDate.now();
        LocalDate lastReset = user.getLastProgressResetDate();

        if (lastReset == null || lastReset.isBefore(today)) {
            user.setDailyProgressCount(0);
            user.setLastProgressResetDate(today);
            userRepository.save(user);
            log.info("Reset daily progress for user {}", user.getId());
        }
    }

    private double calculatePercentage(Integer current, Integer goal) {
        if (goal == null || goal == 0) {
            return 0.0;
        }
        return Math.min(100.0, (current * 100.0) / goal);
    }
}
