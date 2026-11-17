import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  ConfusingWordSet,
  ConversationScenario,
  PracticeMode,
  ReviewRating,
  VocabWord,
  WordProgress,
} from '../types/vocab';
import { VocabLearningCard } from '../components/cards/VocabLearningCard';
import { PronunciationCard } from '../components/cards/PronunciationCard';
import { ConfusingWordsCard } from '../components/cards/ConfusingWordsCard';
import { ContextQuizCard } from '../components/cards/ContextQuizCard';
import { ConversationCard } from '../components/cards/ConversationCard';
import { MatchingExerciseCard } from '../components/cards/MatchingExerciseCard';

interface PracticeViewProps {
  initialMode: PracticeMode;
  words: VocabWord[];
  confusingSets: ConfusingWordSet[];
  conversations: ConversationScenario[];
  progressMap: Record<string, WordProgress>;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  onRateWord: (wordId: string, rating: ReviewRating) => void;
  onToggleSave: (wordId: string) => void;
  onQuizResult: (wordId: string, correct: boolean) => void;
}

const MODES: { id: PracticeMode; label: string }[] = [
  { id: 'vocabulary', label: 'A. Vocabulary Card' },
  { id: 'pronunciation', label: 'B. Pronunciation Studio' },
  { id: 'confusing', label: 'C. Confusing Words' },
  { id: 'quiz', label: 'D. Context Quiz' },
  { id: 'conversation', label: 'E. Real Conversation' },
  { id: 'matching', label: 'Word Matching' },
];

export const PracticeView: React.FC<PracticeViewProps> = ({
  initialMode,
  words,
  confusingSets,
  conversations,
  progressMap,
  accent,
  onRateWord,
  onToggleSave,
  onQuizResult,
}) => {
  const [mode, setMode] = useState<PracticeMode>(
    initialMode === 'all-cards' ? 'vocabulary' : initialMode
  );
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (initialMode !== 'all-cards') {
      setMode(initialMode);
      setCursor(0);
    }
  }, [initialMode]);

  const pronunciationWords = words.filter(
    (w) => w.category === 'pronunciation' || w.syllables.length >= 2
  );

  const handleModeSwitch = (next: PracticeMode) => {
    setMode(next);
    setCursor(0);
  };

  const getPoolLength = () => {
    if (mode === 'confusing') return confusingSets.length;
    if (mode === 'conversation') return conversations.length;
    if (mode === 'pronunciation') return pronunciationWords.length;
    return words.length;
  };

  const poolLength = getPoolLength();
  const safeIdx = cursor % Math.max(1, poolLength);

  const nextItem = () => setCursor((c) => (c + 1) % poolLength);
  const prevItem = () => setCursor((c) => (c - 1 + poolLength) % poolLength);

  return (
    <div>
      <header style={{ marginBottom: '1.35rem' }}>
        <div className="eyebrow-label">Interactive Formats</div>
        <h1 className="page-title" style={{ marginTop: '0.2rem' }}>
          Practice Studio
        </h1>
        <p style={{ color: 'var(--ink-secondary)', fontSize: '0.94rem', marginTop: '0.2rem' }}>
          Different skills require different card designs — switch freely between meaning, pronunciation, tricky word pairs, quizzes, and conversations.
        </p>
      </header>

      {/* Format Selector Pills */}
      <div className="filter-pills-row" style={{ marginBottom: '1.5rem' }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            id={`practice-mode-${m.id}`}
            className={`filter-pill ${mode === m.id ? 'active' : ''}`}
            onClick={() => handleModeSwitch(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Pagination Header (for non-matching modes) */}
      {mode !== 'matching' && (
        <div
          style={{
            maxWidth: '740px',
            margin: '0 auto 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button type="button" className="btn btn-ghost btn-sm" onClick={prevItem}>
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ fontSize: '0.84rem', fontWeight: 650, color: 'var(--ink-muted)' }}>
            Card {safeIdx + 1} of {poolLength}
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={nextItem}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {mode === 'vocabulary' && (
        <VocabLearningCard
          word={words[safeIdx]}
          progress={progressMap[words[safeIdx].id]}
          accent={accent}
          onRate={onRateWord}
          onToggleSave={onToggleSave}
          onNext={nextItem}
        />
      )}

      {mode === 'pronunciation' && (
        <PronunciationCard
          word={pronunciationWords[safeIdx]}
          accent={accent}
          onCompletedPractice={(id, confident) =>
            onRateWord(id, confident ? 'remembered' : 'difficult')
          }
          onNext={nextItem}
        />
      )}

      {mode === 'confusing' && (
        <ConfusingWordsCard
          set={confusingSets[safeIdx]}
          accent={accent}
          onNext={nextItem}
        />
      )}

      {mode === 'quiz' && (
        <ContextQuizCard
          word={words[safeIdx]}
          accent={accent}
          onResult={onQuizResult}
          onNext={nextItem}
        />
      )}

      {mode === 'conversation' && (
        <ConversationCard
          scenario={conversations[safeIdx]}
          accent={accent}
          onNext={nextItem}
        />
      )}

      {mode === 'matching' && (
        <MatchingExerciseCard
          words={words.slice(safeIdx, safeIdx + 5).length === 5 ? words.slice(safeIdx, safeIdx + 5) : words.slice(0, 5)}
          accent={accent}
          onComplete={() => setCursor((c) => (c + 5) % words.length)}
        />
      )}
    </div>
  );
};
