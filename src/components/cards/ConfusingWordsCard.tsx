import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lightbulb, Volume2, XCircle } from 'lucide-react';
import type { ConfusingWordSet } from '../../types/vocab';
import { speakEnglish } from '../../utils/speech';

interface ConfusingWordsCardProps {
  set: ConfusingWordSet;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  onAnswered?: (correct: boolean) => void;
  onNext?: () => void;
}

export const ConfusingWordsCard: React.FC<ConfusingWordsCardProps> = ({
  set,
  accent,
  onAnswered,
  onNext,
}) => {
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setExerciseIdx(0);
    setSelectedOption(null);
    setChecked(false);
  }, [set.id]);

  const currentExercise = set.exercises[exerciseIdx];
  const isCorrect = selectedOption === currentExercise.correctWord;

  const handleCheck = () => {
    if (!selectedOption) return;
    setChecked(true);
    onAnswered?.(selectedOption === currentExercise.correctWord);
  };

  const handleNextExercise = () => {
    if (exerciseIdx < set.exercises.length - 1) {
      setExerciseIdx((i) => i + 1);
      setSelectedOption(null);
      setChecked(false);
    } else {
      onNext?.();
    }
  };

  const parts = currentExercise.sentenceWithBlank.split('___');

  return (
    <article className="learning-card-shell" id={`confusing-card-${set.id}`}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span className="tag tag-mustard">Confusing Words Comparison</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
          Compare → Understand → Fill in the blank
        </span>
      </div>

      <h2 className="vocab-display-word" style={{ fontSize: '1.95rem', marginTop: '0.85rem' }}>
        {set.title}
      </h2>
      <p style={{ color: 'var(--ink-secondary)', fontSize: '0.94rem', marginTop: '0.25rem' }}>
        {set.subtitle}
      </p>

      {/* Step 1: Side-by-Side Comparison Table (English + Hindi + Audio) */}
      <div className="comparison-table-wrap" style={{ marginTop: '1.25rem' }}>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Word</th>
              <th>Hindi Meaning</th>
              <th>English Nuance &amp; Example</th>
              <th>Listen</th>
            </tr>
          </thead>
          <tbody>
            {set.items.map((item) => (
              <tr key={item.word}>
                <td>
                  <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--ink-charcoal)' }}>
                    {item.word}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                    {item.partOfSpeech} · {item.ipa}
                  </div>
                </td>
                <td className="hindi-text" style={{ fontWeight: 600, color: 'var(--accent-mustard-ink)' }}>
                  {item.hindiMeaning}
                </td>
                <td>
                  <div style={{ fontWeight: 550 }}>{item.englishMeaning}</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                    “{item.example}”
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className="audio-pill-btn"
                    onClick={() => speakEnglish(`${item.word}. ${item.example}`, { accent, rate: 0.92 })}
                    aria-label={`Listen to ${item.word}`}
                  >
                    <Volume2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Step 2: Memory Rule */}
      <div
        className="sand-panel"
        style={{
          marginTop: '1rem',
          padding: '0.9rem 1.1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.6rem',
          fontSize: '0.9rem',
        }}
      >
        <Lightbulb size={18} style={{ color: 'var(--accent-mustard)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Memory trick:</strong> {set.memoryTrick}
        </div>
      </div>

      {/* Step 3: Interactive Fill-in-the-blank */}
      <div
        style={{
          marginTop: '1.35rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-sand)',
          background: 'var(--bg-paper-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span className="eyebrow-label">
            Fill in the blank ({exerciseIdx + 1} of {set.exercises.length})
          </span>
        </div>

        <p style={{ fontSize: '1.1rem', fontWeight: 650, lineHeight: 1.55, color: 'var(--ink-charcoal)' }}>
          {parts[0]}
          <span
            style={{
              display: 'inline-block',
              minWidth: '84px',
              padding: '0.1rem 0.55rem',
              margin: '0 0.25rem',
              borderBottom: '2px solid var(--ink-charcoal)',
              textAlign: 'center',
              color: checked
                ? isCorrect
                  ? 'var(--accent-sage-ink)'
                  : 'var(--accent-clay-ink)'
                : 'var(--accent-mustard-ink)',
              background: selectedOption ? 'var(--bg-sand-muted)' : 'transparent',
              borderRadius: '4px 4px 0 0',
            }}
          >
            {selectedOption || '______'}
          </span>
          {parts[1]}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1rem' }}>
          {currentExercise.options.map((opt) => {
            let extraClass = 'btn-secondary';
            if (checked) {
              if (opt === currentExercise.correctWord) extraClass = 'btn-sage';
              else if (opt === selectedOption) extraClass = 'btn-mustard';
            } else if (selectedOption === opt) {
              extraClass = 'btn-primary';
            }
            return (
              <button
                key={opt}
                type="button"
                disabled={checked}
                className={`btn ${extraClass}`}
                onClick={() => setSelectedOption(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {!checked ? (
          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              id={`check-confusing-${set.id}`}
              className="btn btn-primary"
              disabled={!selectedOption}
              onClick={handleCheck}
            >
              Check answer
            </button>
          </div>
        ) : (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.9rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: isCorrect ? 'var(--accent-sage-soft)' : 'var(--accent-clay-soft)',
              color: isCorrect ? 'var(--accent-sage-ink)' : 'var(--accent-clay-ink)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}>
              {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {isCorrect ? 'Spot on!' : `Correct word: "${currentExercise.correctWord}"`}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-charcoal)' }}>
              {currentExercise.explanation}
            </p>
            <div>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleNextExercise}>
                {exerciseIdx < set.exercises.length - 1 ? 'Next sentence →' : onNext ? 'Continue →' : 'Done'}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
