import React, { useMemo, useState } from 'react';
import { Bookmark, Plus, Search, Volume2 } from 'lucide-react';
import type { VocabWord, WordProgress } from '../types/vocab';
import { speakEnglish } from '../utils/speech';

export type MyWordsFilter =
  | 'all'
  | 'pronunciation'
  | 'vocabulary'
  | 'confusing'
  | 'phrases'
  | 'difficult'
  | 'mastered';

interface MyWordsViewProps {
  words: VocabWord[];
  progressMap: Record<string, WordProgress>;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  onInspectWord: (word: VocabWord) => void;
  onToggleSave: (wordId: string) => void;
  onOpenAddWord: () => void;
}

const FILTERS: { id: MyWordsFilter; label: string }[] = [
  { id: 'all', label: 'All words' },
  { id: 'pronunciation', label: 'Pronunciation' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'confusing', label: 'Confusing words' },
  { id: 'phrases', label: 'Phrases' },
  { id: 'difficult', label: 'Difficult words' },
  { id: 'mastered', label: 'Mastered words' },
];

export const MyWordsView: React.FC<MyWordsViewProps> = ({
  words,
  progressMap,
  accent,
  onInspectWord,
  onToggleSave,
  onOpenAddWord,
}) => {
  const [activeFilter, setActiveFilter] = useState<MyWordsFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const prog = progressMap[w.id];
      if (savedOnly && !prog?.saved) return false;

      if (activeFilter === 'pronunciation' && w.category !== 'pronunciation') return false;
      if (activeFilter === 'vocabulary' && w.category !== 'vocabulary') return false;
      if (activeFilter === 'confusing' && w.category !== 'confusing') return false;
      if (activeFilter === 'phrases' && w.category !== 'phrases') return false;
      if (activeFilter === 'difficult' && prog?.status !== 'difficult') return false;
      if (activeFilter === 'mastered' && prog?.status !== 'mastered') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          w.word.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q) ||
          w.hindiMeaning.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [words, progressMap, activeFilter, searchQuery, savedOnly]);

  return (
    <div>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.35rem',
        }}
      >
        <div>
          <div className="eyebrow-label">Personal Vocabulary Notebook</div>
          <h1 className="page-title" style={{ marginTop: '0.2rem' }}>
            My Words
          </h1>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.94rem', marginTop: '0.2rem' }}>
            Your curated collection of English words, Hindi meanings, tricky pairs, and personal additions.
          </p>
        </div>

        <button
          type="button"
          id="open-add-word-modal-btn"
          className="btn btn-primary"
          onClick={onOpenAddWord}
        >
          <Plus size={16} />
          Add personal word
        </button>
      </header>

      {/* Search & Saved Toggle */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-muted)',
            }}
          />
          <input
            type="search"
            id="my-words-search-input"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.4rem', background: 'var(--bg-paper)' }}
            placeholder="Search by English word, meaning, or हिंदी अर्थ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={`filter-pill ${savedOnly ? 'active' : ''}`}
          onClick={() => setSavedOnly((s) => !s)}
        >
          <Bookmark size={13} style={{ marginRight: '5px', verticalAlign: '-2px' }} />
          Bookmarked only
        </button>
      </div>

      {/* All 7 Requested Filters */}
      <div className="filter-pills-row" style={{ marginBottom: '1.5rem' }} role="tablist" aria-label="Word notebook filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            id={`filter-mywords-${f.id}`}
            className={`filter-pill ${activeFilter === f.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notebook Grid */}
      {filteredWords.length === 0 ? (
        <div className="paper-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontWeight: 650, fontSize: '1.05rem' }}>No words match this filter yet.</p>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginTop: '0.35rem' }}>
            Try clearing the search query or mark words as Easy / Difficult while practising.
          </p>
        </div>
      ) : (
        <div className="words-notebook-grid">
          {filteredWords.map((w) => {
            const prog = progressMap[w.id];
            const status = prog?.status || 'new';

            return (
              <article key={w.id} className="paper-card notebook-word-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span className="tag tag-sand" style={{ textTransform: 'capitalize' }}>
                        {w.category}
                      </span>
                      {status === 'difficult' && <span className="tag tag-clay">Difficult</span>}
                      {status === 'mastered' && <span className="tag tag-sage">Mastered</span>}
                      {w.isCustom && <span className="tag tag-mustard">Custom</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.3rem' }}
                        onClick={() => speakEnglish(w.word, { accent })}
                        title="Listen to pronunciation"
                      >
                        <Volume2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.3rem' }}
                        onClick={() => onToggleSave(w.id)}
                        title={prog?.saved ? 'Saved in notebook' : 'Bookmark word'}
                      >
                        <Bookmark
                          size={15}
                          fill={prog?.saved ? 'var(--accent-mustard)' : 'none'}
                          color={prog?.saved ? 'var(--accent-mustard-ink)' : 'currentColor'}
                        />
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.6rem' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                      {w.word}
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                      {w.partOfSpeech} · {w.pronunciation}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', marginTop: '0.55rem' }}>
                    {w.meaning}
                  </p>

                  <p
                    className="hindi-text"
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--accent-mustard-ink)',
                      marginTop: '0.45rem',
                    }}
                  >
                    {w.hindiMeaning}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '0.7rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                    {prog?.intervalDays
                      ? `Next review: +${prog.intervalDays}d`
                      : 'Ready to practise'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onInspectWord(w)}
                  >
                    Open card →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
