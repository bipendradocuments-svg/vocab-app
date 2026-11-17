import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { VocabWord, WordCategory } from '../types/vocab';

interface AddWordModalProps {
  onClose: () => void;
  onAddWord: (word: VocabWord) => void;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({ onClose, onAddWord }) => {
  const [wordText, setWordText] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('adjective');
  const [category, setCategory] = useState<WordCategory>('vocabulary');
  const [pronunciation, setPronunciation] = useState('');
  const [meaning, setMeaning] = useState('');
  const [hindiMeaning, setHindiMeaning] = useState('');
  const [memoryAssociation, setMemoryAssociation] = useState('');
  const [example, setExample] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordText.trim() || !meaning.trim()) return;

    const cleanWord = wordText.trim();
    const id = `custom-${cleanWord.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const syllables = pronunciation
      ? pronunciation.split(/[-\s]+/).filter(Boolean)
      : [cleanWord.toLowerCase()];

    const newEntry: VocabWord = {
      id,
      word: cleanWord,
      partOfSpeech,
      category,
      badge: 'Personal Entry',
      pronunciation: pronunciation.trim() || cleanWord,
      ipa: `/${cleanWord.toLowerCase()}/`,
      syllables,
      stressedSyllableIndex: 0,
      pronunciationTip: 'Listen carefully and practise saying it naturally in your example sentence.',
      meaning: meaning.trim(),
      hindiMeaning: hindiMeaning.trim() || 'व्यक्तिगत शब्द-संग्रह प्रविष्टि',
      memoryAssociation:
        memoryAssociation.trim() || `Connect "${cleanWord}" to a real person or moment from your week.`,
      motifKey: 'open-notebook',
      synonyms: ['related expression'],
      antonyms: ['opposite sense'],
      examples: [
        example.trim() || `I learned the word "${cleanWord}" today and used it in conversation.`,
      ],
      quiz: {
        question: `What does "${cleanWord}" mean?`,
        options: [
          meaning.trim(),
          'To postpone a meeting indefinitely.',
          'Speaking much too quietly to be heard.',
          'Travelling without a fixed destination.',
        ],
        correctIndex: 0,
        explanation: `"${cleanWord}" means: ${meaning.trim()}`,
      },
      isCustom: true,
    };

    onAddWord(newEntry);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-word-modal-title">
      <div className="modal-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span className="eyebrow-label">Personal Notebook</span>
            <h2 id="add-word-modal-title" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Add a New Word or Phrase
            </h2>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: '0.65rem' }}>
            <div className="form-field">
              <label className="form-label" htmlFor="input-word">
                Word / Phrase *
              </label>
              <input
                id="input-word"
                required
                className="form-input"
                placeholder="e.g. Articulate"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="input-pos">
                Part of speech
              </label>
              <select
                id="input-pos"
                className="form-input"
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
              >
                <option value="noun">noun</option>
                <option value="verb">verb</option>
                <option value="adjective">adjective</option>
                <option value="adverb">adverb</option>
                <option value="phrase">phrase</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="input-cat">
                Notebook shelf
              </label>
              <select
                id="input-cat"
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as WordCategory)}
              >
                <option value="vocabulary">Vocabulary</option>
                <option value="pronunciation">Pronunciation</option>
                <option value="confusing">Confusing words</option>
                <option value="phrases">Phrases</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="input-pron">
              Phonetic Syllables (use hyphens, e.g. ar-TIK-yuh-luht)
            </label>
            <input
              id="input-pron"
              className="form-input"
              placeholder="ar-TIK-yuh-luht"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="input-meaning">
              Simple English Meaning *
            </label>
            <input
              id="input-meaning"
              required
              className="form-input"
              placeholder="Able to express thoughts clearly and fluently."
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="input-hindi">
              Hindi Meaning · हिंदी अर्थ
            </label>
            <input
              id="input-hindi"
              className="form-input hindi-text"
              placeholder="स्पष्ट और प्रभावशाली ढंग से बात कहने वाला"
              value={hindiMeaning}
              onChange={(e) => setHindiMeaning(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="input-assoc">
              Memory Association / Visual Clue
            </label>
            <input
              id="input-assoc"
              className="form-input"
              placeholder="Think of your favourite podcast host explaining a tricky topic effortlessly."
              value={memoryAssociation}
              onChange={(e) => setMemoryAssociation(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="input-example">
              Everyday Example Sentence
            </label>
            <input
              id="input-example"
              className="form-input"
              placeholder="She gave a remarkably articulate summary of our user research."
              value={example}
              onChange={(e) => setExample(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.4rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="submit-custom-word-btn" className="btn btn-primary">
              Save to My Words
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
