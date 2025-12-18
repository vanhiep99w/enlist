package com.enlist.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollocationHighlight {
    private String incorrect;
    private String correct;
    private String explanation;
    private List<String> relatedCollocations;
}
