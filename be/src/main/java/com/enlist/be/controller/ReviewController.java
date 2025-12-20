package com.enlist.be.controller;

import com.enlist.be.dto.ReviewSubmitRequest;
import com.enlist.be.entity.ReviewCard;
import com.enlist.be.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/due")
    public ResponseEntity<List<ReviewCard>> getDueReviews(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        List<ReviewCard> dueCards = reviewService.getDueCards(userId);
        return ResponseEntity.ok(dueCards);
    }

    @GetMapping("/due/count")
    public ResponseEntity<Map<String, Long>> getDueCount(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        Long count = reviewService.getDueCardCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/submit")
    public ResponseEntity<Void> submitReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ReviewSubmitRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        reviewService.submitReview(userId, request.getSentenceId(), request.getQuality());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewCard>> getAllUserCards(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        List<ReviewCard> cards = reviewService.getAllUserCards(userId);
        return ResponseEntity.ok(cards);
    }
}
