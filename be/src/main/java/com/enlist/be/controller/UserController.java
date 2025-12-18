package com.enlist.be.controller;

import com.enlist.be.dto.SpendCreditsRequest;
import com.enlist.be.dto.SpendCreditsResponse;
import com.enlist.be.dto.UserCreditsResponse;
import com.enlist.be.service.CreditsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final CreditsService creditsService;

    @GetMapping("/{userId}/credits")
    public ResponseEntity<UserCreditsResponse> getUserCredits(@PathVariable Long userId) {
        return ResponseEntity.ok(creditsService.getUserCredits(userId));
    }

    @PostMapping("/credits/spend")
    public ResponseEntity<SpendCreditsResponse> spendCredits(@RequestBody SpendCreditsRequest request) {
        return ResponseEntity.ok(creditsService.spendCredits(request));
    }
}
