import React, { useEffect, useState } from 'react';
import { CheckCircle2, HelpCircle, Volume2, XCircle } from 'lucide-react';
import type { VocabWord } from '../../types/vocab';
import { speakEnglish } from '../../utils/speech';

interface ContextQuizCardProps {
  word: VocabWord;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  onResult: (wordId: string, correct: boolean) => void;
  onNext?: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export const ContextQuizCard: React.FC<ContextQuizCardProps> = ({
  word,
  accent,
  onResult,
  onNext,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setSelectedIdx(null);
    setChecked(false);
  }, [word.id]);

  const handleCheck = () => {
    if (selectedIdx === null) return;
    setChecked(true);
    onResult(word.id, selectedIdx === word.quiz.correctIndex);
  };

  const isCorrect = selectedIdx === word.quiz.correctIndex;

  return (
    <article className="learning-card-shell" id={`quiz-card-${word.id}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="tag tag-sage">Context Quiz</span>
          <span className="tag tag-sand">{word.word}</span>
        </div>

        <button
          type="button"
          className="audio-pill-btn"
          onClick={() => speakEnglish(word.word, { accent })}
        >
          <Volume2 size={14} />
          Hear “{word.word}”
        </button>
      </div>

      <div style={{ marginTop: '1.15rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
        <HelpCircle size={22} style={{ color: 'var(--accent-mustard)', flexShrink: 0, marginTop: '3px' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 750, lineHeight: 1.35, color: 'var(--ink-charcoal)' }}>
          {word.quiz.question}
        </h2>
      </div>

      <div className="quiz-options-stack" style={{ marginTop: '1.25rem' }}>
        {word.quiz.options.map((opt, idx) => {
          let stateClass = '';
          if (checked) {
            if (idx === word.quiz.correctIndex) stateClass = 'correct';
            else if (idx === selectedIdx) stateClass = 'incorrect';
          } else if (idx === selectedIdx) {
            stateClass = 'selected';
          }

          return (
            <button
              key={idx}
              type="button"
              id={`quiz-opt-${word.id}-${idx}`}
              disabled={checked}
              className={`quiz-option-btn ${stateClass}`}
              onClick={() => setSelectedIdx(idx)}
            >
              <span className="quiz-letter">{LETTERS[idx] || idx + 1}</span>
              <span style={{ flex: 1 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {!checked ? (
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            id={`check-quiz-${word.id}`}
            className="btn btn-primary"
            disabled={selectedIdx === null}
            onClick={handleCheck}
          >
            Check answer
          </button>
        </div>
      ) : (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '1.1rem 1.2rem',
            borderRadius: 'var(--radius-md)',
            background: isCorrect ? 'var(--accent-sage-soft)' : 'var(--accent-clay-soft)',
            border: `1px solid ${isCorrect ? 'var(--accent-sage)' : 'var(--accent-clay)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 750,
              color: isCorrect ? 'var(--accent-sage-ink)' : 'var(--accent-clay-ink)',
            }}
          >
            {isCorrect ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
            {isCorrect ? 'Well reasoned! That usage is completely natural.' : 'Not quite — look closely at how the word works in context:'}
          </div>

          <p style={{ fontSize: '0.93rem', color: 'var(--ink-charcoal)' }}>{word.quiz.explanation}</p>

          <p className="hindi-text" style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
            <strong>Hindi reminder:</strong> {word.hindiMeaning}
          </p>

          {onNext && (
            <div style={{ marginTop: '0.35rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" id={`next-quiz-${word.id}`} className="btn btn-primary" onClick={onNext}>
                Continue →
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
