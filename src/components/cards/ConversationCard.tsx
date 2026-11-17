import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, MessageSquare, Play, Square, Volume2, XCircle } from 'lucide-react';
import type { ConversationScenario } from '../../types/vocab';
import { playDialogueSequence, speakEnglish } from '../../utils/speech';

interface ConversationCardProps {
  scenario: ConversationScenario;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  onCompleted?: (correct: boolean) => void;
  onNext?: () => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  scenario,
  accent,
  onCompleted,
  onNext,
}) => {
  const [activeTurnIdx, setActiveTurnIdx] = useState<number | null>(null);
  const [selectedReply, setSelectedReply] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const cancelPlaybackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setSelectedReply(null);
    setChecked(false);
    setActiveTurnIdx(null);
    return () => {
      cancelPlaybackRef.current?.();
    };
  }, [scenario.id]);

  const handlePlayConversation = () => {
    if (activeTurnIdx !== null) {
      cancelPlaybackRef.current?.();
      return;
    }
    cancelPlaybackRef.current = playDialogueSequence(
      scenario.turns.map((t) => ({ text: t.line, speaker: t.speaker })),
      accent,
      (idx) => setActiveTurnIdx(idx)
    );
  };

  const handleCheckCompletion = () => {
    if (selectedReply === null) return;
    setChecked(true);
    onCompleted?.(selectedReply === scenario.completionSetup.correctIndex);
  };

  const isCorrect = selectedReply === scenario.completionSetup.correctIndex;

  return (
    <article className="learning-card-shell" id={`conversation-card-${scenario.id}`}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="tag tag-sage">Real-Life Conversation</span>
          <span className="tag tag-sand">{scenario.registerBadge}</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
          Read → Understand → Complete the conversation
        </span>
      </div>

      {/* Word Focus */}
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="eyebrow-label">Target Expression</div>
          <h2 className="vocab-display-word" style={{ fontSize: '2rem', textTransform: 'uppercase', marginTop: '0.15rem' }}>
            {scenario.targetWord}
          </h2>
          <p style={{ fontSize: '0.94rem', color: 'var(--ink-secondary)', marginTop: '0.15rem' }}>
            {scenario.title}
          </p>
        </div>

        <button
          type="button"
          id={`play-dialogue-${scenario.id}`}
          className={`btn ${activeTurnIdx !== null ? 'btn-mustard' : 'btn-secondary'} btn-sm`}
          onClick={handlePlayConversation}
        >
          {activeTurnIdx !== null ? <Square size={14} /> : <Play size={14} />}
          {activeTurnIdx !== null ? 'Stop Dialogue' : 'Listen to Dialogue'}
        </button>
      </div>

      {/* Step 1: Read Natural Dialogue */}
      <div className="dialogue-stack" style={{ marginTop: '1.15rem' }}>
        {scenario.turns.map((turn, idx) => (
          <div key={idx} className="dialogue-turn">
            <div className={`speaker-avatar ${turn.isTarget ? 'highlight' : ''}`}>{turn.speaker}</div>
            <div
              className={`dialogue-bubble ${turn.isTarget ? 'highlight' : ''}`}
              style={{
                outline: activeTurnIdx === idx ? '2px solid var(--accent-mustard)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink-muted)' }}>
                  {turn.name}
                </span>
                <button
                  type="button"
                  onClick={() => speakEnglish(turn.line, { accent, pitch: turn.speaker === 'A' ? 0.96 : 1.08 })}
                  style={{ color: 'var(--ink-muted)', padding: '2px' }}
                  title="Play this line"
                >
                  <Volume2 size={14} />
                </button>
              </div>
              <p style={{ fontWeight: turn.isTarget ? 650 : 500 }}>{turn.line}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Step 2: Understand Register & Hindi Nuance */}
      <div
        style={{
          marginTop: '1.1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '0.85rem',
        }}
      >
        <div className="hindi-callout">
          <div className="eyebrow-label" style={{ color: 'var(--accent-mustard-ink)', marginBottom: '0.25rem' }}>
            Hindi Meaning &amp; Tone
          </div>
          <p className="hindi-text" style={{ fontSize: '0.96rem', fontWeight: 600 }}>
            {scenario.hindiMeaning}
          </p>
        </div>

        <div className="sand-panel" style={{ padding: '0.95rem 1.1rem' }}>
          <div className="eyebrow-label" style={{ marginBottom: '0.25rem' }}>
            When &amp; How to Use Professionally
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-charcoal)' }}>{scenario.whenToUse}</p>
          <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', marginTop: '0.35rem' }}>
            <strong>Tip:</strong> {scenario.professionalTip}
          </p>
        </div>
      </div>

      {/* Step 3: Complete the Conversation */}
      <div
        style={{
          marginTop: '1.3rem',
          padding: '1.2rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-sand)',
          background: 'var(--bg-paper-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
          <MessageSquare size={16} style={{ color: 'var(--accent-sage)' }} />
          <span className="eyebrow-label">Your Turn: Complete the Conversation</span>
        </div>

        <p
          style={{
            padding: '0.75rem 0.95rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-sand-muted)',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          {scenario.completionSetup.speakerA}
        </p>

        <p style={{ fontSize: '0.84rem', color: 'var(--ink-muted)', marginTop: '0.65rem', marginBottom: '0.6rem' }}>
          {scenario.completionSetup.promptHint}
        </p>

        <div className="quiz-options-stack">
          {scenario.completionSetup.options.map((opt, idx) => {
            let cls = '';
            if (checked) {
              if (idx === scenario.completionSetup.correctIndex) cls = 'correct';
              else if (idx === selectedReply) cls = 'incorrect';
            } else if (idx === selectedReply) {
              cls = 'selected';
            }
            return (
              <button
                key={idx}
                type="button"
                disabled={checked}
                className={`quiz-option-btn ${cls}`}
                onClick={() => setSelectedReply(idx)}
              >
                <span className="quiz-letter">{idx + 1}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {!checked ? (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              id={`check-conv-${scenario.id}`}
              className="btn btn-primary"
              disabled={selectedReply === null}
              onClick={handleCheckCompletion}
            >
              Check reply
            </button>
          </div>
        ) : (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.95rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: isCorrect ? 'var(--accent-sage-soft)' : 'var(--accent-clay-soft)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: isCorrect ? 'var(--accent-sage-ink)' : 'var(--accent-clay-ink)' }}>
              {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {isCorrect ? 'Natural, polite, and confident!' : 'Let’s refine the phrasing:'}
            </div>
            <p style={{ fontSize: '0.9rem' }}>{scenario.completionSetup.explanation}</p>
            {onNext && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={onNext}>
                  Continue →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
