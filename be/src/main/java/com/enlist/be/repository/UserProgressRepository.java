package com.enlist.be.repository;

import com.enlist.be.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    Optional<UserProgress> findByUserIdAndDate(Long userId, LocalDate date);

    List<UserProgress> findByUserIdAndDateBetweenOrderByDateAsc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<UserProgress> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT SUM(up.sentencesCompleted) FROM UserProgress up "
            + "WHERE up.userId = :userId AND up.date BETWEEN :startDate AND :endDate")
    Integer sumSentencesCompletedByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT AVG(up.accuracyRate) FROM UserProgress up "
            + "WHERE up.userId = :userId AND up.date BETWEEN :startDate AND :endDate")
    Double avgAccuracyRateByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
