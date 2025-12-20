package com.enlist.be.repository;

import com.enlist.be.entity.WordExample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordExampleRepository extends JpaRepository<WordExample, Long> {

    List<WordExample> findByWordIgnoreCase(String word);
}
