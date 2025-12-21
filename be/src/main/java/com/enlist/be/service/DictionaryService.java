package com.enlist.be.service;

import com.enlist.be.dto.DictionaryWordRequest;
import com.enlist.be.dto.DictionaryWordResponse;
import com.enlist.be.entity.DictionaryWord;
import com.enlist.be.repository.DictionaryWordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DictionaryService {

    private final DictionaryWordRepository dictionaryWordRepository;

    @Transactional
    public DictionaryWordResponse saveWord(Long userId, DictionaryWordRequest request) {
        // Check if word already exists for this user
        if (dictionaryWordRepository.existsByUserIdAndWordIgnoreCase(userId, request.getWord())) {
            throw new IllegalArgumentException("Word already exists in dictionary");
        }

        DictionaryWord word = DictionaryWord.builder()
                .userId(userId)
                .sessionId(request.getSessionId())
                .word(request.getWord())
                .translation(request.getTranslation())
                .context(request.getContext())
                .examples(request.getExamples())
                .build();

        DictionaryWord saved = dictionaryWordRepository.save(word);
        return DictionaryWordResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DictionaryWordResponse> getUserDictionary(Long userId) {
        return dictionaryWordRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(DictionaryWordResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DictionaryWordResponse> getSessionDictionary(Long userId, Long sessionId) {
        return dictionaryWordRepository.findByUserIdAndSessionIdOrderByCreatedAtDesc(userId, sessionId)
                .stream()
                .map(DictionaryWordResponse::fromEntity)
                .toList();
    }

    @Transactional
    public void deleteWord(Long userId, Long wordId) {
        DictionaryWord word = dictionaryWordRepository.findById(wordId)
                .orElseThrow(() -> new IllegalArgumentException("Word not found"));

        if (!word.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete this word");
        }

        dictionaryWordRepository.delete(word);
    }
}
