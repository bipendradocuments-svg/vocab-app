import React, { useEffect, useState } from 'react';
import { Brain, Eye, HelpCircle, Volume2 } from 'lucide-react';
import type { ReviewRating, VocabWord, WordProgress } from '../../types/vocab';
import { speakEnglish } from '../../utils/speech';
import { getNextIntervalLabel } from '../../utils/storage';

interface MemoryRevisionCardProps {
  word: VocabWord;
  progress?: WordProgress;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  queuePositionLabel?: string;
  onReviewDecision: (wordId: string, rating: ReviewRating) => void;
}

export const MemoryRevisionCard: React.FC<MemoryRevisionCardProps> = ({
  word,
  progress,
  accent,
  queuePositionLabel,
  onReviewDecision,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [mentalDraft, setMentalDraft] = useState('');

  useEffect(() => {
    setRevealed(false);
    setShowHint(false);
    setMentalDraft('');
  }, [word.id]);

  return (
    <article className="learning-card-shell" id={`revision-card-${word.id}`}>
      {/* Top Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="tag tag-mustard">Active Recall</span>
          <span className="tag tag-sand">{word.partOfSpeech}</span>
        </div>
        {queuePositionLabel && (
          <span style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--ink-muted)' }}>
            {queuePositionLabel}
          </span>
        )}
      </div>

      {/* Target Word Prompt */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem 0.5rem' }}>
        <h2 className="vocab-display-word" style={{ textTransform: 'uppercase' }}>
          {word.word}
        </h2>
        <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="ipa-text">{word.ipa}</span>
          <button
            type="button"
            className="audio-pill-btn"
            onClick={() => speakEnglish(word.word, { accent })}
          >
            <Volume2 size={14} />
            Pronounce
          </button>
        </div>
      </div>

      {!revealed ? (
        <div
          className="sand-panel"
          style={{
            marginTop: '1rem',
            padding: '1.35rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-secondary)', fontSize: '0.92rem' }}>
            <Brain size={17} style={{ color: 'var(--accent-sage)' }} />
            <span>Recall its English &amp; Hindi meaning before revealing the answer.</span>
          </div>

          <input
            type="text"
            className="form-input"
            placeholder="Optional: type a quick meaning or sentence from memory..."
            value={mentalDraft}
            onChange={(e) => setMentalDraft(e.target.value)}
          />

          {showHint && (
            <div style={{ fontSize: '0.88rem', color: 'var(--accent-mustard-ink)', background: 'var(--accent-mustard-soft)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <strong>Association clue:</strong> {word.memoryAssociation}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowHint((h) => !h)}
            >
              <HelpCircle size={15} />
              {showHint ? 'Hide clue' : 'Need a memory clue?'}
            </button>

            <button
              type="button"
              id={`reveal-revision-${word.id}`}
              className="btn btn-primary"
              onClick={() => setRevealed(true)}
            >
              <Eye size={16} />
              Reveal Meaning
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          {mentalDraft.trim() && (
            <div className="sand-panel" style={{ padding: '0.7rem 0.95rem', fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
              <strong>Your recall note:</strong> “{mentalDraft}”
            </div>
          )}

          <div className="meaning-callout">
            <div className="eyebrow-label" style={{ marginBottom: '0.25rem' }}>
              English Meaning
            </div>
            <p style={{ fontWeight: 650, fontSize: '1.02rem' }}>{word.meaning}</p>
          </div>

          <div className="hindi-callout">
            <div className="eyebrow-label" style={{ color: 'var(--accent-mustard-ink)', marginBottom: '0.25rem' }}>
              Hindi Meaning
            </div>
            <p className="hindi-text" style={{ fontWeight: 600, fontSize: '1.04rem' }}>
              {word.hindiMeaning}
            </p>
          </div>

          <div className="example-item">
            <span>“{word.examples[0]}”</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => speakEnglish(word.examples[0], { accent })}
              title="Listen to example"
            >
              <Volume2 size={15} />
            </button>
          </div>

          {/* Spaced Repetition Scheduler Buttons */}
          <div style={{ marginTop: '0.5rem' }}>
            <div className="eyebrow-label" style={{ textAlign: 'center', marginBottom: '0.65rem' }}>
              How well did you remember it? (Schedules next review)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
              <button
                type="button"
                id={`rate-forgot-${word.id}`}
                className="btn btn-secondary"
                style={{ flexDirection: 'column', padding: '0.8rem', borderColor: 'var(--accent-clay)' }}
                onClick={() => onReviewDecision(word.id, 'forgot')}
              >
                <span style={{ fontWeight: 750, color: 'var(--accent-clay-ink)' }}>Forgot</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                  Review in {getNextIntervalLabel(progress, 'forgot')}
                </span>
              </button>

              <button
                type="button"
                id={`rate-difficult-${word.id}`}
                className="btn btn-secondary"
                style={{ flexDirection: 'column', padding: '0.8rem', borderColor: 'var(--accent-mustard)' }}
                onClick={() => onReviewDecision(word.id, 'difficult')}
              >
                <span style={{ fontWeight: 750, color: 'var(--accent-mustard-ink)' }}>Difficult</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                  Review {getNextIntervalLabel(progress, 'difficult')}
                </span>
              </button>

              <button
                type="button"
                id={`rate-remembered-${word.id}`}
                className="btn btn-sage"
                style={{ flexDirection: 'column', padding: '0.8rem' }}
                onClick={() => onReviewDecision(word.id, 'remembered')}
              >
                <span style={{ fontWeight: 750 }}>Remembered</span>
                <span style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                  Schedule {getNextIntervalLabel(progress, 'remembered')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
