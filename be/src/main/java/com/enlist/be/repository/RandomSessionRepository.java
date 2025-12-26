package com.enlist.be.repository;

import com.enlist.be.entity.RandomSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RandomSessionRepository extends JpaRepository<RandomSession, Long> {

    List<RandomSession> findByUserId(Long userId);

    List<RandomSession> findByUserIdAndStatus(Long userId, RandomSession.Status status);

    Optional<RandomSession> findFirstByUserIdAndStatusOrderByIdDesc(Long userId, RandomSession.Status status);

    List<RandomSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT rs FROM RandomSession rs LEFT JOIN FETCH rs.paragraphs WHERE rs.id = :id")
    Optional<RandomSession> findByIdWithParagraphs(@Param("id") Long id);
}
