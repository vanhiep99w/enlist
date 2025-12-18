package com.enlist.be.controller;

import com.enlist.be.dto.ParagraphCreateRequest;
import com.enlist.be.dto.ParagraphResponse;
import com.enlist.be.service.ParagraphService;
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
    public ResponseEntity<List<ParagraphResponse>> getAllParagraphs(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String topic) {
        return ResponseEntity.ok(paragraphService.getAllParagraphs(difficulty, topic));
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
}
