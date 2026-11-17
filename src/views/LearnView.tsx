import React, { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type {
  ConfusingWordSet,
  ConversationScenario,
  DailySessionState,
  NavScreen,
  ReviewRating,
  VocabWord,
  WordProgress,
} from '../types/vocab';
import { VocabLearningCard } from '../components/cards/VocabLearningCard';
import { ConfusingWordsCard } from '../components/cards/ConfusingWordsCard';
import { ContextQuizCard } from '../components/cards/ContextQuizCard';
import { MatchingExerciseCard } from '../components/cards/MatchingExerciseCard';
import { PronunciationCard } from '../components/cards/PronunciationCard';
import { ConversationCard } from '../components/cards/ConversationCard';
import { MemoryRevisionCard } from '../components/cards/MemoryRevisionCard';

interface LearnViewProps {
  dailyWords: VocabWord[];
  confusingSets: ConfusingWordSet[];
  conversations: ConversationScenario[];
  progressMap: Record<string, WordProgress>;
  dailySession: DailySessionState;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  onRateWord: (wordId: string, rating: ReviewRating) => void;
  onToggleSave: (wordId: string) => void;
  onQuizResult: (wordId: string, correct: boolean) => void;
  onCompleteStage: (stageIdx: number) => void;
  onNavigate: (screen: NavScreen) => void;
}

const STAGES = [
  { key: 'discover', title: '1. Discover', subtitle: 'Introduce 5 new words with visuals & audio' },
  { key: 'understand', title: '2. Understand', subtitle: 'Hindi nuances, associations & tricky comparisons' },
  { key: 'practise', title: '3. Practise', subtitle: 'Context quizzes & interactive word matching' },
  { key: 'speak', title: '4. Speak', subtitle: 'Syllable pronunciation & real-life dialogue' },
  { key: 'remember', title: '5. Remember', subtitle: 'Active recall & spaced-repetition scheduling' },
];

export const LearnView: React.FC<LearnViewProps> = ({
  dailyWords,
  confusingSets,
  conversations,
  progressMap,
  dailySession,
  accent,
  onRateWord,
  onToggleSave,
  onQuizResult,
  onCompleteStage,
  onNavigate,
}) => {
  const initialStage = Math.min(4, dailySession.completedStages.length);
  const [stageIdx, setStageIdx] = useState<number>(initialStage >= 5 ? 0 : initialStage);
  const [discoverWordIdx, setDiscoverWordIdx] = useState(0);
  const [practiceSubStep, setPracticeSubStep] = useState<number>(0); // 0..2 quizzes + 3 matching
  const [speakSubStep, setSpeakSubStep] = useState<'pronunciation' | 'conversation'>('pronunciation');
  const [rememberIdx, setRememberIdx] = useState(0);
  const [sessionFinishedBanner, setSessionFinishedBanner] = useState(false);

  const goStage = (nextIdx: number) => {
    setStageIdx(nextIdx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishCurrentStageAndAdvance = () => {
    onCompleteStage(stageIdx);
    if (stageIdx < 4) {
      goStage(stageIdx + 1);
    } else {
      setSessionFinishedBanner(true);
    }
  };

  const souvenirWord = dailyWords.find((w) => w.id === 'souvenir') || dailyWords[0];
  const flatteredScenario =
    conversations.find((c) => c.id === 'conv-flattered') || conversations[0];
  const loseLooseSet = confusingSets[0];

  const quizWords = [
    dailyWords.find((w) => w.id === 'mitigate') || dailyWords[0],
    dailyWords.find((w) => w.id === 'nonchalant') || dailyWords[1],
    dailyWords.find((w) => w.id === 'serendipity') || dailyWords[2],
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow-label">Your Daily 5-Word Session</div>
          <h1 className="page-title" style={{ marginTop: '0.2rem' }}>
            Guided Daily Lesson
          </h1>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.94rem', marginTop: '0.2rem' }}>
            Active recall, Hindi clarity, pronunciation, and conversation woven into one calm session.
          </p>
        </div>

        <div className="tag tag-sage" style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}>
          {dailySession.completedStages.length} of 5 stages completed today
        </div>
      </div>

      {/* 5-Stage Journey Stepper */}
      <nav aria-label="Daily learning journey stages" className="step-flow-bar" style={{ marginBottom: '1.75rem' }}>
        {STAGES.map((st, idx) => {
          const isCompleted = dailySession.completedStages.includes(idx);
          const isActive = stageIdx === idx;
          return (
            <button
              key={st.key}
              type="button"
              id={`journey-stage-btn-${idx}`}
              className={`step-flow-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => goStage(idx)}
            >
              {isCompleted && <CheckCircle2 size={14} />}
              <span>{st.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Stage Completion Celebration */}
      {sessionFinishedBanner && (
        <div
          className="paper-card"
          style={{
            maxWidth: '740px',
            margin: '0 auto 1.5rem',
            padding: '1.6rem',
            background: 'var(--accent-sage-soft)',
            borderColor: 'var(--accent-sage)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.15rem', color: 'var(--accent-sage-ink)' }}>
            <Sparkles size={20} />
            Daily 5-Word Session Completed!
          </div>
          <p style={{ fontSize: '0.94rem', color: 'var(--ink-charcoal)' }}>
            You discovered, practised, spoke, and scheduled all 5 words for spaced-repetition review.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onNavigate('home')}>
              Back to Home
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => onNavigate('my-words')}>
              View My Words Notebook
            </button>
          </div>
        </div>
      )}

      {/* STAGE 0: DISCOVER (5 Vocabulary Cards) */}
      {stageIdx === 0 && (
        <div>
          <div style={{ maxWidth: '740px', margin: '0 auto 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 650, color: 'var(--ink-secondary)' }}>
              Discovering word {discoverWordIdx + 1} of {dailyWords.length}
            </span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {dailyWords.map((w, i) => (
                <button
                  key={w.id}
                  type="button"
                  className={`filter-pill ${discoverWordIdx === i ? 'active' : ''}`}
                  style={{ padding: '0.28rem 0.65rem', fontSize: '0.76rem' }}
                  onClick={() => setDiscoverWordIdx(i)}
                >
                  {w.word}
                </button>
              ))}
            </div>
          </div>

          <VocabLearningCard
            word={dailyWords[discoverWordIdx]}
            progress={progressMap[dailyWords[discoverWordIdx].id]}
            accent={accent}
            onRate={onRateWord}
            onToggleSave={onToggleSave}
            onNext={() => {
              if (discoverWordIdx < dailyWords.length - 1) {
                setDiscoverWordIdx((i) => i + 1);
              } else {
                finishCurrentStageAndAdvance();
              }
            }}
          />

          <div style={{ maxWidth: '740px', margin: '0.9rem auto 0', display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={discoverWordIdx === 0}
              onClick={() => setDiscoverWordIdx((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft size={16} /> Previous word
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={finishCurrentStageAndAdvance}
            >
              Complete Discover stage <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 1: UNDERSTAND (Deep Hindi + Memory Summary + Confusing Words Comparison) */}
      {stageIdx === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="learning-card-shell">
            <span className="tag tag-sand">Today’s 5-Word Nuance Sheet</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 750, marginTop: '0.75rem' }}>
              English Meaning, Hindi Sense &amp; Memory Hook at a Glance
            </h2>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {dailyWords.map((w) => (
                <div
                  key={w.id}
                  className="sand-panel"
                  style={{ padding: '0.85rem 1rem', display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem', alignItems: 'baseline' }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--ink-charcoal)' }}>{w.word}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{w.partOfSpeech}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{w.meaning}</div>
                    <div className="hindi-text" style={{ fontSize: '0.86rem', color: 'var(--accent-mustard-ink)', marginTop: '0.15rem' }}>
                      {w.hindiMeaning}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ConfusingWordsCard
            set={loseLooseSet}
            accent={accent}
            onNext={finishCurrentStageAndAdvance}
          />
        </div>
      )}

      {/* STAGE 2: PRACTISE (Context Quizzes + 5-Word Matching) */}
      {stageIdx === 2 && (
        <div>
          <div style={{ maxWidth: '740px', margin: '0 auto 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 650, color: 'var(--ink-secondary)' }}>
              {practiceSubStep < quizWords.length
                ? `Context Quiz ${practiceSubStep + 1} of ${quizWords.length}`
                : 'Final Exercise: 5-Word Matching'}
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className={`filter-pill ${practiceSubStep < quizWords.length ? 'active' : ''}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem' }}
                onClick={() => setPracticeSubStep(0)}
              >
                Context Quizzes
              </button>
              <button
                type="button"
                className={`filter-pill ${practiceSubStep === quizWords.length ? 'active' : ''}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem' }}
                onClick={() => setPracticeSubStep(quizWords.length)}
              >
                Word Matching
              </button>
            </div>
          </div>

          {practiceSubStep < quizWords.length ? (
            <ContextQuizCard
              word={quizWords[practiceSubStep]}
              accent={accent}
              onResult={onQuizResult}
              onNext={() => setPracticeSubStep((s) => s + 1)}
            />
          ) : (
            <MatchingExerciseCard
              words={dailyWords}
              accent={accent}
              onComplete={finishCurrentStageAndAdvance}
            />
          )}
        </div>
      )}

      {/* STAGE 3: SPEAK (Pronunciation Card + Real-Life Conversation Card) */}
      {stageIdx === 3 && (
        <div>
          <div style={{ maxWidth: '740px', margin: '0 auto 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 650, color: 'var(--ink-secondary)' }}>
              Speak &amp; Use Naturally ({speakSubStep === 'pronunciation' ? 'Part 1 of 2: Pronunciation' : 'Part 2 of 2: Conversation'})
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className={`filter-pill ${speakSubStep === 'pronunciation' ? 'active' : ''}`}
                style={{ padding: '0.25rem 0.7rem', fontSize: '0.76rem' }}
                onClick={() => setSpeakSubStep('pronunciation')}
              >
                1. Pronunciation ({souvenirWord.word})
              </button>
              <button
                type="button"
                className={`filter-pill ${speakSubStep === 'conversation' ? 'active' : ''}`}
                style={{ padding: '0.25rem 0.7rem', fontSize: '0.76rem' }}
                onClick={() => setSpeakSubStep('conversation')}
              >
                2. Conversation ({flatteredScenario.targetWord})
              </button>
            </div>
          </div>

          {speakSubStep === 'pronunciation' ? (
            <PronunciationCard
              word={souvenirWord}
              accent={accent}
              onCompletedPractice={(wordId, confident) =>
                onRateWord(wordId, confident ? 'remembered' : 'difficult')
              }
              onNext={() => setSpeakSubStep('conversation')}
            />
          ) : (
            <ConversationCard
              scenario={flatteredScenario}
              accent={accent}
              onNext={finishCurrentStageAndAdvance}
            />
          )}
        </div>
      )}

      {/* STAGE 4: REMEMBER (Active Recall Check & Spaced Repetition Scheduling) */}
      {stageIdx === 4 && (
        <div>
          <MemoryRevisionCard
            word={dailyWords[rememberIdx]}
            progress={progressMap[dailyWords[rememberIdx].id]}
            accent={accent}
            queuePositionLabel={`Recall check ${rememberIdx + 1} of ${dailyWords.length}`}
            onReviewDecision={(wordId, rating) => {
              onRateWord(wordId, rating);
              if (rememberIdx < dailyWords.length - 1) {
                setRememberIdx((i) => i + 1);
              } else {
                finishCurrentStageAndAdvance();
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
