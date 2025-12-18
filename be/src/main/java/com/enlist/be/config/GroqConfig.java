package com.enlist.be.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "groq.api")
@Data
public class GroqConfig {
    private String key;
    private String url;
    private String model;
    private int maxTokens;
    private double temperature;
}
