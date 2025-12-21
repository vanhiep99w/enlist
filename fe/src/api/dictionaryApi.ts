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

export const saveWordToDictionary = async (request: SaveWordRequest): Promise<DictionaryWord> => {
  const response = await authAxios.post<DictionaryWord>(`/dictionary/save`, request);
  return response.data;
};

export const getUserDictionary = async (): Promise<DictionaryWord[]> => {
  const response = await authAxios.get<DictionaryWord[]>(`/dictionary/user`);
  return response.data;
};

export const getSessionDictionary = async (sessionId: number): Promise<DictionaryWord[]> => {
  const response = await authAxios.get<DictionaryWord[]>(`/dictionary/session/${sessionId}`);
  return response.data;
};

export const deleteWord = async (wordId: number): Promise<void> => {
  await authAxios.delete(`/dictionary/${wordId}`);
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
