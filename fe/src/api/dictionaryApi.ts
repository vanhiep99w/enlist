export interface DictionaryDefinition {
  definition: string;
  example?: string;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: DictionaryMeaning[];
}

export async function lookupWord(word: string): Promise<DictionaryEntry | null> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    const entry = data[0];
    return {
      word: entry.word,
      phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
      meanings: entry.meanings?.map((m: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions?.slice(0, 3).map((d: { definition: string; example?: string }) => ({
          definition: d.definition,
          example: d.example,
        })) || [],
      })) || [],
    };
  } catch {
    return null;
  }
}
