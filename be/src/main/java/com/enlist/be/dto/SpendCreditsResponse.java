package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendCreditsResponse {

    private boolean success;
    private Integer remainingCredits;
    private String message;
}
