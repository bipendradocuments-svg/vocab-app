import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Headphones, Mic, Play, RefreshCw, Square, Turtle, Volume2 } from 'lucide-react';
import type { VocabWord } from '../../types/vocab';
import { speakEnglish } from '../../utils/speech';
import { loadVoiceRecordingBlob, saveVoiceRecordingBlob } from '../../utils/storage';

interface PronunciationCardProps {
  word: VocabWord;
  accent: 'en-IN' | 'en-GB' | 'en-US';
  onCompletedPractice?: (wordId: string, confident: boolean) => void;
  onNext?: () => void;
}

type PronStep = 0 | 1 | 2 | 3; // Listen -> Repeat -> Record -> Review

export const PronunciationCard: React.FC<PronunciationCardProps> = ({
  word,
  accent,
  onCompletedPractice,
  onNext,
}) => {
  const [activeStep, setActiveStep] = useState<PronStep>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingMessage, setRecordingMessage] = useState<string | null>(null);
  const [spokenTranscript, setSpokenTranscript] = useState<string | null>(null);
  const [selfAssessed, setSelfAssessed] = useState<'confident' | 'retry' | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    let mounted = true;
    setActiveStep(0);
    setSelfAssessed(null);
    setRecordingMessage(null);
    setSpokenTranscript(null);

    loadVoiceRecordingBlob(word.id).then((blob) => {
      if (!mounted) return;
      if (blob) {
        setAudioUrl(URL.createObjectURL(blob));
      } else {
        setAudioUrl(null);
      }
    });

    return () => {
      mounted = false;
    };
  }, [word.id]);

  const handleListen = (rate: number) => {
    setIsSpeaking(true);
    speakEnglish(word.word, {
      rate,
      accent,
      onEnd: () => {
        setIsSpeaking(false);
        setActiveStep((prev) => (prev < 1 ? 1 : prev));
      },
    });
  };

  const handleSpeakSyllable = (syllable: string) => {
    speakEnglish(syllable, { rate: 0.72, accent });
  };

  const startRecording = async () => {
    setRecordingMessage(null);
    setSpokenTranscript(null);
    setActiveStep(2);

    // Optional browser SpeechRecognition for phonetic word match feedback
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.lang = accent;
        rec.interimResults = false;
        rec.onresult = (e: any) => {
          const text = e.results?.[0]?.[0]?.transcript;
          if (text) setSpokenTranscript(text);
        };
        rec.start();
        recognitionRef.current = rec;
      } catch {
        // ignore if unsupported
      }
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) chunksRef.current.push(ev.data);
        };
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          saveVoiceRecordingBlob(word.id, blob);
          setActiveStep(3);
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
        return;
      } catch {
        // Microphone denied or unavailable in browser sandbox -> provide guided practice timer
      }
    }

    // Graceful guided voice-capture fallback if browser has no physical mic attached
    setIsRecording(true);
    setRecordingMessage('Practising aloud (microphone not detected on this device — timing your spoken repetition)...');
    setTimeout(() => {
      setIsRecording(false);
      setRecordingMessage('Spoken repetition completed! Listen again below to compare stress and vowel clarity.');
      setActiveStep(3);
    }, 2200);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setActiveStep(3);
  };

  const playUserRecording = () => {
    if (!audioUrl) {
      handleListen(0.85);
      return;
    }
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {});
  };

  const handleCompareSideBySide = () => {
    setIsSpeaking(true);
    speakEnglish(word.word, {
      rate: 0.9,
      accent,
      onEnd: () => {
        setIsSpeaking(false);
        if (audioUrl) {
          setTimeout(() => playUserRecording(), 320);
        }
      },
    });
  };

  const steps = ['1. Listen', '2. Repeat', '3. Record', '4. Review'];

  return (
    <article className="learning-card-shell" id={`pronunciation-card-${word.id}`}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="tag tag-sage">Pronunciation Studio</span>
          <span className="tag tag-sand">{word.badge}</span>
        </div>
        <span className="hindi-text" style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
          {word.hindiMeaning}
        </span>
      </div>

      {/* 4-Step Flow Indicator */}
      <div className="step-flow-bar" style={{ marginTop: '1rem' }}>
        {steps.map((label, idx) => (
          <button
            key={label}
            type="button"
            className={`step-flow-pill ${activeStep === idx ? 'active' : ''} ${activeStep > idx ? 'completed' : ''}`}
            onClick={() => setActiveStep(idx as PronStep)}
          >
            {activeStep > idx && <CheckCircle2 size={14} />}
            {label}
          </button>
        ))}
      </div>

      {/* Word & Phonetic Spelling */}
      <div style={{ marginTop: '1.4rem' }}>
        <div className="eyebrow-label">Target Word</div>
        <h2 className="vocab-display-word" style={{ textTransform: 'uppercase', marginTop: '0.2rem' }}>
          {word.word}
        </h2>
        <p className="ipa-text" style={{ marginTop: '0.35rem' }}>
          Phonetic: <strong>{word.pronunciation}</strong> &nbsp;·&nbsp; IPA:{' '}
          <span style={{ fontFamily: 'monospace' }}>{word.ipa}</span>
        </p>
      </div>

      {/* Interactive Syllable Breakdown */}
      <div style={{ marginTop: '1.2rem' }}>
        <div className="eyebrow-label">
          Syllable Breakdown <span style={{ fontWeight: 500, textTransform: 'none' }}>(tap any syllable, stress in mustard)</span>
        </div>
        <div className="syllable-row">
          {word.syllables.map((syl, i) => (
            <React.Fragment key={`${syl}-${i}`}>
              <button
                type="button"
                className={`syllable-block ${i === word.stressedSyllableIndex ? 'stressed' : ''}`}
                onClick={() => handleSpeakSyllable(syl)}
                title={i === word.stressedSyllableIndex ? 'Primary stressed syllable' : 'Tap to hear syllable'}
              >
                {syl}
              </button>
              {i < word.syllables.length - 1 && <span className="syllable-dot">·</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="sand-panel" style={{ padding: '0.85rem 1rem', fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
          <strong>Coach tip:</strong> {word.pronunciationTip}
        </div>
      </div>

      {/* Step 1 & 2: Listen & Repeat Controls */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '1.15rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-paper-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              id={`pron-listen-normal-${word.id}`}
              className="btn btn-primary"
              onClick={() => handleListen(0.92)}
            >
              <Volume2 size={16} />
              Listen Normal
            </button>

            <button
              type="button"
              id={`pron-listen-slow-${word.id}`}
              className="btn btn-secondary"
              onClick={() => handleListen(0.58)}
            >
              <Turtle size={16} />
              Slow Syllables
            </button>
          </div>

          {isSpeaking && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-mustard-ink)', fontSize: '0.84rem', fontWeight: 600 }}>
              <span className="waveform-bars">
                <span className="waveform-bar" />
                <span className="waveform-bar" />
                <span className="waveform-bar" />
                <span className="waveform-bar" />
                <span className="waveform-bar" />
              </span>
              Playing reference...
            </span>
          )}
        </div>

        {/* Step 3: Record Your Voice */}
        <div
          style={{
            paddingTop: '0.95rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {!isRecording ? (
              <button
                type="button"
                id={`pron-record-btn-${word.id}`}
                className="btn btn-mustard"
                onClick={startRecording}
              >
                <Mic size={16} />
                {audioUrl ? 'Record Again' : 'Record Your Voice'}
              </button>
            ) : (
              <button
                type="button"
                id={`pron-stop-btn-${word.id}`}
                className="btn btn-primary"
                onClick={stopRecording}
                style={{ background: 'var(--accent-clay)' }}
              >
                <Square size={15} />
                Stop Recording
              </button>
            )}

            {audioUrl && !isRecording && (
              <>
                <button type="button" className="btn btn-secondary" onClick={playUserRecording}>
                  <Play size={15} />
                  My Recording
                </button>
                <button
                  type="button"
                  id={`pron-compare-btn-${word.id}`}
                  className="btn btn-sage"
                  onClick={handleCompareSideBySide}
                >
                  <Headphones size={15} />
                  Compare (Reference → Mine)
                </button>
              </>
            )}
          </div>

          {isRecording && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-clay-ink)', fontSize: '0.85rem', fontWeight: 600 }}>
              <span className="waveform-bars">
                <span className="waveform-bar" />
                <span className="waveform-bar" />
                <span className="waveform-bar" />
                <span className="waveform-bar" />
                <span className="waveform-bar" />
              </span>
              Say "{word.word}" clearly...
            </span>
          )}
        </div>

        {spokenTranscript && (
          <div className="tag tag-sage" style={{ alignSelf: 'flex-start', padding: '0.35rem 0.75rem' }}>
            Heard: "{spokenTranscript}"
          </div>
        )}

        {recordingMessage && (
          <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)' }}>{recordingMessage}</p>
        )}
      </div>

      {/* Step 4: Self-Review & Next */}
      <div
        style={{
          marginTop: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
            How did your stress sound?
          </span>
          <button
            type="button"
            className={`btn btn-sm ${selfAssessed === 'retry' ? 'btn-mustard' : 'btn-secondary'}`}
            onClick={() => {
              setSelfAssessed('retry');
              onCompletedPractice?.(word.id, false);
            }}
          >
            <RefreshCw size={14} />
            Needs practice
          </button>
          <button
            type="button"
            className={`btn btn-sm ${selfAssessed === 'confident' ? 'btn-sage' : 'btn-secondary'}`}
            onClick={() => {
              setSelfAssessed('confident');
              onCompletedPractice?.(word.id, true);
            }}
          >
            <CheckCircle2 size={14} />
            Sounds clear
          </button>
        </div>

        {onNext && (
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Continue →
          </button>
        )}
      </div>
    </article>
  );
};
