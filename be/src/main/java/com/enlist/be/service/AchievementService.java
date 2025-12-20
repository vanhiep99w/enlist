package com.enlist.be.service;

import com.enlist.be.entity.Achievement;
import com.enlist.be.entity.User;
import com.enlist.be.entity.UserAchievement;
import com.enlist.be.repository.AchievementRepository;
import com.enlist.be.repository.UserAchievementRepository;
import com.enlist.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserRepository userRepository;

    @Transactional
    public void checkAndUnlockAchievements(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Achievement> allAchievements = achievementRepository.findAll();

        for (Achievement achievement : allAchievements) {
            if (!userAchievementRepository.existsByUserIdAndAchievementId(
                    userId, achievement.getId())) {
                if (isAchievementUnlocked(user, achievement)) {
                    unlockAchievement(userId, achievement.getId());
                }
            }
        }
    }

    private boolean isAchievementUnlocked(User user, Achievement achievement) {
        String category = achievement.getCategory();
        Integer requirement = achievement.getRequirementValue();

        if (requirement == null) {
            return false;
        }

        switch (category) {
            case "STREAK":
                return user.getCurrentStreak() >= requirement;
            case "POINTS":
                return user.getTotalPoints() >= requirement;
            case "SESSIONS":
                return user.getSessionsCompleted() >= requirement;
            default:
                return false;
        }
    }

    @Transactional
    public void unlockAchievement(Long userId, Long achievementId) {
        if (userAchievementRepository.existsByUserIdAndAchievementId(
                userId, achievementId)) {
            return;
        }

        UserAchievement userAchievement = UserAchievement.builder()
                .userId(userId)
                .achievementId(achievementId)
                .build();

        userAchievementRepository.save(userAchievement);
        log.info("Unlocked achievement {} for user {}", achievementId, userId);
    }

    @Transactional(readOnly = true)
    public List<UserAchievement> getUserAchievements(Long userId) {
        return userAchievementRepository.findByUserId(userId);
    }
}
