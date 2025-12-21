package com.enlist.be.controller;

import com.enlist.be.dto.PaginatedResponse;
import com.enlist.be.dto.ParagraphCreateRequest;
import com.enlist.be.dto.ParagraphResponse;
import com.enlist.be.dto.PreviousAttemptResponse;
import com.enlist.be.service.ParagraphService;
import com.enlist.be.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paragraphs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ParagraphController {

    private final ParagraphService paragraphService;

    @GetMapping
    public ResponseEntity<PaginatedResponse<ParagraphResponse>> getAllParagraphs(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int pageSize,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        Long userId = null;
        try {
            userId = SecurityUtils.getCurrentUserId();
        } catch (IllegalStateException e) {
            // User not authenticated, userId will remain null
        }
        return ResponseEntity.ok(paragraphService.getParagraphsPaginated(
                difficulty, topic, search, page, pageSize, sortBy, sortOrder, userId));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<String>> getAllTopics() {
        return ResponseEntity.ok(paragraphService.getAllTopics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParagraphResponse> getParagraphById(@PathVariable Long id) {
        return ResponseEntity.ok(paragraphService.getParagraphById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ParagraphResponse>> searchParagraphs(@RequestParam String query) {
        return ResponseEntity.ok(paragraphService.searchParagraphs(query));
    }

    @PostMapping
    public ResponseEntity<ParagraphResponse> createParagraph(@RequestBody ParagraphCreateRequest request) {
        return ResponseEntity.ok(paragraphService.createParagraph(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParagraph(@PathVariable Long id) {
        paragraphService.deleteParagraph(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/previous-attempts")
    public ResponseEntity<List<PreviousAttemptResponse>> getPreviousAttempts(
            @PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(paragraphService.getPreviousAttempts(id, userId));
    }
}
