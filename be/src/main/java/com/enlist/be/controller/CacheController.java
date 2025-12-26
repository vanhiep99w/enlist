package com.enlist.be.controller;

import com.enlist.be.service.ParagraphCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cache")
@RequiredArgsConstructor
public class CacheController {

    private final ParagraphCacheService paragraphCacheService;

    @GetMapping("/stats")
    public ResponseEntity<ParagraphCacheService.CacheStats> getCacheStats() {
        return ResponseEntity.ok(paragraphCacheService.getStats());
    }

    @PostMapping("/warmup")
    public ResponseEntity<String> warmupCache(
            @RequestParam(defaultValue = "English") String targetLanguage) {
        paragraphCacheService.warmupCache(targetLanguage);
        return ResponseEntity.ok("Cache warmup started for language: " + targetLanguage);
    }
}
