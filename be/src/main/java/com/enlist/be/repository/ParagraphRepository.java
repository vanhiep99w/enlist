package com.enlist.be.repository;

import com.enlist.be.entity.Paragraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParagraphRepository extends JpaRepository<Paragraph, Long>, JpaSpecificationExecutor<Paragraph> {

    List<Paragraph> findByDifficulty(String difficulty);

    List<Paragraph> findByTopic(String topic);

    List<Paragraph> findByDifficultyAndTopic(String difficulty, String topic);

    List<Paragraph> findByTitleContainingIgnoreCase(String title);

    Page<Paragraph> findByDifficulty(String difficulty, Pageable pageable);

    Page<Paragraph> findByTopic(String topic, Pageable pageable);

    Page<Paragraph> findByDifficultyAndTopic(String difficulty, String topic, Pageable pageable);

    @Query(value = "SELECT * FROM paragraphs p WHERE " +
           "(:difficulty IS NULL OR p.difficulty = :difficulty) AND " +
           "(:topic IS NULL OR p.topic = :topic) AND " +
           "(:search IS NULL OR LOWER(p.title::text) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.content::text) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(*) FROM paragraphs p WHERE " +
           "(:difficulty IS NULL OR p.difficulty = :difficulty) AND " +
           "(:topic IS NULL OR p.topic = :topic) AND " +
           "(:search IS NULL OR LOWER(p.title::text) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.content::text) LIKE LOWER(CONCAT('%', :search, '%')))",
           nativeQuery = true)
    Page<Paragraph> findWithFilters(
            @Param("difficulty") String difficulty,
            @Param("topic") String topic,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT DISTINCT p.topic FROM Paragraph p WHERE p.topic IS NOT NULL ORDER BY p.topic")
    List<String> findAllTopics();
}
