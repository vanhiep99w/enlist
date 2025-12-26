package com.enlist.be.repository;

import com.enlist.be.entity.AIMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AIMetricsRepository extends JpaRepository<AIMetrics, Long> {
    
    List<AIMetrics> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    List<AIMetrics> findByOperationType(String operationType);
    
    @Query("SELECT AVG(m.latencyMs) FROM AIMetrics m WHERE m.success = true AND m.operationType = :operationType")
    Double getAverageLatency(String operationType);
    
    @Query("SELECT AVG(m.promptLength) FROM AIMetrics m WHERE m.operationType = :operationType")
    Double getAveragePromptLength(String operationType);
    
    @Query("SELECT AVG(m.responseLength) FROM AIMetrics m WHERE m.operationType = :operationType")
    Double getAverageResponseLength(String operationType);
    
    @Query("SELECT COUNT(m) * 1.0 / (SELECT COUNT(n) FROM AIMetrics n WHERE n.operationType = :operationType) " +
           "FROM AIMetrics m WHERE m.operationType = :operationType AND m.success = false")
    Double getFailureRate(String operationType);
}
