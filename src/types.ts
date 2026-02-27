export interface CommonWord {
  word: string;
  transliteration: string;
  meaning: string;
}

export interface ArabicRoot {
  id: number | string;
  root_arabic: string;
  root_transliterated: string;
  root_letters: string[];
  core_meaning: string;
  common_words: CommonWord[];
  difficulty: number;
  frequency_rank: number;
}

export interface UserProgress {
  root_id: number | string;
  correct_count: number;
  incorrect_count: number;
  last_reviewed: string | null;
  status: 'new' | 'learning' | 'mastered';
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}
