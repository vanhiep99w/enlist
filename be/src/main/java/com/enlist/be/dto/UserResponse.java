package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private Integer totalPoints;
    private Integer credits;
    private Integer sessionsCompleted;
    private Integer dailyGoal;
    private Integer dailyProgressCount;
    private Integer currentStreak;
    private Integer longestStreak;
    private LocalDate lastActivityDate;
    private LocalDateTime createdAt;
}
