package com.enlist.be.service;

import com.enlist.be.entity.User;
import com.enlist.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<User> getGlobalLeaderboard(int limit) {
        List<User> allUsers = userRepository.findAll();
        return allUsers.stream()
                .sorted((u1, u2) -> Integer.compare(
                        u2.getTotalPoints(), u1.getTotalPoints()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Integer getUserRank(Long userId) {
        List<User> allUsers = userRepository.findAll();
        List<User> sortedUsers = allUsers.stream()
                .sorted((u1, u2) -> Integer.compare(
                        u2.getTotalPoints(), u1.getTotalPoints()))
                .collect(Collectors.toList());

        for (int i = 0; i < sortedUsers.size(); i++) {
            if (sortedUsers.get(i).getId().equals(userId)) {
                return i + 1;
            }
        }
        return null;
    }
}
