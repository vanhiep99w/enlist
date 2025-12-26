package com.enlist.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final StringRedisTemplate redisTemplate;

    private static final int HOURLY_LIMIT = 100; // Increased for development
    private static final int DAILY_LIMIT = 50;
    private static final String HOURLY_KEY_PREFIX = "ratelimit:hourly:";
    private static final String DAILY_KEY_PREFIX = "ratelimit:daily:";

    /**
     * Check if user can generate a new paragraph
     * @return true if allowed, false if rate limit exceeded
     */
    public boolean canGenerateParagraph(Long userId) {
        String hourlyKey = buildHourlyKey(userId);
        String dailyKey = buildDailyKey(userId);

        Integer hourlyCount = getCount(hourlyKey);
        Integer dailyCount = getCount(dailyKey);

        boolean allowedHourly = hourlyCount < HOURLY_LIMIT;
        boolean allowedDaily = dailyCount < DAILY_LIMIT;

        if (!allowedHourly) {
            log.warn("User {} exceeded hourly rate limit ({}/{})",
                userId, hourlyCount, HOURLY_LIMIT);
        }
        if (!allowedDaily) {
            log.warn("User {} exceeded daily rate limit ({}/{})",
                userId, dailyCount, DAILY_LIMIT);
        }

        return allowedHourly && allowedDaily;
    }

    /**
     * Record a paragraph generation for rate limiting
     */
    public void recordParagraphGeneration(Long userId) {
        String hourlyKey = buildHourlyKey(userId);
        String dailyKey = buildDailyKey(userId);

        incrementCounter(hourlyKey, Duration.ofHours(1));
        incrementCounter(dailyKey, Duration.ofDays(1));

        log.debug("Recorded paragraph generation for user {}", userId);
    }

    /**
     * Get current usage stats for a user
     */
    public UsageStats getUserUsageStats(Long userId) {
        String hourlyKey = buildHourlyKey(userId);
        String dailyKey = buildDailyKey(userId);

        int hourlyUsed = getCount(hourlyKey);
        int dailyUsed = getCount(dailyKey);

        long hourlyTtl = getTtl(hourlyKey);
        long dailyTtl = getTtl(dailyKey);

        return new UsageStats(
            hourlyUsed,
            HOURLY_LIMIT,
            hourlyTtl,
            dailyUsed,
            DAILY_LIMIT,
            dailyTtl
        );
    }

    /**
     * Reset limits for a user (admin function)
     */
    public void resetUserLimits(Long userId) {
        String hourlyKey = buildHourlyKey(userId);
        String dailyKey = buildDailyKey(userId);

        redisTemplate.delete(hourlyKey);
        redisTemplate.delete(dailyKey);

        log.info("Reset rate limits for user {}", userId);
    }

    private String buildHourlyKey(Long userId) {
        long currentHour = System.currentTimeMillis() / (1000 * 60 * 60);
        return HOURLY_KEY_PREFIX + userId + ":" + currentHour;
    }

    private String buildDailyKey(Long userId) {
        long currentDay = System.currentTimeMillis() / (1000 * 60 * 60 * 24);
        return DAILY_KEY_PREFIX + userId + ":" + currentDay;
    }

    private Integer getCount(String key) {
        String value = redisTemplate.opsForValue().get(key);
        return value != null ? Integer.parseInt(value) : 0;
    }

    private void incrementCounter(String key, Duration ttl) {
        Long newValue = redisTemplate.opsForValue().increment(key, 1);
        if (newValue != null && newValue == 1) {
            redisTemplate.expire(key, ttl);
        }
    }

    private long getTtl(String key) {
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        return ttl != null && ttl > 0 ? ttl : 0;
    }

    public record UsageStats(
        int hourlyUsed,
        int hourlyLimit,
        long hourlyResetSeconds,
        int dailyUsed,
        int dailyLimit,
        long dailyResetSeconds
    ) {
        public boolean isHourlyLimitReached() {
            return hourlyUsed >= hourlyLimit;
        }

        public boolean isDailyLimitReached() {
            return dailyUsed >= dailyLimit;
        }

        public boolean isRateLimited() {
            return isHourlyLimitReached() || isDailyLimitReached();
        }
    }
}
