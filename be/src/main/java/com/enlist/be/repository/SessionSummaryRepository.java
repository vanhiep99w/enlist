package com.enlist.be.repository;

import com.enlist.be.entity.SessionSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionSummaryRepository extends JpaRepository<SessionSummary, Long> {

    Optional<SessionSummary> findBySessionId(Long sessionId);

    @Query("SELECT ss FROM SessionSummary ss WHERE ss.paragraphId = :paragraphId "
            + "AND ss.userId = :userId ORDER BY ss.createdAt DESC")
    List<SessionSummary> findByParagraphIdAndUserIdOrderByCreatedAtDesc(Long paragraphId,
                                                                         Long userId);
}
