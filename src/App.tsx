import React, { useState, useEffect, useRef } from 'react';
import { executeGitCommand, type RepoState } from './gitEngine';
import { levels, type Level } from './levelsData';
import { GitGraph } from './GitGraph';
import './LunaTheme.css';

// Interfejs za prozore na desktopu
interface WindowState {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  active: boolean;
}

// Zvukovi za retro ugođaj sintetisani u realnom vremenu (Web Audio API)
const playTone = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (e) {
    console.error("Audio Context nije podržan ili je blokiran: ", e);
  }
};

const playXpStartup = () => {
  const now = 0;
  // Legendarna harmonija: Eb -> Ab -> Eb
  playTone(311.13, now, 2.0, 'sine', 0.12); // Eb4
  playTone(392.00, now + 0.12, 1.8, 'sine', 0.12); // G4
  playTone(466.16, now + 0.24, 1.6, 'sine', 0.12); // Bb4
  playTone(622.25, now + 0.36, 1.4, 'sine', 0.12); // Eb5
  playTone(783.99, now + 0.48, 1.2, 'sine', 0.12); // G5
  playTone(932.33, now + 0.64, 0.9, 'sine', 0.12); // Bb5
};

const playXpError = () => {
  playTone(150, 0, 0.25, 'sawtooth', 0.15);
};

const playXpSuccess = () => {
  const now = 0;
  playTone(523.25, now, 0.3, 'triangle', 0.12); // C5
  playTone(659.25, now + 0.08, 0.3, 'triangle', 0.12); // E5
  playTone(783.99, now + 0.16, 0.3, 'triangle', 0.12); // G5
  playTone(1046.50, now + 0.24, 0.7, 'triangle', 0.12); // C6
};

const parseMarkdownToHtml = (markdown: string): string => {
  const lines = markdown.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();

    // H1, H2, H3
    if (trimmed.startsWith('### ')) {
      return `<h3 style="font-size: 14px; color: #002e80; margin: 15px 0 8px 0; font-weight: bold; border-bottom: 1px solid #d3e5fa; padding-bottom: 3px; font-family: 'Tahoma', sans-serif;">${trimmed.substring(4)}</h3>`;
    }
    if (trimmed.startsWith('## ')) {
      return `<h2 style="font-size: 16px; color: #002e80; margin: 18px 0 10px 0; font-weight: bold; font-family: 'Tahoma', sans-serif;">${trimmed.substring(3)}</h2>`;
    }
    if (trimmed.startsWith('# ')) {
      return `<h1 style="font-size: 18px; color: #002e80; margin: 20px 0 12px 0; font-weight: bold; font-family: 'Tahoma', sans-serif;">${trimmed.substring(2)}</h1>`;
    }

    // Bullet points: * Item or - Item
    const bulletMatch = trimmed.match(/^[\*\-]\s+(.*)/);
    if (bulletMatch) {
      return `<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: disc; font-size: 13px; line-height: 1.5; color: #333;">${bulletMatch[1]}</li>`;
    }

    // Numbered lists: 1. Item
    const numberMatch = trimmed.match(/^\d+\.\s+(.*)/);
    if (numberMatch) {
      return `<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: decimal; font-size: 13px; line-height: 1.5; color: #333;">${numberMatch[1]}</li>`;
    }

    // Empty line
    if (trimmed === '') {
      return '<div style="height: 8px;"></div>';
    }

    // Normal paragraph line
    return `<p style="margin-bottom: 8px; line-height: 1.5; font-size: 13px; color: #333;">${line}</p>`;
  });

  let html = processedLines.join('\n');

  // Replace inline bold **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: bold; color: #002e80;">$1</strong>');

  // Replace inline italic *italic*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Replace inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code style="background-color: #f0f3fd; border: 1px solid #d3e2f9; border-radius: 3px; padding: 1.5px 5px; font-family: monospace; font-size: 12px; color: #c7254e; font-weight: bold;">$1</code>');

  return html;
};

export const App: React.FC = () => {
  // Inicijalni nivo i dovršeni nivoi sačuvani u localStorage
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(() => {
    const saved = localStorage.getItem('luna_git_current_level');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    const saved = localStorage.getItem('luna_git_completed');
    return saved ? JSON.parse(saved) : [];
  });

  const currentLevel: Level = levels[currentLevelIdx] || levels[0];

  // Git stanje
  const [repoState, setRepoState] = useState<RepoState>(() => currentLevel.initialState);
  const [terminalHistory, setTerminalHistory] = useState<{ input?: string; output: string; isError?: boolean }[]>([]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [levelCommandsRun, setLevelCommandsRun] = useState<string[]>([]);

  // Prozor stanja
  const [windows, setWindows] = useState<WindowState[]>([
    {
      id: 'instructions',
      title: 'Uputstvo za učenje',
      icon: '📖',
      x: 30,
      y: 40,
      w: 480,
      h: 520,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      active: true
    },
    {
      id: 'terminal',
      title: 'Komandna linija (Terminal)',
      icon: '💻',
      x: 540,
      y: 40,
      w: 520,
      h: 250,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      active: false
    },
    {
      id: 'graph',
      title: 'Vizuelni Git Graf',
      icon: '📊',
      x: 540,
      y: 310,
      w: 520,
      h: 250,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      active: false
    },
    {
      id: 'credits',
      title: 'Zasluge i O Autoru',
      icon: 'ℹ️',
      x: 200,
      y: 100,
      w: 450,
      h: 380,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      active: false
    }
  ]);

  // Start meni, BSOD, zvučni signali, Solitaire slavlje
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [showBSOD, setShowBSOD] = useState(false);
  const [showSolitaire, setShowSolitaire] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeStr, setTimeStr] = useState('');

  // Gitko pomoćnik
  const [gitkoMsg, setGitkoMsg] = useState<string>(
    'Zdravo! Ja sam Gitko. Pokreni učenje klikom na "Pokreni program" u Start meniju ili osmotri prečice na radnoj površini!'
  );
  const [showLevelSuccessModal, setShowLevelSuccessModal] = useState(false);

  // Refovi za drag i scroll
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<{ winId: string; startX: number; startY: number; winX: number; winY: number } | null>(null);
  const solitaireCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sat u taskbaru
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      let hrs = d.getHours().toString().padStart(2, '0');
      let mins = d.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sviraj XP Startup zvuk na početku
  useEffect(() => {
    if (soundEnabled) {
      setTimeout(() => {
        playXpStartup();
      }, 800);
    }
  }, []);

  // Postavljanje početnog stanja kada se nivo promeni
  useEffect(() => {
    setRepoState(currentLevel.initialState);
    setTerminalHistory([
      {
        output: `Dobrodošli na Nivo ${currentLevel.id}: ${currentLevel.title}\nUkucajte 'git help' da vidite podržane komande.`
      }
    ]);
    setTerminalInput('');
    setLevelCommandsRun([]);
    setGitkoMsg(`Nivo ${currentLevel.id}: ${currentLevel.title}. Pročitaj uputstvo levo i unesi prvu komandu u terminal!`);
    localStorage.setItem('luna_git_current_level', currentLevelIdx.toString());
  }, [currentLevelIdx]);

  // Automatsko skrolovanje terminala na dno
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Fokusiranje prozora
  const focusWindow = (id: string) => {
    setWindows(prev =>
      prev.map(w => ({
        ...w,
        active: w.id === id,
        isMinimized: w.id === id ? false : w.isMinimized
      }))
    );
    setIsStartOpen(false);
  };

  // Otvaranje/zatvaranje prozora
  const toggleWindow = (id: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          const nextOpen = !w.isOpen;
          return {
            ...w,
            isOpen: nextOpen,
            isMinimized: false,
            active: nextOpen
          };
        }
        return { ...w, active: false };
      })
    );
    setIsStartOpen(false);
  };

  const closeWindow = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isOpen: false } : w))
    );
  };

  const minimizeWindow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: true, active: false } : w))
    );
  };

  const maximizeWindow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  // Drag and Drop logika za prozore
  const handleTitleBarMouseDown = (id: string, e: React.MouseEvent) => {
    const win = windows.find(w => w.id === id);
    if (!win || win.isMaximized) return;

    focusWindow(id);
    dragInfo.current = {
      winId: id,
      startX: e.clientX,
      startY: e.clientY,
      winX: win.x,
      winY: win.y
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current) return;
    const info = dragInfo.current;
    const dx = e.clientX - info.startX;
    const dy = e.clientY - info.startY;

    setWindows(prev =>
      prev.map(w =>
        w.id === info.winId
          ? {
            ...w,
            x: Math.max(0, Math.min(window.innerWidth - 100, info.winX + dx)),
            y: Math.max(0, Math.min(window.innerHeight - 80, info.winY + dy))
          }
          : w
      )
    );
  };

  const handleGlobalMouseUp = () => {
    dragInfo.current = null;
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  // Izvršavanje unete git komande
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    // Dodaj unos u istoriju
    const currentHist = [...terminalHistory, { input: cmd, output: '' }];

    // Izvrši komandu nad trenutnim repoState-om
    const result = executeGitCommand(repoState, cmd);

    if (result.error) {
      if (soundEnabled) playXpError();
      setGitkoMsg(`Oops! Komanda '${cmd}' je prijavila grešku. Pogledaj ispis u terminalu ili klikni na 'Pomoć' na radnoj površini!`);
      currentHist[currentHist.length - 1].output = result.output;
      currentHist[currentHist.length - 1].isError = true;
      setTerminalHistory(currentHist);
    } else {
      setRepoState(result.newState);
      currentHist[currentHist.length - 1].output = result.output;
      setTerminalHistory(currentHist);

      // Prati uspešno izvršenu komandu ako počinje sa "git"
      const parts = cmd.toLowerCase().trim().split(/\s+/);
      const gitCmd = parts[0];
      const subCmd = parts[1];
      
      let updatedCommandsRun = levelCommandsRun;
      if (gitCmd === 'git' && subCmd) {
        const fullCmd = `git ${subCmd}`;
        if (!levelCommandsRun.includes(fullCmd)) {
          updatedCommandsRun = [...levelCommandsRun, fullCmd];
          setLevelCommandsRun(updatedCommandsRun);
        }
      }

      // Provera validacije nivoa
      const solved = currentLevel.validate(result.newState);

      // Provera da li su sve očekivane komande izvršene
      const allExpectedRun = currentLevel.expectedCommands.every(cmdName => {
        const cleanedExpected = cmdName.toLowerCase().trim();
        // Podrži 'git switch' kao ekvivalent za 'git checkout'
        if (cleanedExpected === 'git checkout') {
          return updatedCommandsRun.includes('git checkout') || updatedCommandsRun.includes('git switch');
        }
        return updatedCommandsRun.includes(cleanedExpected);
      });

      if (solved && allExpectedRun) {
        if (soundEnabled) playXpSuccess();
        setGitkoMsg('Fenomenalno! Uspešno si rešio sve zadatke na ovom nivou! Pogledaj sledeći korak.');

        // Dodaj u rešene
        const nextCompleted = Array.from(new Set([...completedLevels, currentLevel.id]));
        setCompletedLevels(nextCompleted);
        localStorage.setItem('luna_git_completed', JSON.stringify(nextCompleted));

        // Prikaži uspeh modal
        setShowLevelSuccessModal(true);
      } else if (solved && !allExpectedRun) {
        // Pronađi koje očekivane komande fale
        const missingCmds = currentLevel.expectedCommands.filter(cmdName => {
          const cleaned = cmdName.toLowerCase().trim();
          if (cleaned === 'git checkout') {
            return !updatedCommandsRun.includes('git checkout') && !updatedCommandsRun.includes('git switch');
          }
          return !updatedCommandsRun.includes(cleaned);
        });
        setGitkoMsg(`Skoro je gotovo! Uspešno ste podesili repozitorijum, ali da biste zaista savladali nivo, morate isprobati i preostale komande u uputstvu: ${missingCmds.join(', ')}!`);
      } else {
        setGitkoMsg('Dobar korak! Nastavi dalje da pratiš uputstva kako bi rešio nivo.');
      }
    }

    setTerminalInput('');
  };

  // Prelazak na sledeći nivo
  const handleNextLevel = () => {
    setShowLevelSuccessModal(false);
    if (currentLevelIdx < levels.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
    } else {
      // Svi nivoi su uspešno završeni!
      setShowSolitaire(true);
      setGitkoMsg('ČESTITAMO! Uspešno si prošao kompletnu obuku za Git na srpskoj latinici u Luna Git platformi!');
    }
  };

  // Solitaire Bounce čestitka
  useEffect(() => {
    if (!showSolitaire || !solitaireCanvasRef.current) return;
    const canvas = solitaireCanvasRef.current;
    const ctx = canvas.getContext('2d')!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animId: number;

    interface Card {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      title: string;
    }

    const activeCards: Card[] = [];
    const colors = ['#245ddb', '#3c9d3c', '#c43c16', '#ff8c00', '#8a2be2'];
    const gitTerms = ['GIT', 'COMMIT', 'BRANCH', 'MERGE', 'PUSH', 'PULL', 'REBASE', 'CLONE'];

    const spawnCard = () => {
      activeCards.push({
        x: Math.random() * (canvas.width - 100) + 50,
        y: 50,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        title: gitTerms[Math.floor(Math.random() * gitTerms.length)]
      });
    };

    spawnCard();
    let spawnTimer = 0;

    const drawCard = (c: Card) => {
      // Nacrtaj retro karticu
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(c.x + 3, c.y + 3, 90, 130);

      // Card Body
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.x, c.y, 90, 130);
      ctx.strokeRect(c.x, c.y, 90, 130);

      // Card Header Banner
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x + 1, c.y + 1, 88, 25);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Tahoma, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(c.title, c.x + 45, c.y + 18);

      // Card Center Icon
      ctx.font = '28px Arial';
      ctx.fillText('🌿', c.x + 45, c.y + 80);

      // Mini label bottom right
      ctx.fillStyle = c.color;
      ctx.font = '9px monospace';
      ctx.fillText('v1.0', c.x + 75, c.y + 120);
    };

    const update = () => {
      spawnTimer++;
      if (spawnTimer % 22 === 0 && activeCards.length < 32) {
        spawnCard();
      }

      activeCards.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.25; // gravity

        // Bounce off left/right
        if (c.x < 0 || c.x > canvas.width - 90) {
          c.vx = -c.vx * 0.9;
          c.x = c.x < 0 ? 0 : canvas.width - 90;
        }

        // Bounce off bottom with dissipation
        if (c.y > canvas.height - 130) {
          c.vy = -c.vy * 0.85;
          c.y = canvas.height - 130;
          if (Math.abs(c.vy) < 1.5) {
            // Respawn card if it settles
            c.y = 50;
            c.x = Math.random() * (canvas.width - 100) + 50;
            c.vx = (Math.random() - 0.5) * 8;
            c.vy = Math.random() * 4 + 2;
          }
        }

        drawCard(c);
      });

      animId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [showSolitaire]);

  // Restartovanje celokupnog napretka
  const resetAllProgress = () => {
    if (window.confirm("Da li ste sigurni da želite da obrišete kompletan napredak u učenju?")) {
      localStorage.removeItem('luna_git_current_level');
      localStorage.removeItem('luna_git_completed');
      setCompletedLevels([]);
      setCurrentLevelIdx(0);
      setShowSolitaire(false);
      setIsStartOpen(false);
      setWindows(prev => prev.map(w => w.id === 'instructions' || w.id === 'terminal' || w.id === 'graph' ? { ...w, isOpen: true } : w));
    }
  };

  return (
    <div className="xp-desktop">
      {/* BSOD Plavi ekran smrti (Easter Egg) */}
      {showBSOD && (
        <div className="xp-bsod">
          <div className="xp-bsod-header">LUNA_GIT_SYSTEM_FAILURE</div>
          <p>Došlo je do neočekivane greške u sistemu tokom emulacije Git komandi.</p>
          <p>Ukoliko vidite ovaj ekran po prvi put, opustite se i restartujte računar. Ako se problem ponovi, proverite da li ste pravilno savladali razliku između `git merge` i `git rebase` po predavanjima prof. dr Igora Dejanovića.</p>
          <p>Tehničke informacije:</p>
          <p>*** STOP: 0x000000D1 (0x0000000C, 0x00000002, 0x00000000, 0xF86B5A89)<br />*** luna_git_engine.sys - Address F86B5A89 base at F86B0000, DateStamp 36b072a3</p>
          <p>Kliknite na dugme ispod za brzi restart operativnog sistema:</p>
          <button
            className="xp-bsod-btn"
            onClick={() => {
              setShowBSOD(false);
              playXpStartup();
            }}
          >
            Restartuj računar (Reboot)
          </button>
        </div>
      )}

      {/* Solitaire card win canvas */}
      {showSolitaire && (
        <div className="solitaire-container">
          <canvas ref={solitaireCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 225, 0.95)',
            border: '2px solid #245ddb',
            borderRadius: '6px',
            padding: '30px',
            textAlign: 'center',
            boxShadow: '10px 10px 30px rgba(0,0,0,0.5)',
            zIndex: 1000,
            maxWidth: '450px'
          }}>
            <h2 style={{ color: '#002e80', fontWeight: 'bold', fontSize: '22px', marginBottom: '15px' }}>🎉 Svaka čast, genije! 🎉</h2>
            <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '20px', color: '#333' }}>
              Završio si svih 10 nivoa na platformi **Luna Git** i uspešno savladao teoriju prof. dr Igora Dejanovića na srpskom jeziku! Sada si spreman za rad na realnim projektima!
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="xp-button xp-button-primary" onClick={() => setShowSolitaire(false)}>Zatvori kaskadu</button>
              <button className="xp-button" onClick={resetAllProgress}>Uči ispočetka</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Icons */}
      <div className="xp-desktop-grid">
        <div className="xp-desktop-icon" onClick={() => toggleWindow('instructions')}>
          <div className="xp-desktop-icon-img" style={{ fontSize: '28px' }}>📝</div>
          <div className="xp-desktop-icon-text">Uputstvo</div>
        </div>

        <div className="xp-desktop-icon" onClick={() => toggleWindow('terminal')}>
          <div className="xp-desktop-icon-img" style={{ fontSize: '28px' }}>💻</div>
          <div className="xp-desktop-icon-text">Git Terminal</div>
        </div>

        <div className="xp-desktop-icon" onClick={() => toggleWindow('graph')}>
          <div className="xp-desktop-icon-img" style={{ fontSize: '28px' }}>📊</div>
          <div className="xp-desktop-icon-text">Git Graf</div>
        </div>

        <div className="xp-desktop-icon" onClick={() => toggleWindow('credits')}>
          <div className="xp-desktop-icon-img" style={{ fontSize: '28px' }}>ℹ️</div>
          <div className="xp-desktop-icon-text">Credits</div>
        </div>
      </div>

      {/* Aktivni prozori */}
      {windows.map(win => {
        if (!win.isOpen) return null;

        const isFocused = win.active;
        const winStyles: React.CSSProperties = win.isMaximized
          ? {
            top: 0,
            left: 0,
            width: '100vw',
            height: 'calc(100vh - 40px)',
            position: 'absolute'
          }
          : {
            top: win.y,
            left: win.x,
            width: win.w,
            height: win.h,
            position: 'absolute'
          };

        if (win.isMinimized) return null;

        return (
          <div
            key={win.id}
            className={`xp-window ${isFocused ? 'active' : ''}`}
            style={winStyles}
            onClick={() => focusWindow(win.id)}
          >
            {/* Title Bar */}
            <div
              className="xp-window-titlebar"
              onMouseDown={(e) => handleTitleBarMouseDown(win.id, e)}
            >
              <div className="xp-window-title">
                <span className="xp-window-title-icon">{win.icon}</span>
                <span>{win.title}</span>
              </div>
              <div className="xp-window-controls">
                <div className="xp-control-btn xp-btn-minimize" onClick={(e) => minimizeWindow(win.id, e)} />
                <div className="xp-control-btn xp-btn-maximize" onClick={(e) => maximizeWindow(win.id, e)} />
                <div className="xp-control-btn xp-btn-close" onClick={(e) => closeWindow(win.id, e)}>×</div>
              </div>
            </div>

            {/* Window Content */}
            <div className="xp-window-content">

              {/* 1. Terminal Window Content */}
              {win.id === 'terminal' && (
                <div className="xp-terminal" onClick={() => document.getElementById('term-input-field')?.focus()}>
                  <div className="xp-terminal-history">
                    {terminalHistory.map((h, i) => (
                      <div key={i}>
                        {h.input && (
                          <div className="xp-terminal-input-row">
                            <span className="xp-terminal-prompt">luka@luna-xp:~$</span>
                            <span>{h.input}</span>
                          </div>
                        )}
                        <div style={{ color: h.isError ? '#f87171' : '#10b981', whiteSpace: 'pre-wrap', marginTop: '3px' }}>
                          {h.output}
                        </div>
                      </div>
                    ))}
                    <div ref={terminalBottomRef} />
                  </div>
                  <form onSubmit={handleTerminalSubmit} className="xp-terminal-input-row">
                    <span className="xp-terminal-prompt">luka@luna-xp:~$</span>
                    <input
                      id="term-input-field"
                      type="text"
                      className="xp-terminal-input"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      autoComplete="off"
                      autoFocus
                    />
                  </form>
                </div>
              )}

              {/* 2. Instructions Window Content */}
              {win.id === 'instructions' && (
                <div className="xp-level-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666' }}>KATEGORIJA: {currentLevel.category}</span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#245ddb' }}>NIVO {currentLevel.id} od 10</span>
                  </div>

                  <h2 style={{ fontSize: '18px', color: '#002e80', borderBottom: '2px solid #3b68c3', paddingBottom: '5px' }}>
                    {currentLevel.title}
                  </h2>

                  <div
                    style={{ fontSize: '13px', lineHeight: '1.6', margin: '15px 0' }}
                    dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(currentLevel.description) }}
                  />

                  <div className="xp-level-box">
                    <strong>💡 Pomoć i Savet:</strong>
                    <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {currentLevel.hint}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid #d4d0c8' }}>
                    <button
                      className="xp-button"
                      disabled={currentLevelIdx === 0}
                      onClick={() => setCurrentLevelIdx(prev => prev - 1)}
                    >
                      Prethodni nivo
                    </button>
                    <button
                      className="xp-button xp-button-primary"
                      disabled={!(completedLevels.includes(currentLevel.id) || currentLevel.id <= Math.max(...completedLevels, 0))}
                      onClick={() => {
                        if (currentLevelIdx < levels.length - 1) {
                          setCurrentLevelIdx(prev => prev + 1);
                        } else {
                          setShowSolitaire(true);
                        }
                      }}
                    >
                      Sledeći nivo {(completedLevels.includes(currentLevel.id) || currentLevel.id <= Math.max(...completedLevels, 0)) ? '🔓' : '🔒'}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Git Graph Window Content */}
              {win.id === 'graph' && (
                <GitGraph state={repoState} />
              )}

              {/* 4. Credits Window Content */}
              {win.id === 'credits' && (
                <div style={{ padding: '20px', fontSize: '13px', lineHeight: '1.6', height: '100%', overflowY: 'auto' }}>
                  <h2 style={{ color: '#002e80', borderBottom: '2px solid #b0c9ea', paddingBottom: '4px', marginBottom: '12px' }}>
                    O Autoru i Priznanja
                  </h2>
                  <p>
                    <strong>Luna Git</strong> je interaktivna retro platforma za vizuelno i gejmifikovano učenje Git komandi, osmišljena u duhu legendarnog operativnog sistema **Windows XP (Luna plava tema, Y2K stil)**.
                  </p>
                  <p style={{ marginTop: '10px' }}>
                    📚 <strong>Edukativni materijal:</strong><br />
                    Sav teorijski sadržaj, zadaci i metodologija učenja preuzeti su iz javnih predavanja i slajdova **Prof. dr Igora Dejanovića** sa Fakulteta tehničkih nauka u Novom Sadu (kurs Tehnički alati / Git).
                    Sve zasluge za strukturu i kvalitet objašnjenja pripadaju profesoru Dejanoviću. Posetite izvorne materijale na:
                    <a href="https://igordejanovic.net/courses/tech/git/" target="_blank" rel="noreferrer" style={{ color: '#245ddb', marginLeft: '5px', textDecoration: 'underline' }}>igordejanovic.net/courses/tech/git/</a>
                  </p>
                  <p style={{ marginTop: '10px' }}>
                    💡 <strong>Inspiracija za vizuelni koncept:</strong><br />
                    Zahvaljujemo se i fenomenalnom projektu **Learn Git Branching** (learngitbranching.js.org) koji je poslužio kao glavna inspiracija za učenje Git-a putem interaktivnog grafičkog stabla na komandnoj liniji.
                  </p>
                  <p style={{ marginTop: '10px', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                    Projekat je kreiran od strane<a href="https://github.com/RileDev" target="_blank" rel="noreferrer" style={{ color: '#245ddb', marginLeft: '5px', textDecoration: 'underline' }}>github.com/RileDev</a> uz pomoc Antigravity alata.
                  </p>
                </div>
              )}

            </div>
          </div>
        );
      })}

      {/* Clippy Assistant: Gitko */}
      <div className="xp-gitko-container">
        {gitkoMsg && (
          <div className="xp-gitko-bubble">
            {gitkoMsg}
          </div>
        )}
        <div
          className="xp-gitko-char"
          onClick={() => {
            setGitkoMsg("Ja sam Gitko! Klikni na ikone na radnoj površini da otvoriš Git Graf ili Uputstvo.");
            if (soundEnabled) playTone(440, 0, 0.15, 'sine');
          }}
        >
          📎
        </div>
      </div>

      {/* Level Success Modal */}
      {showLevelSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="xp-window" style={{ width: '380px', position: 'relative' }}>
            <div className="xp-window-titlebar">
              <div className="xp-window-title">
                <span>🎉 Nivo rešen!</span>
              </div>
              <div className="xp-window-controls">
                <div className="xp-control-btn xp-btn-close" onClick={() => setShowLevelSuccessModal(false)}>×</div>
              </div>
            </div>
            <div className="xp-dialog">
              <div className="xp-dialog-row">
                <div className="xp-dialog-icon" style={{ fontSize: '32px' }}>🏆</div>
                <div>
                  <h4 style={{ fontWeight: 'bold', color: '#002e80' }}>Čestitamo!</h4>
                  <p style={{ marginTop: '5px' }}>Uspešno ste rešili nivo: <strong>{currentLevel.title}</strong>!</p>
                </div>
              </div>
              <div className="xp-dialog-buttons">
                <button className="xp-button xp-button-primary" onClick={handleNextLevel}>
                  Pređi na sledeći nivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Windows XP Taskbar */}
      <div className="xp-taskbar">
        <button
          className="xp-start-btn"
          onClick={() => setIsStartOpen(!isStartOpen)}
        >
          <span style={{ fontSize: '18px' }}>🟢</span>
          <span>start</span>
        </button>

        {/* Aktivne stavke na taskbaru */}
        <div className="xp-taskbar-tasks">
          {windows.map(win => {
            if (!win.isOpen) return null;
            return (
              <div
                key={win.id}
                className={`xp-taskbar-item ${win.active && !win.isMinimized ? 'active' : ''}`}
                onClick={() => {
                  if (win.isMinimized) {
                    focusWindow(win.id);
                  } else if (win.active) {
                    minimizeWindow(win.id, { stopPropagation: () => { } } as any);
                  } else {
                    focusWindow(win.id);
                  }
                }}
              >
                <span className="xp-taskbar-icon">{win.icon}</span>
                <span className="xp-taskbar-text">{win.title}</span>
              </div>
            );
          })}
        </div>

        {/* Systray */}
        <div className="xp-systray">
          <div className="xp-systray-icons">
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Isključi retro zvukove" : "Uključi retro zvukove"}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </span>
          </div>
          <div>{timeStr}</div>
        </div>
      </div>

      {/* Windows XP Start Menu */}
      {isStartOpen && (
        <div className="xp-start-menu">
          {/* Header */}
          <div className="xp-start-header">
            <div className="xp-start-avatar">👤</div>
            <div>
              <div>Luka</div>
              <div style={{ fontSize: '9px', fontWeight: 'normal', textShadow: 'none', color: '#c3d5ff' }}>Administrator</div>
            </div>
          </div>

          {/* Content */}
          <div className="xp-start-content">
            <div className="xp-start-left">
              <div className="xp-start-item" onClick={() => { setCurrentLevelIdx(0); setIsStartOpen(false); }}>
                <span style={{ fontSize: '20px' }}>🚀</span>
                <div>
                  <strong>Pokreni program za učenje</strong>
                  <div className="xp-start-item-subtext">Počni od prvog nivoa</div>
                </div>
              </div>
              <div className="xp-start-item" onClick={() => toggleWindow('terminal')}>
                <span style={{ fontSize: '20px' }}>💻</span>
                <div>
                  <strong>Git Command Prompt</strong>
                  <div className="xp-start-item-subtext">Terminal za kucanje komandi</div>
                </div>
              </div>
              <div className="xp-start-item" onClick={() => toggleWindow('graph')}>
                <span style={{ fontSize: '20px' }}>📊</span>
                <div>
                  <strong>Git Graph Explorer</strong>
                  <div className="xp-start-item-subtext">Vizuelni pregled stabla</div>
                </div>
              </div>
              <div className="xp-start-separator" />
              <div className="xp-start-item" style={{ marginTop: 'auto' }} onClick={() => toggleWindow('credits')}>
                <span style={{ fontSize: '20px' }}>ℹ️</span>
                <div>
                  <strong>About Luna Git</strong>
                  <div className="xp-start-item-subtext">O autoru i predavanjima</div>
                </div>
              </div>
            </div>

            <div className="xp-start-right">
              <div className="xp-start-item" onClick={() => toggleWindow('instructions')}>
                <span>📖</span>
                <span>Uputstva za nivoe</span>
              </div>
              <div className="xp-start-item" onClick={() => {
                const nextLevelId = completedLevels.length > 0 ? Math.min(Math.max(...completedLevels) + 1, 10) : 1;
                const nextIdx = levels.findIndex(l => l.id === nextLevelId);
                if (nextIdx !== -1) {
                  setCurrentLevelIdx(nextIdx);
                }
                setIsStartOpen(false);
              }}>
                <span>🎮</span>
                <span>Nastavi napredak</span>
              </div>
              <div className="xp-start-separator" />
              <div className="xp-start-item" onClick={resetAllProgress}>
                <span>🔄</span>
                <span>Resetuj napredak</span>
              </div>
              {/* Uskršnje jaje: Plavi ekran smrti */}
              <div className="xp-start-item" onClick={() => { setShowBSOD(true); setIsStartOpen(false); }}>
                <span>🔥</span>
                <span>Crash System (BSOD)</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="xp-start-footer">
            <div className="xp-footer-btn" onClick={resetAllProgress}>
              <span className="xp-footer-icon">🔑</span>
              <span>Odjavi se (Log Off)</span>
            </div>
            <div className="xp-footer-btn" onClick={() => window.close()}>
              <span className="xp-footer-icon">🔴</span>
              <span>Ugasi (Turn Off)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
