package com.enlist.be.dto;

import com.enlist.be.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreditsResponse {

    private Long userId;
    private Integer credits;
    private Integer totalPoints;
    private Integer sessionsCompleted;

    public static UserCreditsResponse fromEntity(User user) {
        return UserCreditsResponse.builder()
                .userId(user.getId())
                .credits(user.getCredits())
                .totalPoints(user.getTotalPoints())
                .sessionsCompleted(user.getSessionsCompleted())
                .build();
    }
}
