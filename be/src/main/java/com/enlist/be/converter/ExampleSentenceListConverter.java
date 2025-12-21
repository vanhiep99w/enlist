package com.enlist.be.converter;

import com.enlist.be.dto.ExampleSentence;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Collections;
import java.util.List;

@Converter
public class ExampleSentenceListConverter implements AttributeConverter<List<ExampleSentence>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<ExampleSentence> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert examples to JSON", e);
        }
    }

    @Override
    public List<ExampleSentence> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(dbData, new TypeReference<List<ExampleSentence>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert JSON to examples", e);
        }
    }
}
