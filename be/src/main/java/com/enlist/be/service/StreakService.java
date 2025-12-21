package com.enlist.be.service;

import com.enlist.be.entity.User;
import com.enlist.be.exception.ResourceNotFoundException;
import com.enlist.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreakService {

    private final UserRepository userRepository;

    @Transactional
    public void updateStreak(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        LocalDate today = LocalDate.now();
        LocalDate lastActivity = user.getLastActivityDate();

        if (lastActivity == null) {
            user.setCurrentStreak(1);
            user.setLongestStreak(1);
            user.setLastActivityDate(today);
        } else if (lastActivity.equals(today)) {
            return;
        } else {
            long daysSinceLastActivity = ChronoUnit.DAYS.between(lastActivity, today);

            if (daysSinceLastActivity == 1) {
                user.setCurrentStreak(user.getCurrentStreak() + 1);
                if (user.getCurrentStreak() > user.getLongestStreak()) {
                    user.setLongestStreak(user.getCurrentStreak());
                }
            } else {
                user.setCurrentStreak(1);
            }
            user.setLastActivityDate(today);
        }

        userRepository.save(user);
        log.info("Updated streak for user {}: current={}, longest={}",
                userId, user.getCurrentStreak(), user.getLongestStreak());
    }

    @Transactional(readOnly = true)
    public Integer getCurrentStreak(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return user.getCurrentStreak();
    }

    @Transactional(readOnly = true)
    public Integer getLongestStreak(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return user.getLongestStreak();
    }
}
