package com.enlist.be.service;

import com.enlist.be.dto.PaginatedResponse;
import com.enlist.be.dto.ParagraphCreateRequest;
import com.enlist.be.dto.ParagraphResponse;
import com.enlist.be.dto.PreviousAttemptResponse;
import com.enlist.be.entity.Paragraph;
import com.enlist.be.entity.ParagraphSession;
import com.enlist.be.entity.SessionSummary;
import com.enlist.be.repository.ParagraphRepository;
import com.enlist.be.repository.ParagraphSessionRepository;
import com.enlist.be.repository.SessionSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParagraphService {

    private final ParagraphRepository paragraphRepository;
    private final SessionSummaryRepository sessionSummaryRepository;
    private final ParagraphSessionRepository sessionRepository;

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

    public PaginatedResponse<ParagraphResponse> getParagraphsPaginated(
            String difficulty,
            String topic,
            String search,
            int page,
            int pageSize,
            String sortBy,
            String sortOrder,
            Long userId) {
        
        Sort sort = Sort.by(
            "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC,
            sortBy != null ? sortBy : "id"
        );
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        
        Page<Paragraph> paragraphPage = paragraphRepository.findWithFilters(
                difficulty,
                topic,
                search,
                pageable
        );
        
        if (userId == null) {
            return PaginatedResponse.fromPage(paragraphPage, ParagraphResponse::fromEntity);
        }
        
        return PaginatedResponse.fromPage(paragraphPage, paragraph -> {
            String completionStatus = calculateCompletionStatus(paragraph.getId(), userId);
            return ParagraphResponse.fromEntityWithStatus(paragraph, completionStatus);
        });
    }

    private String calculateCompletionStatus(Long paragraphId, Long userId) {
        List<ParagraphSession> sessions = sessionRepository
                .findByUserIdAndParagraphIdOrderByIdDesc(userId, paragraphId);
        
        if (sessions.isEmpty()) {
            return "not_started";
        }
        
        for (ParagraphSession session : sessions) {
            if (session.getStatus() == ParagraphSession.Status.COMPLETED) {
                return "completed";
            }
            if (session.getStatus() == ParagraphSession.Status.IN_PROGRESS) {
                return "in_progress";
            }
        }
        
        return "not_started";
    }

    public List<String> getAllTopics() {
        return paragraphRepository.findAllTopics();
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

    public List<PreviousAttemptResponse> getPreviousAttempts(Long paragraphId, Long userId) {
        List<SessionSummary> summaries = sessionSummaryRepository
                .findByParagraphIdAndUserIdOrderByCreatedAtDesc(paragraphId, userId);

        List<PreviousAttemptResponse> attempts = new ArrayList<>();
        for (SessionSummary summary : summaries) {
            ParagraphSession session = sessionRepository.findById(summary.getSession().getId())
                    .orElse(null);
            
            if (session != null && session.getStatus() == ParagraphSession.Status.COMPLETED) {
                attempts.add(PreviousAttemptResponse.builder()
                        .sessionId(session.getId())
                        .completedAt(session.getCompletedAt())
                        .averageAccuracy(summary.getAverageAccuracy())
                        .totalErrors(summary.getTotalErrors())
                        .completedSentences(summary.getCompletedSentences())
                        .totalSentences(summary.getTotalSentences())
                        .totalPoints(summary.getTotalPoints())
                        .build());
            }
        }

        return attempts;
    }
}
