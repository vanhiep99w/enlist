package com.enlist.be.service;

import com.enlist.be.dto.ParagraphCreateRequest;
import com.enlist.be.dto.ParagraphResponse;
import com.enlist.be.entity.Paragraph;
import com.enlist.be.repository.ParagraphRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParagraphService {

    private final ParagraphRepository paragraphRepository;

    public List<ParagraphResponse> getAllParagraphs(String difficulty, String topic) {
        List<Paragraph> paragraphs;
        
        if (difficulty != null && topic != null) {
            paragraphs = paragraphRepository.findByDifficultyAndTopic(difficulty, topic);
        } else if (difficulty != null) {
            paragraphs = paragraphRepository.findByDifficulty(difficulty);
        } else if (topic != null) {
            paragraphs = paragraphRepository.findByTopic(topic);
        } else {
            paragraphs = paragraphRepository.findAll();
        }
        
        return paragraphs.stream()
                .map(ParagraphResponse::fromEntity)
                .toList();
    }

    public ParagraphResponse getParagraphById(Long id) {
        return paragraphRepository.findById(id)
                .map(ParagraphResponse::fromEntity)
                .orElseThrow(() -> new RuntimeException("Paragraph not found: " + id));
    }

    public ParagraphResponse createParagraph(ParagraphCreateRequest request) {
        Paragraph paragraph = Paragraph.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .difficulty(request.getDifficulty())
                .topic(request.getTopic())
                .build();
        
        Paragraph saved = paragraphRepository.save(paragraph);
        return ParagraphResponse.fromEntity(saved);
    }

    public void deleteParagraph(Long id) {
        if (!paragraphRepository.existsById(id)) {
            throw new RuntimeException("Paragraph not found: " + id);
        }
        paragraphRepository.deleteById(id);
    }

    public List<ParagraphResponse> searchParagraphs(String query) {
        return paragraphRepository.findByTitleContainingIgnoreCase(query).stream()
                .map(ParagraphResponse::fromEntity)
                .toList();
    }
}
