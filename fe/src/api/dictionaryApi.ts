import { authAxios } from './authApi';

export interface WordTranslation {
  word: string;
  translation: string;
  partOfSpeech: string;
  example1: string;
  example1Translation: string;
  example2: string;
  example2Translation: string;
}

export interface ExampleSentence {
  vi: string;
  en: string;
}

export interface DictionaryWord {
  id: number;
  word: string;
  translation: string;
  context?: string;
  examples?: ExampleSentence[];
  sessionId?: number;
  createdAt: string;
}

export interface DictionaryEntry {
  id: number;
  word: string;
  translation: string;
  context?: string;
  examples?: ExampleSentence[];
  sessionId?: number;
  createdAt: string;
}

export interface SaveWordRequest {
  sessionId?: number;
  word: string;
  translation: string;
  context?: string;
  examples: ExampleSentence[];
}

export const translateWord = async (word: string, context?: string): Promise<WordTranslation> => {
  const response = await authAxios.post<WordTranslation>('/translate/word', { word, context });
  return response.data;
};

export const lookupWord = async (word: string): Promise<WordTranslation> => {
  return translateWord(word);
};

export const saveWordToDictionary = async (
  userId: number,
  request: SaveWordRequest
): Promise<DictionaryWord> => {
  const response = await authAxios.post<DictionaryWord>(
    `/dictionary/save?userId=${userId}`,
    request
  );
  return response.data;
};

export const getUserDictionary = async (userId: number): Promise<DictionaryWord[]> => {
  const response = await authAxios.get<DictionaryWord[]>(`/dictionary/user/${userId}`);
  return response.data;
};

export const getSessionDictionary = async (
  userId: number,
  sessionId: number
): Promise<DictionaryWord[]> => {
  const response = await authAxios.get<DictionaryWord[]>(
    `/dictionary/session/${userId}/${sessionId}`
  );
  return response.data;
};

export const deleteWord = async (userId: number, wordId: number): Promise<void> => {
  await authAxios.delete(`/dictionary/${userId}/${wordId}`);
};

export interface WordExample {
  id?: number;
  word: string;
  exampleSentence: string;
  translation: string;
  source: string;
}

export const getWordExamples = async (word: string): Promise<WordExample[]> => {
  const response = await authAxios.get<WordExample[]>(
    `/words/${encodeURIComponent(word)}/examples`
  );
  return response.data;
};
