package com.enlist.be.repository;

import com.enlist.be.entity.SentenceSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SentenceSubmissionRepository extends JpaRepository<SentenceSubmission, Long> {

    List<SentenceSubmission> findBySessionId(Long sessionId);

    List<SentenceSubmission> findBySessionIdAndSentenceIndex(Long sessionId, Integer sentenceIndex);

    Optional<SentenceSubmission> findTopBySessionIdAndSentenceIndexOrderBySubmittedAtDesc(Long sessionId, Integer sentenceIndex);
}
