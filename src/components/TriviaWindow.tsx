import React, { useState } from 'react';
import type { AssistantChar } from '../types';
import { playTone, playXpSuccess } from '../audio';

interface Props {
  assistantChar: AssistantChar;
  soundEnabled: boolean;
  setGitkoMsg: (msg: string) => void;
}

interface Question {
  q: string;
  options: string[];
  answer: number;
  exp: string;
}

const questions: Question[] = [
  {
    q: 'Koja komanda inicijalizuje novi Git repozitorijum?',
    options: ['git start', 'git init', 'git create', 'git new'],
    answer: 1,
    exp: "Komanda 'git init' stvara prazan .git direktorijum i započinje praćenje istorije projekta.",
  },
  {
    q: "Šta tačno radi 'git add <fajl>'?",
    options: [
      'Snima promene u trajnu istoriju.',
      'Briše neželjene fajlove sa diska.',
      'Prebacuje promene u pripremnu zonu (staging area).',
      'Šalje kod na GitHub.',
    ],
    answer: 2,
    exp: 'Pripremna zona (index ili staging area) služi za biranje izmena koje će ući u sledeći commit.',
  },
  {
    q: 'Koja je glavna razlika između git merge i git rebase?',
    options: [
      'Merge pravi novi merge commit i čuva originalnu istoriju, dok rebase prepisuje istoriju praveći je linearnom.',
      'Merge briše fajlove, a rebase ih čuva.',
      'Rebase radi samo na serveru, a merge samo lokalno.',
      'Nema nikakve razlike.',
    ],
    answer: 0,
    exp: 'Merge pravi dodatni commit koji spaja dve grane. Rebase pomera bazu grane na vrh druge, prepisujući istoriju.',
  },
  {
    q: 'Čemu služi komanda git stash?',
    options: [
      'Za trajno brisanje grana.',
      'Za privremeno sklanjanje lokalnih izmena kako bismo dobili čisto radno stablo.',
      'Za preuzimanje koda sa servera.',
      'Za preimenovanje fajlova.',
    ],
    answer: 1,
    exp: 'Stash sklanja modifikovane fajlove na stek i vraća čisto stablo, što omogućava brzu promenu grana.',
  },
  {
    q: 'Kako možemo bezbedno izmeniti poruku poslednjeg commit-a?',
    options: [
      'git commit --change',
      'git commit --amend -m "Nova poruka"',
      'git commit --reset',
      'git rewrite',
    ],
    answer: 1,
    exp: '--amend prepravlja poslednji commit, dodajući mu trenutne pripremljene izmene i novu poruku.',
  },
  {
    q: 'Šta se dešava kada uradite git fetch?',
    options: [
      'Preuzimaju se novi commit-i sa servera, ali se ne spajaju sa vašim lokalnim radom.',
      'Vaš kod se automatski šalje na server.',
      'Briše se ceo repozitorijum.',
      'Spajaju se grane.',
    ],
    answer: 0,
    exp: 'Fetch preuzima metapodatke i commit-e sa servera u origin/master, ali ih ne spaja u vaš lokalni master.',
  },
  {
    q: 'Koja komanda se koristi za kreiranje i prelazak na novu granu u jednom koraku?',
    options: [
      'git checkout -b <ime>',
      'git branch -c <ime>',
      'git switch -new <ime>',
      'git new-branch <ime>',
    ],
    answer: 0,
    exp: 'git checkout -b kreira novu granu i odmah preusmerava vaš HEAD pokazivač na nju.',
  },
  {
    q: 'Čemu služi dnevnik git reflog?',
    options: [
      'Prikazuje listu fajlova u pripremnoj zoni.',
      'Beleži svako kretanje HEAD pokazivača, omogućavajući pronalaženje naizgled obrisanih commit-ova.',
      'Koristi se za komunikaciju sa kolegama na projektu.',
      'Prikazuje statistiku linija koda.',
    ],
    answer: 1,
    exp: 'Reflog beleži apsolutno svaku akciju (commit, checkout, reset). Ako izgubite commit, tamo ćete naći heš.',
  },
  {
    q: 'Šta radi git bisect?',
    options: [
      'Spaja dve grane odjednom.',
      'Koristi binarnu pretragu kroz istoriju commit-ova da brzo locira commit koji je uveo bag.',
      'Klonira dva repozitorijuma paralelno.',
      'Briše pola commit-ova iz istorije.',
    ],
    answer: 1,
    exp: 'Bisect sprovodi binarnu pretragu između dobrog i lošeg commit-a kako bi se locirao krivac za bag.',
  },
];

const correctMessages: Record<AssistantChar, string> = {
  doge:  'Vau! Mnogo tačno, vrlo pametno, vau! Klasa Git stručnjaka!',
  snake: 'Izvanredan rad na terenu! Tvoj Git IQ je na nivou elitnih specijalaca.',
  bonzi: 'Apsolutno fantastično! Tvoj odgovor je magično tačan! 🍌',
};

const incorrectMessages: Record<AssistantChar, string> = {
  doge:  'O ne! Vrlo netačno, mnogo greška, tužni doge. Pokušaj opet!',
  snake: 'Snake? Snake?! SNAAAAAKE! Nije tačno! Koncentriši se, neprijatelj te posmatra!',
  bonzi: 'Ups! Moje banane kažu da to nije tačan odgovor! Više sreće u sledećem koraku.',
};

export const TriviaWindow: React.FC<Props> = ({ assistantChar, soundEnabled, setGitkoMsg }) => {
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQ = questions[triviaIndex];

  const handleAnswer = (idx: number) => {
    setSelectedOption(idx);
    setShowFeedback(true);
    const isCorrect = idx === currentQ.answer;

    if (isCorrect) {
      setScore(s => s + 1);
      if (soundEnabled) playTone(783.99, 0, 0.3, 'sine', 0.12);
      setGitkoMsg(correctMessages[assistantChar]);
    } else {
      if (soundEnabled) playTone(150, 0, 0.4, 'sawtooth', 0.15);
      setGitkoMsg(incorrectMessages[assistantChar]);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    if (triviaIndex < questions.length - 1) {
      setTriviaIndex(i => i + 1);
    } else {
      setFinished(true);
      if (soundEnabled) playXpSuccess();
    }
  };

  const reset = () => {
    setTriviaIndex(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div style={{ padding: 20, textAlign: 'center', height: '100%', overflowY: 'auto' }}>
        <div style={{ fontSize: 48, marginBottom: 15 }}>🏆</div>
        <h3 style={{ color: '#002e80', marginBottom: 10 }}>Kviz završen!</h3>
        <p style={{ fontSize: 15, marginBottom: 20 }}>
          Tvoj rezultat je <strong>{score}</strong> od <strong>{questions.length}</strong> poena!
        </p>
        <div className="xp-level-box" style={{ marginBottom: 20, display: 'inline-block', maxWidth: 350 }}>
          {score === questions.length ? (
            <span>🚀 Perfektan rezultat! Pravi si Git General.</span>
          ) : score >= 6 ? (
            <span>👍 Odlično znanje! Skoro sve ti je kristalno jasno.</span>
          ) : (
            <span>⚠️ Nije loše, ali pročitaj uputstva još jednom i pokušaj ponovo.</span>
          )}
        </div>
        <div>
          <button className="xp-button xp-button-primary" onClick={reset}>Igraj ponovo</button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 15,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 10,
          fontSize: 11,
          color: '#666',
          borderBottom: '1px solid #d4d0c8',
          paddingBottom: 5,
        }}
      >
        <span>Pitanje {triviaIndex + 1} od {questions.length}</span>
        <span>Rezultat: {score} tačnih</span>
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#002e80',
          marginBottom: 15,
          minHeight: 40,
        }}
      >
        {currentQ.q}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 15 }}>
        {currentQ.options.map((opt, idx) => (
          <button
            key={idx}
            className="xp-button"
            disabled={selectedOption !== null}
            onClick={() => handleAnswer(idx)}
            style={{
              padding: 10,
              textAlign: 'left',
              fontSize: 12,
              backgroundColor:
                selectedOption !== null && idx === currentQ.answer
                  ? '#10b981'
                  : selectedOption === idx
                  ? '#f87171'
                  : '',
              color:
                selectedOption !== null && (idx === currentQ.answer || idx === selectedOption)
                  ? '#fff'
                  : '#000',
              transition: 'all 0.1s ease',
            }}
          >
            <strong>{String.fromCharCode(65 + idx)})</strong> {opt}
          </button>
        ))}
      </div>

      {showFeedback && (
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            className="xp-level-box"
            style={{
              fontSize: 11,
              borderLeftColor: selectedOption === currentQ.answer ? '#10b981' : '#f87171',
            }}
          >
            <strong>💡 Objašnjenje:</strong> {currentQ.exp}
          </div>
          <button
            className="xp-button xp-button-primary"
            onClick={handleNext}
            style={{ alignSelf: 'flex-end' }}
          >
            {triviaIndex < questions.length - 1 ? 'Sledeće pitanje ➡️' : 'Završi kviz 🏁'}
          </button>
        </div>
      )}
    </div>
  );
};
