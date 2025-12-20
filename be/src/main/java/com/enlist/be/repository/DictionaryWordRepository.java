package com.enlist.be.repository;

import com.enlist.be.entity.DictionaryWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DictionaryWordRepository extends JpaRepository<DictionaryWord, Long> {
    List<DictionaryWord> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<DictionaryWord> findByUserIdAndSessionIdOrderByCreatedAtDesc(Long userId, Long sessionId);
    boolean existsByUserIdAndWordIgnoreCase(Long userId, String word);
}
