import React, { useEffect, useState } from 'react';
import { Bookmark, Check, Eye, RotateCcw, Sparkles, Turtle, Volume2 } from 'lucide-react';
import type { ReviewRating, VocabWord, WordProgress } from '../../types/vocab';
import { speakEnglish } from '../../utils/speech';
import { WordIllustration } from '../WordIllustration';

interface VocabLearningCardProps {
  word: VocabWord;
  progress?: WordProgress;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  defaultRevealed?: boolean;
  onRate: (wordId: string, rating: ReviewRating) => void;
  onToggleSave: (wordId: string) => void;
  onNext?: () => void;
}

export const VocabLearningCard: React.FC<VocabLearningCardProps> = ({
  word,
  progress,
  accent,
  defaultRevealed = false,
  onRate,
  onToggleSave,
  onNext,
}) => {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const [speakingMode, setSpeakingMode] = useState<'normal' | 'slow' | null>(null);
  const [ratedChoice, setRatedChoice] = useState<'easy' | 'difficult' | null>(null);

  useEffect(() => {
    setRevealed(defaultRevealed);
    setRatedChoice(null);
  }, [word.id, defaultRevealed]);

  const handlePlay = (rate: number, mode: 'normal' | 'slow', text = word.word) => {
    setSpeakingMode(mode);
    speakEnglish(text, {
      rate,
      accent,
      onEnd: () => setSpeakingMode(null),
    });
  };

  const handleMark = (choice: 'easy' | 'difficult') => {
    setRatedChoice(choice);
    onRate(word.id, choice === 'easy' ? 'remembered' : 'difficult');
  };

  const isSaved = Boolean(progress?.saved);

  return (
    <article className="learning-card-shell" id={`vocab-card-${word.id}`}>
      {/* Top Meta Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="tag tag-mustard">{word.badge}</span>
          <span className="tag tag-sand">{word.partOfSpeech}</span>
          {progress?.status === 'difficult' && <span className="tag tag-clay">Difficult</span>}
          {progress?.status === 'mastered' && <span className="tag tag-sage">Mastered</span>}
        </div>

        <button
          type="button"
          id={`save-word-btn-${word.id}`}
          className="btn btn-ghost btn-sm"
          onClick={() => onToggleSave(word.id)}
          aria-label={isSaved ? 'Remove from My Words' : 'Save to My Words'}
          style={{ color: isSaved ? 'var(--accent-mustard-ink)' : undefined }}
        >
          <Bookmark size={16} fill={isSaved ? 'var(--accent-mustard)' : 'none'} />
          {isSaved ? 'Saved in My Words' : 'Save word'}
        </button>
      </div>

      {/* Main Display Word & Pronunciation */}
      <div style={{ marginTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <h2 className="vocab-display-word" style={{ textTransform: 'uppercase' }}>
          {word.word}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="ipa-text">
            {word.pronunciation} &nbsp;·&nbsp; <span style={{ fontFamily: 'monospace' }}>{word.ipa}</span>
          </span>

          <button
            type="button"
            id={`listen-normal-${word.id}`}
            className={`audio-pill-btn ${speakingMode === 'normal' ? 'speaking' : ''}`}
            onClick={() => handlePlay(0.94, 'normal')}
          >
            <Volume2 size={15} />
            Listen
          </button>

          <button
            type="button"
            id={`listen-slow-${word.id}`}
            className={`audio-pill-btn ${speakingMode === 'slow' ? 'speaking' : ''}`}
            onClick={() => handlePlay(0.62, 'slow')}
            title="Listen slowly"
          >
            <Turtle size={15} />
            Slow
          </button>
        </div>
      </div>

      {/* Visual Memory Illustration */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className="card-illustration-box">
          <WordIllustration imageUrl={word.imageUrl} motifKey={word.motifKey} word={word.word} />
        </div>
        <p style={{ marginTop: '0.55rem', fontSize: '0.84rem', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
          <Sparkles size={15} style={{ flexShrink: 0, marginTop: '3px', color: 'var(--accent-mustard)' }} />
          <span>
            <strong>Memory association:</strong> {word.memoryAssociation}
          </span>
        </p>
      </div>

      {/* Flip / Reveal Section */}
      {!revealed ? (
        <div
          className="sand-panel"
          style={{
            marginTop: '1.35rem',
            padding: '1.35rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
          }}
        >
          <p style={{ fontSize: '0.92rem', color: 'var(--ink-secondary)' }}>
            Pause for a second — can you guess or recall what <strong>{word.word}</strong> means from the visual clue?
          </p>
          <button
            type="button"
            id={`flip-reveal-btn-${word.id}`}
            className="btn btn-primary"
            onClick={() => setRevealed(true)}
          >
            <Eye size={16} />
            Flip card to reveal meaning
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Simple English Meaning */}
          <div className="meaning-callout">
            <div className="eyebrow-label" style={{ marginBottom: '0.3rem' }}>
              Simple English Meaning
            </div>
            <p style={{ fontSize: '1.04rem', fontWeight: 600, color: 'var(--ink-charcoal)' }}>
              {word.meaning}
            </p>
          </div>

          {/* Hindi Translation */}
          <div className="hindi-callout">
            <div className="eyebrow-label" style={{ marginBottom: '0.25rem', color: 'var(--accent-mustard-ink)' }}>
              Hindi Meaning · हिंदी अर्थ
            </div>
            <p className="hindi-text" style={{ fontSize: '1.08rem', fontWeight: 600 }}>
              {word.hindiMeaning}
            </p>
          </div>

          {/* Synonyms & Antonyms */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
            <div className="sand-panel" style={{ padding: '0.85rem 1rem' }}>
              <div className="eyebrow-label" style={{ marginBottom: '0.45rem' }}>
                Synonyms (Similar)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {word.synonyms.map((syn) => (
                  <span key={syn} className="tag tag-sage">
                    {syn}
                  </span>
                ))}
              </div>
            </div>

            <div className="sand-panel" style={{ padding: '0.85rem 1rem' }}>
              <div className="eyebrow-label" style={{ marginBottom: '0.45rem' }}>
                Antonyms (Opposite)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {word.antonyms.map((ant) => (
                  <span key={ant} className="tag tag-sand">
                    {ant}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Everyday Examples */}
          <div>
            <div className="eyebrow-label" style={{ marginBottom: '0.5rem' }}>
              Everyday Examples
            </div>
            <div className="example-list">
              {word.examples.map((ex, idx) => (
                <div key={idx} className="example-item">
                  <span style={{ lineHeight: 1.5 }}>{ex}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => speakEnglish(ex, { accent, rate: 0.95 })}
                    aria-label="Listen to example sentence"
                    title="Listen to sentence"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mark Easy / Difficult Interaction */}
          <div
            style={{
              marginTop: '0.35rem',
              paddingTop: '1.1rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                id={`mark-difficult-${word.id}`}
                className={`btn ${ratedChoice === 'difficult' ? 'btn-mustard' : 'btn-secondary'}`}
                onClick={() => handleMark('difficult')}
              >
                {ratedChoice === 'difficult' && <Check size={16} />}
                Mark Difficult
              </button>
              <button
                type="button"
                id={`mark-easy-${word.id}`}
                className={`btn ${ratedChoice === 'easy' ? 'btn-sage' : 'btn-secondary'}`}
                onClick={() => handleMark('easy')}
              >
                {ratedChoice === 'easy' && <Check size={16} />}
                Mark Easy
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setRevealed(false)}
              >
                <RotateCcw size={14} />
                Flip back
              </button>
            </div>

            {onNext && (
              <button type="button" id={`next-from-vocab-${word.id}`} className="btn btn-primary" onClick={onNext}>
                Continue →
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
