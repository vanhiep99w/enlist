package com.enlist.be.service;

import com.enlist.be.dto.ProgressAnalyticsResponse;
import com.enlist.be.dto.ProgressDataPoint;
import com.enlist.be.dto.ProgressSummary;
import com.enlist.be.entity.UserProgress;
import com.enlist.be.repository.UserProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressAnalyticsService {

    private final UserProgressRepository userProgressRepository;

    public ProgressAnalyticsResponse getProgressAnalytics(Long userId, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        List<UserProgress> progressList = userProgressRepository
                .findByUserIdAndDateBetweenOrderByDateAsc(userId, startDate, endDate);

        List<ProgressDataPoint> dataPoints = progressList.stream()
                .map(this::toDataPoint)
                .collect(Collectors.toList());

        ProgressSummary summary = calculateSummary(progressList);

        return ProgressAnalyticsResponse.builder()
                .dataPoints(dataPoints)
                .summary(summary)
                .build();
    }

    public UserProgress getOrCreateDailyProgress(Long userId, LocalDate date) {
        return userProgressRepository.findByUserIdAndDate(userId, date)
                .orElseGet(() -> createNewProgress(userId, date));
    }

    public void recordAttempt(Long userId, boolean successful, int pointsEarned) {
        LocalDate today = LocalDate.now();
        UserProgress progress = getOrCreateDailyProgress(userId, today);
        progress.recordAttempt(successful);
        if (successful) {
            progress.incrementSentences();
            progress.addPoints(pointsEarned);
        }
        userProgressRepository.save(progress);
    }

    private UserProgress createNewProgress(Long userId, LocalDate date) {
        return UserProgress.builder()
                .userId(userId)
                .date(date)
                .sentencesCompleted(0)
                .accuracyRate(0.0)
                .totalAttempts(0)
                .successfulAttempts(0)
                .pointsEarned(0)
                .timeSpentMinutes(0)
                .build();
    }

    private ProgressDataPoint toDataPoint(UserProgress progress) {
        return ProgressDataPoint.builder()
                .date(progress.getDate())
                .sentencesCompleted(progress.getSentencesCompleted())
                .accuracyRate(progress.getAccuracyRate())
                .pointsEarned(progress.getPointsEarned())
                .totalAttempts(progress.getTotalAttempts())
                .build();
    }

    private ProgressSummary calculateSummary(List<UserProgress> progressList) {
        int totalSentences = progressList.stream()
                .mapToInt(UserProgress::getSentencesCompleted)
                .sum();

        double avgAccuracy = progressList.stream()
                .mapToDouble(UserProgress::getAccuracyRate)
                .average()
                .orElse(0.0);

        int totalPoints = progressList.stream()
                .mapToInt(UserProgress::getPointsEarned)
                .sum();

        int totalAttempts = progressList.stream()
                .mapToInt(UserProgress::getTotalAttempts)
                .sum();

        long activeDays = progressList.stream()
                .filter(p -> p.getSentencesCompleted() > 0)
                .count();

        return ProgressSummary.builder()
                .totalSentences(totalSentences)
                .averageAccuracy(avgAccuracy)
                .totalPoints(totalPoints)
                .totalAttempts(totalAttempts)
                .activeDays((int) activeDays)
                .build();
    }
}
