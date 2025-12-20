import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface WordTranslation {
  word: string;
  translation: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
}

export interface DictionaryWord {
  id: number;
  word: string;
  translation: string;
  context?: string;
  sessionId?: number;
  createdAt: string;
}

export interface DictionaryEntry {
  id: number;
  word: string;
  translation: string;
  context?: string;
  sessionId?: number;
  createdAt: string;
}

export interface SaveWordRequest {
  sessionId?: number;
  word: string;
  translation: string;
  context?: string;
}

export const translateWord = async (word: string): Promise<WordTranslation> => {
  const response = await axios.post<WordTranslation>(
    `${API_BASE_URL}/api/translate/word`,
    word,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

export const lookupWord = async (word: string): Promise<WordTranslation> => {
  return translateWord(word);
};

export const saveWordToDictionary = async (userId: number, request: SaveWordRequest): Promise<DictionaryWord> => {
  const response = await axios.post<DictionaryWord>(
    `${API_BASE_URL}/api/dictionary/save?userId=${userId}`,
    request
  );
  return response.data;
};

export const getUserDictionary = async (userId: number): Promise<DictionaryWord[]> => {
  const response = await axios.get<DictionaryWord[]>(
    `${API_BASE_URL}/api/dictionary/user/${userId}`
  );
  return response.data;
};

export const getSessionDictionary = async (userId: number, sessionId: number): Promise<DictionaryWord[]> => {
  const response = await axios.get<DictionaryWord[]>(
    `${API_BASE_URL}/api/dictionary/session/${userId}/${sessionId}`
  );
  return response.data;
};

export const deleteWord = async (userId: number, wordId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/dictionary/${userId}/${wordId}`);
};
