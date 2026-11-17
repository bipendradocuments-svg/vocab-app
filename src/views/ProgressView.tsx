import React from 'react';
import { Download, RotateCcw, Volume2 } from 'lucide-react';
import type {
  DailySessionState,
  LearnerSettings,
  VocabWord,
  WordProgress,
} from '../types/vocab';

interface ProgressViewProps {
  words: VocabWord[];
  progressMap: Record<string, WordProgress>;
  dailySession: DailySessionState;
  studyDays: string[];
  settings: LearnerSettings;
  onUpdateSettings: (next: LearnerSettings) => void;
  onResetDemo: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  words,
  progressMap,
  dailySession,
  studyDays,
  settings,
  onUpdateSettings,
  onResetDemo,
}) => {
  const progressList = words.map((w) => progressMap[w.id]).filter(Boolean);
  const masteredCount = progressList.filter((p) => p.status === 'mastered').length;
  const learningCount = progressList.filter((p) => p.status === 'learning').length;
  const difficultCount = progressList.filter((p) => p.status === 'difficult').length;
  const savedCount = progressList.filter((p) => p.saved).length;

  const accuracyPct =
    dailySession.quizzesAnsweredToday > 0
      ? Math.round((dailySession.quizzesCorrectToday / dailySession.quizzesAnsweredToday) * 100)
      : 100;

  // Build last 7 days strip
  const lastSevenDays = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(Date.now() - (6 - idx) * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      key,
      weekday,
      dayNum: d.getDate(),
      studied: studyDays.includes(key),
    };
  });

  const categories = [
    { key: 'vocabulary', label: 'Vocabulary & Nuance' },
    { key: 'pronunciation', label: 'Pronunciation & Stress' },
    { key: 'confusing', label: 'Confusing Word Pairs' },
    { key: 'phrases', label: 'Phrases & Conversation' },
  ] as const;

  const handleExportNotebook = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings,
      progress: progressMap,
      customWords: words.filter((w) => w.isCustom),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wordup-personal-notebook.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="eyebrow-label">Calm Learning Analytics &amp; Preferences</div>
        <h1 className="page-title" style={{ marginTop: '0.2rem' }}>
          Progress &amp; Profile
        </h1>
        <p style={{ color: 'var(--ink-secondary)', fontSize: '0.94rem', marginTop: '0.2rem' }}>
          Track long-term retention, weekly consistency, and personalise your pronunciation voice.
        </p>
      </header>

      {/* Top Summary Metrics */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
          gap: '0.95rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="paper-card" style={{ padding: '1.25rem' }}>
          <div className="eyebrow-label">Mastered Words</div>
          <div className="metric-number" style={{ marginTop: '0.45rem', color: 'var(--accent-sage-ink)' }}>
            {String(masteredCount).padStart(2, '0')}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.35rem' }}>
            Long-term spaced retention
          </p>
        </div>

        <div className="paper-card" style={{ padding: '1.25rem' }}>
          <div className="eyebrow-label">Actively Learning</div>
          <div className="metric-number" style={{ marginTop: '0.45rem' }}>
            {String(learningCount).padStart(2, '0')}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.35rem' }}>
            {savedCount} saved in My Words
          </p>
        </div>

        <div className="paper-card" style={{ padding: '1.25rem' }}>
          <div className="eyebrow-label">Difficult Focus</div>
          <div className="metric-number" style={{ marginTop: '0.45rem', color: 'var(--accent-mustard-ink)' }}>
            {String(difficultCount).padStart(2, '0')}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.35rem' }}>
            Scheduled for closer review
          </p>
        </div>

        <div className="paper-card" style={{ padding: '1.25rem' }}>
          <div className="eyebrow-label">Quiz Accuracy</div>
          <div className="metric-number" style={{ marginTop: '0.45rem' }}>
            {accuracyPct}%
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.35rem' }}>
            {dailySession.reviewsCompletedToday} reviews completed today
          </p>
        </div>
      </section>

      {/* Two-Column Breakdown: 7-Day Rhythm & Category Distribution */}
      <div className="home-top-grid" style={{ marginBottom: '1.5rem' }}>
        <section className="paper-card" style={{ padding: '1.45rem' }}>
          <h2 className="section-heading">7-Day Study Rhythm</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>
            Steady short sessions beat occasional cramming.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.5rem',
              marginTop: '1.25rem',
            }}
          >
            {lastSevenDays.map((d) => (
              <div
                key={d.key}
                style={{
                  padding: '0.7rem 0.3rem',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  background: d.studied ? 'var(--accent-sage-soft)' : 'var(--bg-sand-muted)',
                  border: `1px solid ${d.studied ? 'var(--accent-sage)' : 'var(--border-subtle)'}`,
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 650, color: 'var(--ink-muted)' }}>
                  {d.weekday}
                </div>
                <div
                  style={{
                    marginTop: '0.35rem',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: d.studied ? 'var(--accent-sage-ink)' : 'var(--ink-secondary)',
                  }}
                >
                  {d.dayNum}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="paper-card" style={{ padding: '1.45rem' }}>
          <h2 className="section-heading">Coverage Across Skills</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
            {categories.map((cat) => {
              const catWords = words.filter((w) => w.category === cat.key);
              const practiced = catWords.filter(
                (w) => (progressMap[w.id]?.timesPracticed ?? 0) > 0
              ).length;
              const pct = catWords.length > 0 ? Math.round((practiced / catWords.length) * 100) : 0;

              return (
                <div key={cat.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    <span>{cat.label}</span>
                    <span style={{ color: 'var(--ink-muted)' }}>
                      {practiced} / {catWords.length} practised
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill mustard" style={{ width: `${Math.max(10, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Personal Tutor Preferences & Local Data Management */}
      <section className="paper-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-heading">Personal Tutor Preferences</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.15rem' }}>
              Stored privately in your browser via LocalStorage &amp; IndexedDB.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportNotebook}>
              <Download size={14} />
              Export Notebook JSON
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onResetDemo}>
              <RotateCcw size={14} />
              Reset sample progress
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: '1.2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div className="form-field">
            <label className="form-label" htmlFor="pref-accent">
              <Volume2 size={13} style={{ marginRight: '4px', verticalAlign: '-2px' }} />
              Pronunciation Voice Accent
            </label>
            <select
              id="pref-accent"
              className="form-input"
              value={settings.voiceAccent}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  voiceAccent: e.target.value as LearnerSettings['voiceAccent'],
                })
              }
            >
              <option value="en-IN">Indian English (en-IN)</option>
              <option value="en-GB">British English (en-GB)</option>
              <option value="en-US">American English (en-US)</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="pref-goal">
              Daily Session Goal
            </label>
            <select
              id="pref-goal"
              className="form-input"
              value={settings.dailyGoalWords}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  dailyGoalWords: Number(e.target.value),
                })
              }
            >
              <option value={3}>3 words / day (Light)</option>
              <option value={5}>5 words / day (Recommended)</option>
              <option value={8}>8 words / day (Intensive)</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};
