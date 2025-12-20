package com.enlist.be.service;

import com.enlist.be.entity.ErrorAnalytics;
import com.enlist.be.repository.ErrorAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ErrorAnalyticsService {

    private final ErrorAnalyticsRepository errorAnalyticsRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getErrorDistribution(Long userId) {
        List<ErrorAnalytics> allErrors = errorAnalyticsRepository.findByUserIdOrderByCountDesc(userId);

        Map<String, Integer> byType = new HashMap<>();
        Map<String, Integer> byCategory = new HashMap<>();
        int totalErrors = 0;

        for (ErrorAnalytics error : allErrors) {
            String type = error.getErrorType().name();
            byType.put(type, byType.getOrDefault(type, 0) + error.getCount());
            byCategory.put(error.getErrorCategory(), error.getCount());
            totalErrors += error.getCount();
        }

        Map<String, Object> distribution = new HashMap<>();
        distribution.put("byType", byType);
        distribution.put("byCategory", byCategory);
        distribution.put("totalErrors", totalErrors);
        
        return distribution;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMostCommonErrors(Long userId, int limit) {
        List<ErrorAnalytics> topErrors = errorAnalyticsRepository.findTopErrorsByUserId(userId, limit);

        return topErrors.stream()
                .map(error -> {
                    Map<String, Object> errorMap = new HashMap<>();
                    errorMap.put("errorType", error.getErrorType().name());
                    errorMap.put("errorCategory", error.getErrorCategory());
                    errorMap.put("count", error.getCount());
                    errorMap.put("lastOccurrence", error.getLastOccurrence());
                    return errorMap;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getErrorTrend(Long userId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        LocalDateTime previousPeriodStart = startDate.minusDays(days);
        
        List<ErrorAnalytics> recentErrors = errorAnalyticsRepository
                .findByUserIdAndLastOccurrenceAfter(userId, startDate);
        List<ErrorAnalytics> previousErrors = errorAnalyticsRepository
                .findByUserIdAndLastOccurrenceAfter(userId, previousPeriodStart);

        Map<String, Integer> trendByType = new HashMap<>();
        Map<String, Integer> previousByType = new HashMap<>();
        int totalRecentErrors = 0;
        int totalPreviousErrors = 0;

        for (ErrorAnalytics error : recentErrors) {
            String type = error.getErrorType().name();
            trendByType.put(type, trendByType.getOrDefault(type, 0) + error.getCount());
            totalRecentErrors += error.getCount();
        }

        for (ErrorAnalytics error : previousErrors) {
            if (error.getLastOccurrence().isBefore(startDate)) {
                String type = error.getErrorType().name();
                previousByType.put(type, previousByType.getOrDefault(type, 0) + error.getCount());
                totalPreviousErrors += error.getCount();
            }
        }

        Map<String, Double> trendChange = new HashMap<>();
        for (String type : trendByType.keySet()) {
            int current = trendByType.get(type);
            int previous = previousByType.getOrDefault(type, 0);
            double change = previous == 0 ? 100.0 
                : ((current - previous) * 100.0 / previous);
            trendChange.put(type, Math.round(change * 10.0) / 10.0);
        }

        double overallTrend = totalPreviousErrors == 0 ? 0.0
            : ((totalRecentErrors - totalPreviousErrors) * 100.0 / totalPreviousErrors);

        Map<String, Object> trend = new HashMap<>();
        trend.put("period", days + " days");
        trend.put("byType", trendByType);
        trend.put("totalErrors", totalRecentErrors);
        trend.put("previousPeriodErrors", totalPreviousErrors);
        trend.put("trendChange", trendChange);
        trend.put("overallTrend", Math.round(overallTrend * 10.0) / 10.0);
        trend.put("improving", overallTrend < 0);
        trend.put("startDate", startDate);
        
        return trend;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWeakAreas(Long userId) {
        List<ErrorAnalytics> allErrors = errorAnalyticsRepository.findByUserIdOrderByCountDesc(userId);

        if (allErrors.isEmpty()) {
            return Collections.emptyList();
        }

        int totalErrors = allErrors.stream()
                .mapToInt(ErrorAnalytics::getCount)
                .sum();

        List<Map<String, Object>> weakAreas = new ArrayList<>();

        for (ErrorAnalytics error : allErrors) {
            double percentage = (error.getCount() * 100.0) / totalErrors;
            
            if (percentage >= 10.0) {
                Map<String, Object> weakArea = new HashMap<>();
                weakArea.put("errorType", error.getErrorType().name());
                weakArea.put("errorCategory", error.getErrorCategory());
                weakArea.put("count", error.getCount());
                weakArea.put("percentage", Math.round(percentage * 10.0) / 10.0);
                weakArea.put("severity", calculateSeverity(percentage));
                weakArea.put("lastOccurrence", error.getLastOccurrence());
                weakAreas.add(weakArea);
            }
        }

        weakAreas.sort((a, b) -> 
            Double.compare((Double) b.get("percentage"), (Double) a.get("percentage")));

        return weakAreas;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDetailedAnalytics(Long userId) {
        Map<String, Object> analytics = new HashMap<>();
        
        analytics.put("distribution", getErrorDistribution(userId));
        analytics.put("topErrors", getMostCommonErrors(userId, 5));
        analytics.put("recentTrend", getErrorTrend(userId, 7));
        analytics.put("weakAreas", getWeakAreas(userId));
        
        return analytics;
    }

    private String calculateSeverity(double percentage) {
        if (percentage >= 30.0) return "high";
        if (percentage >= 20.0) return "medium";
        return "low";
    }
}
