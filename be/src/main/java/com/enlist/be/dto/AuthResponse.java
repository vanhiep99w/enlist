package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type;
    private Long id;
    private String username;
    private String email;

    public static AuthResponse of(String token, Long id, String username, String email) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(id)
                .username(username)
                .email(email)
                .build();
    }
}
