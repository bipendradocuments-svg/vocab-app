// Browser Text-to-Speech & Voice Recording utilities for WordUp

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  accent?: 'en-IN' | 'en-GB' | 'en-US';
  onStart?: () => void;
  onEnd?: () => void;
}

export function speakEnglish(text: string, options: SpeakOptions = {}): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onStart?.();
    setTimeout(() => options.onEnd?.(), 600);
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const preferredLang = options.accent || 'en-GB';
    utterance.lang = preferredLang;
    utterance.rate = options.rate ?? 0.94;
    utterance.pitch = options.pitch ?? 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const exactMatch =
        voices.find((v) => v.lang === preferredLang && v.localService) ||
        voices.find((v) => v.lang === preferredLang) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (exactMatch) {
        utterance.voice = exactMatch;
      }
    }

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        options.onEnd?.();
      }
    };

    utterance.onstart = () => options.onStart?.();
    utterance.onend = finish;
    utterance.onerror = finish;

    options.onStart?.();
    window.speechSynthesis.speak(utterance);

    // Fallback safety timer in case browser TTS queue hangs in silent environments
    setTimeout(finish, Math.max(1600, text.length * 95));
  } catch {
    options.onStart?.();
    setTimeout(() => options.onEnd?.(), 700);
  }
}

export function playDialogueSequence(
  lines: { text: string; speaker: 'A' | 'B' }[],
  accent: 'en-IN' | 'en-GB' | 'en-US',
  onActiveIndex: (idx: number | null) => void
): () => void {
  let cancelled = false;

  const playIndex = (idx: number) => {
    if (cancelled || idx >= lines.length) {
      onActiveIndex(null);
      return;
    }
    onActiveIndex(idx);
    const item = lines[idx];
    speakEnglish(item.text, {
      accent,
      rate: 0.95,
      pitch: item.speaker === 'A' ? 0.96 : 1.08,
      onEnd: () => {
        if (!cancelled) {
          setTimeout(() => playIndex(idx + 1), 280);
        }
      },
    });
  };

  playIndex(0);

  return () => {
    cancelled = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onActiveIndex(null);
  };
}
