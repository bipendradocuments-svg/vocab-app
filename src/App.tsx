import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookMarked,
  Compass,
  Home,
  Layers,
  RotateCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type {
  DailySessionState,
  LearnerSettings,
  NavScreen,
  PracticeMode,
  ReviewRating,
  VocabWord,
  WordProgress,
} from './types/vocab';
import {
  dataset,
  loadCustomWords,
  loadDailySession,
  loadLearnerSettings,
  loadStudyDays,
  loadWordProgress,
  resetAllProgress,
  saveCustomWords,
  saveDailySession,
  saveLearnerSettings,
  saveWordProgress,
  scheduleWordReview,
} from './utils/storage';
import { HomeView } from './views/HomeView';
import { LearnView } from './views/LearnView';
import { PracticeView } from './views/PracticeView';
import { MyWordsView } from './views/MyWordsView';
import { RevisionView } from './views/RevisionView';
import { ProgressView } from './views/ProgressView';
import { AddWordModal } from './components/AddWordModal';
import { VocabLearningCard } from './components/cards/VocabLearningCard';

const NAV_ITEMS: { id: NavScreen; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home size={16} /> },
  { id: 'learn', label: 'Learn', icon: <Compass size={16} /> },
  { id: 'practice', label: 'Practice', icon: <Layers size={16} /> },
  { id: 'my-words', label: 'My Words', icon: <BookMarked size={16} /> },
  { id: 'revision', label: 'Revision', icon: <RotateCw size={16} /> },
  { id: 'progress', label: 'Progress', icon: <BarChart3 size={16} /> },
];

export function App() {
  const [customWords, setCustomWords] = useState<VocabWord[]>(() => loadCustomWords());
  const allWords = useMemo(() => [...customWords, ...dataset.words], [customWords]);

  const [progressMap, setProgressMap] = useState<Record<string, WordProgress>>(() =>
    loadWordProgress([...loadCustomWords(), ...dataset.words])
  );
  const [dailySession, setDailySession] = useState<DailySessionState>(() => loadDailySession());
  const [settings, setSettings] = useState<LearnerSettings>(() => loadLearnerSettings());
  const [studyDays, setStudyDays] = useState<string[]>(() => loadStudyDays());

  const [activeScreen, setActiveScreen] = useState<NavScreen>('home');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('vocabulary');
  const [inspectedWord, setInspectedWord] = useState<VocabWord | null>(null);
  const [showAddWordModal, setShowAddWordModal] = useState(false);

  useEffect(() => {
    saveWordProgress(progressMap);
  }, [progressMap]);

  useEffect(() => {
    saveDailySession(dailySession);
  }, [dailySession]);

  useEffect(() => {
    saveLearnerSettings(settings);
  }, [settings]);

  const featuredWord = useMemo(
    () => allWords.find((w) => w.id === dataset.featuredWordId) || allWords[0],
    [allWords]
  );

  const dailyWords = useMemo(() => {
    const picked = dataset.dailySessionWordIds
      .map((id) => allWords.find((w) => w.id === id))
      .filter((w): w is VocabWord => Boolean(w));
    return picked.length > 0 ? picked : allWords.slice(0, 5);
  }, [allWords]);

  const dueRevisionWords = useMemo(() => {
    const now = Date.now();
    return allWords.filter((w) => {
      const p = progressMap[w.id];
      if (!p) return false;
      return (p.status === 'learning' || p.status === 'difficult') && p.nextReviewAt <= now;
    });
  }, [allWords, progressMap]);

  const difficultWords = useMemo(
    () => allWords.filter((w) => progressMap[w.id]?.status === 'difficult'),
    [allWords, progressMap]
  );

  const handleNavigate = (screen: NavScreen) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPracticeMode = (mode: PracticeMode) => {
    setPracticeMode(mode);
    setActiveScreen('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRateWord = (wordId: string, rating: ReviewRating) => {
    setProgressMap((prev) => {
      const existing: WordProgress = prev[wordId] || {
        wordId,
        saved: true,
        status: 'new',
        intervalDays: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: Date.now(),
        timesPracticed: 0,
      };
      const updated = scheduleWordReview(existing, rating);
      return { ...prev, [wordId]: updated };
    });

    setDailySession((prev) => ({
      ...prev,
      reviewsCompletedToday: prev.reviewsCompletedToday + 1,
    }));
    setStudyDays(loadStudyDays());
  };

  const handleToggleSave = (wordId: string) => {
    setProgressMap((prev) => {
      const existing = prev[wordId] || {
        wordId,
        saved: false,
        status: 'new' as const,
        intervalDays: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: Date.now(),
        timesPracticed: 0,
      };
      return {
        ...prev,
        [wordId]: { ...existing, saved: !existing.saved },
      };
    });
  };

  const handleQuizResult = (wordId: string, correct: boolean) => {
    setDailySession((prev) => ({
      ...prev,
      quizzesAnsweredToday: prev.quizzesAnsweredToday + 1,
      quizzesCorrectToday: prev.quizzesCorrectToday + (correct ? 1 : 0),
    }));
    if (!correct) {
      handleRateWord(wordId, 'difficult');
    }
  };

  const handleCompleteStage = (stageIdx: number) => {
    setDailySession((prev) => {
      if (prev.completedStages.includes(stageIdx)) return prev;
      return {
        ...prev,
        completedStages: [...prev.completedStages, stageIdx].sort((a, b) => a - b),
      };
    });
  };

  const handleAddCustomWord = (word: VocabWord) => {
    const nextCustom = [word, ...customWords];
    setCustomWords(nextCustom);
    saveCustomWords(nextCustom);
    setProgressMap((prev) => ({
      ...prev,
      [word.id]: {
        wordId: word.id,
        saved: true,
        status: 'learning',
        intervalDays: 1,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: Date.now(),
        timesPracticed: 0,
      },
    }));
  };

  const handleResetDemo = () => {
    resetAllProgress();
    setCustomWords([]);
    const freshWords = dataset.words;
    setProgressMap(loadWordProgress(freshWords));
    setDailySession(loadDailySession());
    setStudyDays(loadStudyDays());
  };

  return (
    <div className="app-shell">
      {/* Sticky Minimal Editorial Top Navigation */}
      <header className="top-nav">
        <div className="top-nav-inner">
          <button
            type="button"
            id="brand-home-btn"
            className="brand-lockup"
            onClick={() => handleNavigate('home')}
          >
            <div className="brand-mark" aria-hidden="true">
              W
              <span className="brand-mark-dot" />
            </div>
            <div>
              <div className="brand-name">WordUp</div>
              <div className="brand-tagline">Learn, Remember &amp; Speak</div>
            </div>
          </button>

          <nav className="desktop-nav-links" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                id={`nav-tab-${item.id}`}
                className={`nav-tab-btn ${activeScreen === item.id ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'revision' && dueRevisionWords.length > 0 && (
                  <span className="nav-badge">{dueRevisionWords.length}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              id="header-profile-prefs-btn"
              className="profile-trigger-btn"
              onClick={() => handleNavigate('progress')}
              title="Voice accent & learner profile"
            >
              <SlidersHorizontal size={14} />
              <span>{settings.voiceAccent === 'en-IN' ? 'IN' : settings.voiceAccent === 'en-GB' ? 'UK' : 'US'} Voice</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="main-container">
        {activeScreen === 'home' && (
          <HomeView
            featuredWord={featuredWord}
            dailyWordsCount={settings.dailyGoalWords}
            dueRevisionCount={dueRevisionWords.length}
            dailySession={dailySession}
            accent={settings.voiceAccent}
            onNavigate={handleNavigate}
            onOpenPracticeMode={handleOpenPracticeMode}
            onInspectWord={(w) => setInspectedWord(w)}
          />
        )}

        {activeScreen === 'learn' && (
          <LearnView
            dailyWords={dailyWords}
            confusingSets={dataset.confusingSets}
            conversations={dataset.conversations}
            progressMap={progressMap}
            dailySession={dailySession}
            accent={settings.voiceAccent}
            onRateWord={handleRateWord}
            onToggleSave={handleToggleSave}
            onQuizResult={handleQuizResult}
            onCompleteStage={handleCompleteStage}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'practice' && (
          <PracticeView
            initialMode={practiceMode}
            words={allWords}
            confusingSets={dataset.confusingSets}
            conversations={dataset.conversations}
            progressMap={progressMap}
            accent={settings.voiceAccent}
            onRateWord={handleRateWord}
            onToggleSave={handleToggleSave}
            onQuizResult={handleQuizResult}
          />
        )}

        {activeScreen === 'my-words' && (
          <MyWordsView
            words={allWords}
            progressMap={progressMap}
            accent={settings.voiceAccent}
            onInspectWord={(w) => setInspectedWord(w)}
            onToggleSave={handleToggleSave}
            onOpenAddWord={() => setShowAddWordModal(true)}
          />
        )}

        {activeScreen === 'revision' && (
          <RevisionView
            dueWords={dueRevisionWords}
            difficultWords={difficultWords}
            progressMap={progressMap}
            accent={settings.voiceAccent}
            onReviewDecision={handleRateWord}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'progress' && (
          <ProgressView
            words={allWords}
            progressMap={progressMap}
            dailySession={dailySession}
            studyDays={studyDays}
            settings={settings}
            onUpdateSettings={setSettings}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <div className="mobile-bottom-nav-inner">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-item ${activeScreen === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'revision' && dueRevisionWords.length > 0 && (
                <span className="mobile-nav-dot" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Full Word Card Inspector Modal */}
      {inspectedWord && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectedWord(null);
          }}
        >
          <div style={{ width: '100%', maxWidth: '760px', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setInspectedWord(null)}
              >
                <X size={15} /> Close card
              </button>
            </div>
            <VocabLearningCard
              word={inspectedWord}
              progress={progressMap[inspectedWord.id]}
              accent={settings.voiceAccent}
              defaultRevealed
              onRate={handleRateWord}
              onToggleSave={handleToggleSave}
            />
          </div>
        </div>
      )}

      {/* Add Personal Word Modal */}
      {showAddWordModal && (
        <AddWordModal
          onClose={() => setShowAddWordModal(false)}
          onAddWord={handleAddCustomWord}
        />
      )}
    </div>
  );
}

export default App;
