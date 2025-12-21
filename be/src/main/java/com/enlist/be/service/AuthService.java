package com.enlist.be.service;

import com.enlist.be.dto.AuthResponse;
import com.enlist.be.dto.LoginRequest;
import com.enlist.be.dto.RegisterRequest;
import com.enlist.be.dto.UserResponse;
import com.enlist.be.entity.User;
import com.enlist.be.exception.BadRequestException;
import com.enlist.be.repository.UserRepository;
import com.enlist.be.security.CustomUserDetailsService;
import com.enlist.be.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername());

        return AuthResponse.of(token, user.getId(), user.getUsername(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userDetailsService.loadUserEntityByUsername(request.getUsername());
        String token = jwtUtils.generateToken(user.getUsername());

        return AuthResponse.of(token, user.getId(), user.getUsername(), user.getEmail());
    }

    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userDetailsService.loadUserEntityByUsername(username);

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .totalPoints(user.getTotalPoints())
                .credits(user.getCredits())
                .sessionsCompleted(user.getSessionsCompleted())
                .dailyGoal(user.getDailyGoal())
                .dailyProgressCount(user.getDailyProgressCount())
                .currentStreak(user.getCurrentStreak())
                .longestStreak(user.getLongestStreak())
                .lastActivityDate(user.getLastActivityDate())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
