import rawDataset from '../data/vocabulary.json';
import type {
  DailySessionState,
  LearnerSettings,
  MasteryStatus,
  ReviewRating,
  VocabularyDataset,
  VocabWord,
  WordProgress,
} from '../types/vocab';

export const dataset = rawDataset as VocabularyDataset;

const PROGRESS_KEY = 'wordup_word_progress_v1';
const CUSTOM_WORDS_KEY = 'wordup_custom_words_v1';
const SESSION_KEY = 'wordup_daily_session_v1';
const SETTINGS_KEY = 'wordup_learner_settings_v1';
const HISTORY_KEY = 'wordup_study_days_v1';

const AUDIO_DB_NAME = 'wordup_voice_recordings_db';
const AUDIO_STORE_NAME = 'recordings';

export function getTodayDateKey(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function loadCustomWords(): VocabWord[] {
  try {
    const raw = localStorage.getItem(CUSTOM_WORDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VocabWord[];
  } catch {
    return [];
  }
}

export function saveCustomWords(words: VocabWord[]): void {
  localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(words));
}

function buildInitialProgress(allWords: VocabWord[]): Record<string, WordProgress> {
  const now = Date.now();
  const hourMs = 3600 * 1000;
  const dayMs = 24 * hourMs;
  const map: Record<string, WordProgress> = {};

  // Seed realistic personal notebook state on first launch:
  // - 5 Daily new words ('new', saved in daily session)
  // - 11+ previously studied words due for revision or mastered so "Words to revise" & filters feel rich immediately
  allWords.forEach((w, index) => {
    if (w.inDailyFive) {
      map[w.id] = {
        wordId: w.id,
        saved: index < 3, // Serendipity, Nonchalant, Souvenir bookmarked initially
        status: index === 0 ? 'learning' : 'new',
        intervalDays: index === 0 ? 1 : 0,
        easeFactor: 2.5,
        repetitions: index === 0 ? 1 : 0,
        nextReviewAt: index === 0 ? now - 2 * hourMs : now,
        timesPracticed: index === 0 ? 1 : 0,
      };
    } else {
      const isDifficultSeed =
        w.id === 'lose-vs-loose' ||
        w.id === 'mischievous' ||
        w.id === 'subtle' ||
        w.id === 'affect-vs-effect';
      const isMasteredSeed = w.id === 'candid' || w.id === 'eloquent';

      let status: MasteryStatus = 'learning';
      let nextReviewAt = now - (index + 1) * hourMs; // due today!
      let intervalDays = 1;
      let repetitions = 1;

      if (isDifficultSeed) {
        status = 'difficult';
        nextReviewAt = now - 3 * hourMs;
        intervalDays = 1;
      } else if (isMasteredSeed) {
        status = 'mastered';
        nextReviewAt = now + 5 * dayMs;
        intervalDays = 7;
        repetitions = 3;
      }

      map[w.id] = {
        wordId: w.id,
        saved: true,
        status,
        intervalDays,
        easeFactor: isDifficultSeed ? 2.1 : 2.5,
        repetitions,
        nextReviewAt,
        lastReviewedAt: now - 2 * dayMs,
        timesPracticed: repetitions + 1,
      };
    }
  });

  return map;
}

export function loadWordProgress(allWords: VocabWord[]): Record<string, WordProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const base = buildInitialProgress(allWords);
    if (!raw) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(base));
      return base;
    }
    const parsed = JSON.parse(raw) as Record<string, WordProgress>;
    for (const w of allWords) {
      if (!parsed[w.id]) {
        parsed[w.id] = {
          wordId: w.id,
          saved: Boolean(w.isCustom),
          status: 'new',
          intervalDays: 0,
          easeFactor: 2.5,
          repetitions: 0,
          nextReviewAt: Date.now(),
          timesPracticed: 0,
        };
      }
    }
    return parsed;
  } catch {
    return buildInitialProgress(allWords);
  }
}

export function saveWordProgress(progress: Record<string, WordProgress>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function scheduleWordReview(
  prev: WordProgress,
  rating: ReviewRating
): WordProgress {
  const now = Date.now();
  const dayMs = 24 * 3600 * 1000;
  let { intervalDays, easeFactor, repetitions } = prev;
  let status: MasteryStatus = prev.status;

  if (rating === 'forgot') {
    repetitions = 0;
    intervalDays = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    status = 'difficult';
    return {
      ...prev,
      saved: true,
      status,
      intervalDays,
      easeFactor,
      repetitions,
      lastReviewedAt: now,
      nextReviewAt: now + 10 * 60 * 1000, // 10 minutes
      timesPracticed: prev.timesPracticed + 1,
    };
  }

  if (rating === 'difficult') {
    repetitions = Math.max(1, repetitions);
    intervalDays = 1;
    easeFactor = Math.max(1.4, easeFactor - 0.12);
    status = 'difficult';
    return {
      ...prev,
      saved: true,
      status,
      intervalDays,
      easeFactor,
      repetitions,
      lastReviewedAt: now,
      nextReviewAt: now + dayMs,
      timesPracticed: prev.timesPracticed + 1,
    };
  }

  // 'remembered' — active recall success (SM-2 progression)
  repetitions += 1;
  if (repetitions === 1) {
    intervalDays = 3;
  } else if (repetitions === 2) {
    intervalDays = 7;
  } else {
    intervalDays = Math.round(Math.max(7, intervalDays) * easeFactor);
  }
  easeFactor = Math.min(2.9, easeFactor + 0.08);
  status = repetitions >= 2 ? 'mastered' : 'learning';

  return {
    ...prev,
    saved: true,
    status,
    intervalDays,
    easeFactor,
    repetitions,
    lastReviewedAt: now,
    nextReviewAt: now + intervalDays * dayMs,
    timesPracticed: prev.timesPracticed + 1,
  };
}

export function getNextIntervalLabel(prev: WordProgress | undefined, rating: ReviewRating): string {
  if (rating === 'forgot') return '10m';
  if (rating === 'difficult') return '+1d';
  const reps = prev?.repetitions ?? 0;
  if (reps === 0) return '+3d';
  if (reps === 1) return '+7d';
  const days = Math.round(Math.max(7, prev?.intervalDays ?? 7) * (prev?.easeFactor ?? 2.5));
  return `+${days}d`;
}

export function loadDailySession(): DailySessionState {
  const today = getTodayDateKey();
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailySessionState;
      if (parsed.dateKey === today) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const initial: DailySessionState = {
    dateKey: today,
    completedStages: [0], // 1 of 5 completed initially so Home matches conceptual preview
    wordsIntroducedToday: 1,
    reviewsCompletedToday: 2,
    quizzesAnsweredToday: 2,
    quizzesCorrectToday: 2,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(initial));
  return initial;
}

export function saveDailySession(session: DailySessionState): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  recordStudyDay(session.dateKey);
}

export function loadStudyDays(): string[] {
  const today = getTodayDateKey();
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const days = JSON.parse(raw) as string[];
      if (!days.includes(today)) days.push(today);
      return days;
    }
  } catch {
    // ignore
  }
  // Seed gentle 4-day recent study history
  const seeded: string[] = [];
  for (let i = 4; i >= 0; i--) {
    if (i === 2) continue; // realistic human rhythm
    const d = new Date(Date.now() - i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    seeded.push(key);
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(seeded));
  return seeded;
}

export function recordStudyDay(dateKey: string): void {
  const days = loadStudyDays();
  if (!days.includes(dateKey)) {
    days.push(dateKey);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(days));
  }
}

export function loadLearnerSettings(): LearnerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as LearnerSettings;
  } catch {
    // ignore
  }
  return {
    learnerName: 'Personal Notebook',
    dailyGoalWords: 5,
    voiceAccent: 'en-IN',
    showHindiByDefault: true,
  };
}

export function saveLearnerSettings(settings: LearnerSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// IndexedDB Voice Recording Persistence for Pronunciation Cards
function openAudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(AUDIO_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
        db.createObjectStore(AUDIO_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVoiceRecordingBlob(wordId: string, blob: Blob): Promise<void> {
  try {
    const db = await openAudioDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE_NAME, 'readwrite');
      tx.objectStore(AUDIO_STORE_NAME).put(blob, wordId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore IndexedDB quota/privacy mode errors gracefully
  }
}

export async function loadVoiceRecordingBlob(wordId: string): Promise<Blob | null> {
  try {
    const db = await openAudioDb();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE_NAME, 'readonly');
      const req = tx.objectStore(AUDIO_STORE_NAME).get(wordId);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export function resetAllProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(CUSTOM_WORDS_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(HISTORY_KEY);
}
