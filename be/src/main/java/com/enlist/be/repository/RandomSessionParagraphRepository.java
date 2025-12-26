package com.enlist.be.repository;

import com.enlist.be.entity.RandomSessionParagraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RandomSessionParagraphRepository extends JpaRepository<RandomSessionParagraph, Long> {

    List<RandomSessionParagraph> findByRandomSessionIdOrderByOrderIndexAsc(Long randomSessionId);

    Optional<RandomSessionParagraph> findByRandomSessionIdAndOrderIndex(Long randomSessionId, Integer orderIndex);

    Optional<RandomSessionParagraph> findByParagraphSessionId(Long paragraphSessionId);

    Optional<RandomSessionParagraph> findFirstByRandomSessionIdAndStatusOrderByOrderIndexDesc(
            Long randomSessionId, RandomSessionParagraph.Status status);

    List<RandomSessionParagraph> findByRandomSessionIdAndStatus(
            Long randomSessionId, RandomSessionParagraph.Status status);

    Long countByRandomSessionIdAndStatus(Long randomSessionId, RandomSessionParagraph.Status status);
}
