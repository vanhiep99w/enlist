package com.enlist.be.repository;

import com.enlist.be.entity.ReviewCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewCardRepository extends JpaRepository<ReviewCard, Long> {

    Optional<ReviewCard> findByUserIdAndSentenceId(Long userId, Long sentenceId);

    @Query("SELECT r FROM ReviewCard r WHERE r.userId = :userId " +
            "AND r.nextReviewDate <= :now ORDER BY r.nextReviewDate ASC")
    List<ReviewCard> findDueCards(@Param("userId") Long userId,
                                   @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(r) FROM ReviewCard r WHERE r.userId = :userId " +
            "AND r.nextReviewDate <= :now")
    Long countDueCards(@Param("userId") Long userId,
                       @Param("now") LocalDateTime now);

    List<ReviewCard> findByUserId(Long userId);
}
