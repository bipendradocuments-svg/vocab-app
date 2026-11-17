import React, { useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import type { VocabWord } from '../../types/vocab';
import { speakEnglish } from '../../utils/speech';

interface MatchingExerciseCardProps {
  words: VocabWord[];
  accent: 'en-IN' | 'en-GB' | 'en-US';
  onComplete?: () => void;
}

export const MatchingExerciseCard: React.FC<MatchingExerciseCardProps> = ({
  words,
  accent,
  onComplete,
}) => {
  const subset = useMemo(() => words.slice(0, 5), [words]);

  const shuffledMeanings = useMemo(() => {
    const arr = subset.map((w) => ({
      id: w.id,
      meaning: w.meaning,
      hindi: w.hindiMeaning,
    }));
    // Deterministic subtle shuffle so SSR/hydration or re-renders remain stable
    return [...arr].sort((a, b) => a.meaning.localeCompare(b.meaning));
  }, [subset]);

  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ wordId: string; meaningId: string } | null>(null);

  const handleSelectWord = (id: string, text: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedWordId(id);
    setWrongPair(null);
    speakEnglish(text, { accent, rate: 0.95 });
  };

  const handleSelectMeaning = (meaningWordId: string) => {
    if (!selectedWordId || matchedIds.includes(meaningWordId)) return;
    if (selectedWordId === meaningWordId) {
      const next = [...matchedIds, meaningWordId];
      setMatchedIds(next);
      setSelectedWordId(null);
      setWrongPair(null);
    } else {
      setWrongPair({ wordId: selectedWordId, meaningId: meaningWordId });
      setTimeout(() => setWrongPair(null), 700);
    }
  };

  const handleReset = () => {
    setMatchedIds([]);
    setSelectedWordId(null);
    setWrongPair(null);
  };

  const allDone = matchedIds.length === subset.length;

  return (
    <article className="learning-card-shell" id="matching-exercise-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="tag tag-mustard">Interactive Matching</span>
          <span className="tag tag-sand">
            {matchedIds.length} of {subset.length} paired
          </span>
        </div>

        <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
          <RefreshCw size={14} />
          Reset board
        </button>
      </div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 750, marginTop: '0.9rem' }}>
        Match each English word on the left with its meaning on the right
      </h2>
      <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginTop: '0.2rem' }}>
        Tap a word first (you’ll hear its pronunciation), then tap its matching definition.
      </p>

      <div className="matching-columns" style={{ marginTop: '1.25rem' }}>
        {/* Left Column: Words */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {subset.map((w) => {
            const isMatched = matchedIds.includes(w.id);
            const isSelected = selectedWordId === w.id;
            const isWrong = wrongPair?.wordId === w.id;
            return (
              <button
                key={w.id}
                type="button"
                disabled={isMatched}
                className={`match-tile ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={() => handleSelectWord(w.id, w.word)}
              >
                <div style={{ fontWeight: 750, fontSize: '1rem' }}>{w.word}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{w.pronunciation}</div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Meanings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {shuffledMeanings.map((m) => {
            const isMatched = matchedIds.includes(m.id);
            const isWrong = wrongPair?.meaningId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={isMatched}
                className={`match-tile ${isMatched ? 'matched' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={() => handleSelectMeaning(m.id)}
              >
                <div style={{ fontSize: '0.88rem', fontWeight: 550, lineHeight: 1.4 }}>{m.meaning}</div>
                <div className="hindi-text" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>
                  {m.hindi}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {allDone && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '1rem 1.2rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-sage-soft)',
            color: 'var(--accent-sage-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <CheckCircle2 size={19} />
            <Sparkles size={17} />
            All {subset.length} words matched cleanly!
          </div>
          {onComplete && (
            <button type="button" className="btn btn-primary btn-sm" onClick={onComplete}>
              Continue →
            </button>
          )}
        </div>
      )}
    </article>
  );
};
