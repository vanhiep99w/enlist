package com.enlist.be.service;

import com.enlist.be.dto.SpendCreditsRequest;
import com.enlist.be.dto.SpendCreditsResponse;
import com.enlist.be.dto.UserCreditsResponse;
import com.enlist.be.entity.User;
import com.enlist.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditsService {

    private final UserRepository userRepository;

    private static final int HINT_COST = 1;
    private static final int BONUS_CREDITS_PER_SESSION = 2;

    public UserCreditsResponse getUserCredits(Long userId) {
        User user = getOrCreateUser(userId);
        return UserCreditsResponse.fromEntity(user);
    }

    @Transactional
    public SpendCreditsResponse spendCredits(SpendCreditsRequest request) {
        User user = getOrCreateUser(request.getUserId());

        int amount = request.getAmount() != null ? request.getAmount() : HINT_COST;

        if (user.getCredits() < amount) {
            return SpendCreditsResponse.builder()
                    .success(false)
                    .remainingCredits(user.getCredits())
                    .message("Insufficient credits. You have " + user.getCredits() + " credits but need " + amount)
                    .build();
        }

        user.spendCredits(amount);
        userRepository.save(user);

        log.info("User {} spent {} credits for: {}", user.getId(), amount, request.getReason());

        return SpendCreditsResponse.builder()
                .success(true)
                .remainingCredits(user.getCredits())
                .message("Successfully spent " + amount + " credits")
                .build();
    }

    @Transactional
    public void awardPointsForSession(Long userId, int pointsEarned, boolean sessionCompleted) {
        User user = getOrCreateUser(userId);

        user.addPoints(pointsEarned);

        if (sessionCompleted) {
            user.incrementSessionsCompleted();
            user.earnCredits(BONUS_CREDITS_PER_SESSION);
            log.info("User {} completed session. Awarded {} points and {} bonus credits",
                    userId, pointsEarned, BONUS_CREDITS_PER_SESSION);
        }

        userRepository.save(user);
    }

    @Transactional
    public void earnCredits(Long userId, int amount) {
        User user = getOrCreateUser(userId);
        user.earnCredits(amount);
        userRepository.save(user);
        log.info("User {} earned {} credits", userId, amount);
    }

    private User getOrCreateUser(Long userId) {
        return userRepository.findById(userId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .id(userId)
                            .username("user" + userId)
                            .credits(10)
                            .totalPoints(0)
                            .sessionsCompleted(0)
                            .build();
                    return userRepository.save(newUser);
                });
    }
}
