package com.enlist.be.service;

import com.enlist.be.entity.ReviewCard;
import com.enlist.be.repository.ReviewCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewCardRepository reviewCardRepository;
    private final SM2Algorithm sm2Algorithm;

    @Transactional
    public void addToReviewQueue(Long userId, Long sentenceId) {
        reviewCardRepository.findByUserIdAndSentenceId(userId, sentenceId)
                .ifPresentOrElse(
                        card -> log.debug("Card already exists for user {} and sentence {}", userId, sentenceId),
                        () -> {
                            ReviewCard newCard = ReviewCard.builder()
                                    .userId(userId)
                                    .sentenceId(sentenceId)
                                    .nextReviewDate(LocalDateTime.now().plusDays(1))
                                    .intervalDays(1)
                                    .easeFactor(2.5)
                                    .repetitions(0)
                                    .build();
                            reviewCardRepository.save(newCard);
                            log.info("Added sentence {} to review queue for user {}", sentenceId, userId);
                        }
                );
    }

    @Transactional
    public void submitReview(Long userId, Long sentenceId, int quality) {
        ReviewCard card = reviewCardRepository.findByUserIdAndSentenceId(userId, sentenceId)
                .orElseThrow(() -> new RuntimeException("Review card not found"));

        SM2Algorithm.SM2Result result = sm2Algorithm.calculate(
                quality,
                card.getIntervalDays(),
                card.getEaseFactor(),
                card.getRepetitions()
        );

        card.setIntervalDays(result.getIntervalDays());
        card.setEaseFactor(result.getEaseFactor());
        card.setRepetitions(result.getRepetitions());
        card.setNextReviewDate(LocalDateTime.now().plusDays(result.getIntervalDays()));

        reviewCardRepository.save(card);
        log.info("Updated review card for user {} sentence {}: interval={}, ease={}, reps={}",
                userId, sentenceId, result.getIntervalDays(), result.getEaseFactor(), result.getRepetitions());
    }

    @Transactional(readOnly = true)
    public List<ReviewCard> getDueCards(Long userId) {
        return reviewCardRepository.findDueCards(userId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public Long getDueCardCount(Long userId) {
        return reviewCardRepository.countDueCards(userId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<ReviewCard> getAllUserCards(Long userId) {
        return reviewCardRepository.findByUserId(userId);
    }
}
