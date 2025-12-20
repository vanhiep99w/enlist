package com.enlist.be.repository;

import com.enlist.be.entity.ErrorAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ErrorAnalyticsRepository extends JpaRepository<ErrorAnalytics, Long> {

    Optional<ErrorAnalytics> findByUserIdAndErrorTypeAndErrorCategory(
            Long userId, 
            ErrorAnalytics.ErrorType errorType, 
            String errorCategory
    );

    List<ErrorAnalytics> findByUserIdOrderByCountDesc(Long userId);

    List<ErrorAnalytics> findByUserIdAndErrorType(Long userId, ErrorAnalytics.ErrorType errorType);

    @Query("SELECT e FROM ErrorAnalytics e WHERE e.userId = :userId AND e.lastOccurrence >= :startDate ORDER BY e.count DESC")
    List<ErrorAnalytics> findByUserIdAndLastOccurrenceAfter(
            @Param("userId") Long userId, 
            @Param("startDate") LocalDateTime startDate
    );

    @Query("SELECT e FROM ErrorAnalytics e WHERE e.userId = :userId ORDER BY e.count DESC LIMIT :limit")
    List<ErrorAnalytics> findTopErrorsByUserId(@Param("userId") Long userId, @Param("limit") int limit);
}
