import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GitCompare,
  MessageCircle,
  Mic,
  Sparkles,
  Volume2,
} from 'lucide-react';
import type {
  DailySessionState,
  NavScreen,
  PracticeMode,
  VocabWord,
} from '../types/vocab';
import { speakEnglish } from '../utils/speech';
import { WordIllustration } from '../components/WordIllustration';

interface HomeViewProps {
  featuredWord: VocabWord;
  dailyWordsCount: number;
  dueRevisionCount: number;
  dailySession: DailySessionState;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  onNavigate: (screen: NavScreen) => void;
  onOpenPracticeMode: (mode: PracticeMode) => void;
  onInspectWord: (word: VocabWord) => void;
}

const SESSION_STAGE_NAMES = ['Discover', 'Understand', 'Practise', 'Speak', 'Remember'];

export const HomeView: React.FC<HomeViewProps> = ({
  featuredWord,
  dailyWordsCount,
  dueRevisionCount,
  dailySession,
  accent,
  onNavigate,
  onOpenPracticeMode,
  onInspectWord,
}) => {
  const completedCount = dailySession.completedStages.length;
  const progressPct = Math.round((completedCount / 5) * 100);

  return (
    <div>
      {/* Editorial Greeting Header */}
      <header className="home-header">
        <div>
          <div className="eyebrow-label">WordUp · Personal English Notebook</div>
          <h1 className="page-title" style={{ marginTop: '0.25rem' }}>
            Your English journey
          </h1>
          <p className="page-subtitle">Learn a little. Remember a lot.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            id="home-quick-revision-btn"
            className="btn btn-secondary"
            onClick={() => onNavigate('revision')}
          >
            Review due words ({String(dueRevisionCount).padStart(2, '0')})
          </button>
          <button
            type="button"
            id="home-start-session-top-btn"
            className="btn btn-primary"
            onClick={() => onNavigate('learn')}
          >
            {completedCount >= 5 ? 'Review today’s lesson' : 'Start learning'}
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Top Two-Column Grid: Daily Session + Featured Word */}
      <section className="home-top-grid" aria-label="Daily overview">
        {/* Left: Today's Metrics & Session Progress */}
        <div className="paper-card session-hero-card">
          <div className="metrics-strip">
            <button
              type="button"
              id="metric-new-words"
              className="metric-box interactive"
              onClick={() => onNavigate('learn')}
            >
              <div className="metric-number">{String(dailyWordsCount).padStart(2, '0')}</div>
              <div className="metric-caption">New words today</div>
            </button>

            <button
              type="button"
              id="metric-revise-words"
              className="metric-box interactive"
              onClick={() => onNavigate('revision')}
            >
              <div className="metric-number" style={{ color: dueRevisionCount > 0 ? 'var(--accent-mustard-ink)' : undefined }}>
                {String(dueRevisionCount).padStart(2, '0')}
              </div>
              <div className="metric-caption">Words to revise</div>
            </button>
          </div>

          <div className="session-progress-block">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
              <h2 className="section-heading">Today’s learning session</h2>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-sage-ink)' }}>
                {completedCount} of 5 completed
              </span>
            </div>

            <div className="progress-track" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={5}>
              <div className="progress-fill" style={{ width: `${Math.max(8, progressPct)}%` }} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.3rem' }}>
              {SESSION_STAGE_NAMES.map((stageName, idx) => {
                const done = dailySession.completedStages.includes(idx);
                return (
                  <span
                    key={stageName}
                    className={`tag ${done ? 'tag-sage' : 'tag-sand'}`}
                    style={{ fontSize: '0.72rem' }}
                  >
                    {done && <CheckCircle2 size={12} />}
                    {idx + 1}. {stageName}
                  </span>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
              5-word guided session · ~6 mins
            </span>
            <button
              type="button"
              id="home-start-learning-btn"
              className="btn btn-primary"
              onClick={() => onNavigate('learn')}
            >
              {completedCount === 0
                ? 'Start learning'
                : completedCount < 5
                ? 'Continue session'
                : 'Revisit session'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: Featured Word of the Day (Serendipity) */}
        <div className="paper-card featured-word-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="tag tag-mustard">
                <Sparkles size={12} />
                Discover today’s featured word
              </span>
              <button
                type="button"
                id="featured-word-audio-btn"
                className="audio-pill-btn"
                onClick={() => speakEnglish(featuredWord.word, { accent })}
              >
                <Volume2 size={14} />
                {featuredWord.pronunciation}
              </button>
            </div>

            <div className="featured-illustration-frame">
              <WordIllustration
                imageUrl={featuredWord.imageUrl}
                motifKey={featuredWord.motifKey}
                word={featuredWord.word}
              />
            </div>

            <div style={{ marginTop: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 className="featured-word-title">{featuredWord.word}</h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                  {featuredWord.partOfSpeech} · {featuredWord.ipa}
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--ink-secondary)', marginTop: '0.3rem' }}>
                {featuredWord.meaning}
              </p>
              <p className="hindi-text" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-mustard-ink)', marginTop: '0.3rem' }}>
                {featuredWord.hindiMeaning}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              id="explore-featured-word-btn"
              className="btn btn-secondary btn-sm"
              onClick={() => onInspectWord(featuredWord)}
            >
              Open full word card →
            </button>
          </div>
        </div>
      </section>

      {/* Explore Learning Section (4 Specialized Learning Experiences) */}
      <section style={{ marginTop: '2rem' }} aria-labelledby="explore-learning-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 id="explore-learning-heading" className="section-heading" style={{ fontSize: '1.15rem' }}>
              Explore learning
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--ink-muted)', marginTop: '0.15rem' }}>
              Different learning experiences designed for meaning, sound, nuance, and speaking.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigate('practice')}
          >
            View all 6 card formats →
          </button>
        </div>

        <div className="explore-grid">
          <button
            type="button"
            id="explore-vocabulary-card"
            className="explore-card"
            onClick={() => onOpenPracticeMode('vocabulary')}
          >
            <div className="explore-icon-wrap mustard">
              <BookOpen size={19} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 750 }}>Vocabulary</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', marginTop: '0.2rem' }}>
                Learn new words with visuals, Hindi meanings &amp; examples
              </p>
            </div>
          </button>

          <button
            type="button"
            id="explore-pronunciation-card"
            className="explore-card"
            onClick={() => onOpenPracticeMode('pronunciation')}
          >
            <div className="explore-icon-wrap sage">
              <Mic size={19} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 750 }}>Pronunciation</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', marginTop: '0.2rem' }}>
                Listen, break into syllables, record &amp; practise aloud
              </p>
            </div>
          </button>

          <button
            type="button"
            id="explore-confusing-card"
            className="explore-card"
            onClick={() => onOpenPracticeMode('confusing')}
          >
            <div className="explore-icon-wrap mustard">
              <GitCompare size={19} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 750 }}>Confusing words</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', marginTop: '0.2rem' }}>
                Understand tricky differences like Lose, Loose &amp; Loss
              </p>
            </div>
          </button>

          <button
            type="button"
            id="explore-conversation-card"
            className="explore-card"
            onClick={() => onOpenPracticeMode('conversation')}
          >
            <div className="explore-icon-wrap sage">
              <MessageCircle size={19} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 750 }}>Conversation</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', marginTop: '0.2rem' }}>
                Use English naturally in real workplace &amp; daily dialogues
              </p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
