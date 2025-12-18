package com.enlist.be.repository;

import com.enlist.be.entity.Paragraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParagraphRepository extends JpaRepository<Paragraph, Long> {

    List<Paragraph> findByDifficulty(String difficulty);

    List<Paragraph> findByTopic(String topic);

    List<Paragraph> findByDifficultyAndTopic(String difficulty, String topic);

    List<Paragraph> findByTitleContainingIgnoreCase(String title);
}
