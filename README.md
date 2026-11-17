# WordUp — Learn, Remember & Speak

A calm, personal English-learning web application (PWA) combining active-recall vocabulary cards, Hindi meanings, syllable pronunciation & voice comparison, confusing word pairs, context quizzes, and natural workplace/everyday conversations.

## Highlights

- **Six Specialized Learning Cards** (instead of one repetitive flashcard format):
  1. **Vocabulary Learning Card** — Flip-to-reveal active recall, phonetic + IPA audio (normal & slow speed), simple English meaning, Hindi translation (`हिंदी अर्थ`), editorial memory illustration, synonyms/antonyms, everyday examples, and *Easy / Difficult* rating.
  2. **Pronunciation Practice Card** — Interactive `Listen → Repeat → Record → Review` flow with clickable syllable breakdown, stressed syllable highlighting, microphone recording (`MediaRecorder` + IndexedDB), and side-by-side reference comparison.
  3. **Confusing Words Comparison Card** — Side-by-side English + Hindi comparison tables (*Lose vs Loose vs Loss*, *Affect vs Effect*, *Compliment vs Complement*, *Advice vs Advise*), memory rules, and fill-in-the-blank exercises.
  4. **Context-Based Quiz Card** — Sentence-usage multiple-choice questions (*"Which sentence uses Mitigate correctly?"*) with grammatical explanations, plus interactive word-to-meaning matching.
  5. **Real-Life Conversation Card** — Multi-speaker audio dialogues (*Flattered*, *Mitigate*, *On the same page*, *Candid*, *Pragmatic*), register guidance, Hindi nuance, and conversation-completion challenges.
  6. **Memory & Revision Card** — Spaced-repetition active recall (*Forgot · Difficult · Remembered*) with automatic interval scheduling.
- **Guided Daily 5-Word Session**: *Discover → Understand → Practise → Speak → Remember*.
- **Personal Vocabulary Notebook (`My Words`)**: Search across English & Hindi, filter across all 7 shelves (*All words, Pronunciation, Vocabulary, Confusing words, Phrases, Difficult words, Mastered words*), and add custom personal words.
- **Local-First Architecture**: React + TypeScript + Vanilla CSS design system, structured local JSON vocabulary (`src/data/vocabulary.json`), and browser `LocalStorage` + `IndexedDB` persistence.

## Running Locally

```bash
npm install
npm run dev
```
