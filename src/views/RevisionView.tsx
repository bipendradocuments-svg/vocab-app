import React, { useState } from 'react';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import type { NavScreen, ReviewRating, VocabWord, WordProgress } from '../types/vocab';
import { MemoryRevisionCard } from '../components/cards/MemoryRevisionCard';

interface RevisionViewProps {
  dueWords: VocabWord[];
  difficultWords: VocabWord[];
  progressMap: Record<string, WordProgress>;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  onReviewDecision: (wordId: string, rating: ReviewRating) => void;
  onNavigate: (screen: NavScreen) => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({
  dueWords,
  difficultWords,
  progressMap,
  accent,
  onReviewDecision,
  onNavigate,
}) => {
  const [filterDifficultOnly, setFilterDifficultOnly] = useState(false);
  const [reviewedCountInSession, setReviewedCountInSession] = useState(0);

  const activeQueue = filterDifficultOnly ? difficultWords : dueWords;
  const currentWord = activeQueue[0];

  const handleDecision = (wordId: string, rating: ReviewRating) => {
    setReviewedCountInSession((c) => c + 1);
    onReviewDecision(wordId, rating);
  };

  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div className="eyebrow-label">Spaced Repetition · Active Recall</div>
          <h1 className="page-title" style={{ marginTop: '0.2rem' }}>
            Revision Queue
          </h1>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.94rem', marginTop: '0.2rem' }}>
            Recall meanings before revealing them — difficult words return sooner, remembered words space out naturally.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`filter-pill ${!filterDifficultOnly ? 'active' : ''}`}
            onClick={() => setFilterDifficultOnly(false)}
          >
            Due now ({dueWords.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterDifficultOnly ? 'active' : ''}`}
            onClick={() => setFilterDifficultOnly(true)}
          >
            Difficult words ({difficultWords.length})
          </button>
        </div>
      </header>

      {currentWord ? (
        <MemoryRevisionCard
          word={currentWord}
          progress={progressMap[currentWord.id]}
          accent={accent}
          queuePositionLabel={`${activeQueue.length} remaining in queue · ${reviewedCountInSession} reviewed just now`}
          onReviewDecision={handleDecision}
        />
      ) : (
        <div
          className="paper-card"
          style={{
            maxWidth: '640px',
            margin: '1.5rem auto',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <div className="explore-icon-wrap sage" style={{ width: '52px', height: '52px', borderRadius: '50%' }}>
            <CheckCircle2 size={26} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
            You’re all caught up on revisions!
          </h2>
          <p style={{ color: 'var(--ink-secondary)', maxWidth: '440px', fontSize: '0.95rem' }}>
            {reviewedCountInSession > 0
              ? `Great consistency — you completed ${reviewedCountInSession} active-recall reviews in this session.`
              : 'No words are currently due in this queue. Your spaced-repetition intervals are working quietly in the background.'}
          </p>

          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={() => onNavigate('practice')}>
              <Sparkles size={16} />
              Practise quizzes &amp; speaking
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onNavigate('my-words')}>
              <Clock size={16} />
              Browse My Words
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
