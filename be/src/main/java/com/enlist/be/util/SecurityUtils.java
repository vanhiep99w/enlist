package com.enlist.be.util;

import com.enlist.be.security.CustomUserDetailsService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private static CustomUserDetailsService userDetailsService;

    public SecurityUtils(CustomUserDetailsService userDetailsService) {
        SecurityUtils.userDetailsService = userDetailsService;
    }

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }
        String username = authentication.getName();
        return userDetailsService.loadUserEntityByUsername(username).getId();
    }
}
