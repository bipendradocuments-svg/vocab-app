export type WordCategory = 'vocabulary' | 'pronunciation' | 'confusing' | 'phrases';

export type MasteryStatus = 'new' | 'learning' | 'difficult' | 'mastered';

export type ReviewRating = 'forgot' | 'difficult' | 'remembered';

export type NavScreen = 'home' | 'learn' | 'practice' | 'my-words' | 'revision' | 'progress';

export type PracticeMode =
  | 'all-cards'
  | 'vocabulary'
  | 'pronunciation'
  | 'confusing'
  | 'quiz'
  | 'conversation'
  | 'matching';

export interface DialogueTurn {
  speaker: 'A' | 'B';
  name: string;
  line: string;
  isTarget?: boolean;
}

export interface ConversationScenario {
  id: string;
  targetWord: string;
  title: string;
  registerBadge: string;
  hindiMeaning: string;
  turns: DialogueTurn[];
  whenToUse: string;
  professionalTip: string;
  completionSetup: {
    speakerA: string;
    promptHint: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface WordQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: string;
  category: WordCategory;
  badge: string;
  pronunciation: string;
  ipa: string;
  syllables: string[];
  stressedSyllableIndex: number;
  pronunciationTip: string;
  meaning: string;
  hindiMeaning: string;
  memoryAssociation: string;
  imageUrl?: string;
  motifKey: string;
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  quiz: WordQuiz;
  conversationId?: string;
  confusingSetId?: string;
  isDailyFeatured?: boolean;
  inDailyFive?: boolean;
  isCustom?: boolean;
}

export interface ConfusingWordItem {
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  ipa: string;
  hindiMeaning: string;
  englishMeaning: string;
  example: string;
}

export interface ConfusingExercise {
  sentenceWithBlank: string;
  options: string[];
  correctWord: string;
  explanation: string;
}

export interface ConfusingWordSet {
  id: string;
  title: string;
  subtitle: string;
  memoryTrick: string;
  items: ConfusingWordItem[];
  exercises: ConfusingExercise[];
}

export interface VocabularyDataset {
  featuredWordId: string;
  dailySessionWordIds: string[];
  words: VocabWord[];
  confusingSets: ConfusingWordSet[];
  conversations: ConversationScenario[];
}

export interface WordProgress {
  wordId: string;
  saved: boolean;
  status: MasteryStatus;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: number; // epoch ms
  lastReviewedAt?: number;
  timesPracticed: number;
  personalNote?: string;
}

export interface DailySessionState {
  dateKey: string; // YYYY-MM-DD
  completedStages: number[]; // indices 0..4 for Discover, Understand, Practise, Speak, Remember
  wordsIntroducedToday: number;
  reviewsCompletedToday: number;
  quizzesAnsweredToday: number;
  quizzesCorrectToday: number;
}

export interface LearnerSettings {
  learnerName: string;
  dailyGoalWords: number;
  voiceAccent: 'en-IN' | 'en-GB' | 'en-US';
  showHindiByDefault: boolean;
}
