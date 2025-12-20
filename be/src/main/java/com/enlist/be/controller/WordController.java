package com.enlist.be.controller;

import com.enlist.be.dto.WordExampleResponse;
import com.enlist.be.service.ExampleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/words")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WordController {

    private final ExampleService exampleService;

    @GetMapping("/{word}/examples")
    public ResponseEntity<List<WordExampleResponse>> getExamples(@PathVariable String word) {
        List<WordExampleResponse> examples = exampleService.getExamplesForWord(word);
        return ResponseEntity.ok(examples);
    }
}
