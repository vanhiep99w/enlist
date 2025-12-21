package com.enlist.be.repository;

import com.enlist.be.entity.ParagraphSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParagraphSessionRepository extends JpaRepository<ParagraphSession, Long> {

    List<ParagraphSession> findByUserId(Long userId);

    List<ParagraphSession> findByUserIdAndStatus(Long userId, ParagraphSession.Status status);

    Optional<ParagraphSession> findFirstByUserIdAndParagraphIdAndStatusOrderByIdDesc(Long userId, Long paragraphId, ParagraphSession.Status status);

    List<ParagraphSession> findByParagraphId(Long paragraphId);

    List<ParagraphSession> findByUserIdAndParagraphIdOrderByIdDesc(Long userId, Long paragraphId);
}
