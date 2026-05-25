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
      return `<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: disc; font-size: inherit; line-height: 1.5; color: #333;">${bulletMatch[1]}</li>`;
    }

    // Numbered lists: 1. Item
    const numberMatch = trimmed.match(/^\d+\.\s+(.*)/);
    if (numberMatch) {
      return `<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: decimal; font-size: inherit; line-height: 1.5; color: #333;">${numberMatch[1]}</li>`;
    }

    // Empty line
    if (trimmed === '') {
      return '<div style="height: 8px;"></div>';
    }

    // Normal paragraph line
    return `<p style="margin-bottom: 8px; line-height: 1.5; font-size: inherit; color: #333;">${line}</p>`;
  });

  let html = processedLines.join('\n');

  // Replace inline bold **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: bold; color: #002e80;">$1</strong>');

  // Replace inline italic *italic*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Replace inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code style="background-color: #f0f3fd; border: 1px solid #d3e2f9; border-radius: 3px; padding: 1.5px 5px; font-family: monospace; font-size: 0.9em; color: #c7254e; font-weight: bold;">$1</code>');

  return html;
};

const bgStyles: Record<string, React.CSSProperties & Record<string, string>> = {
  bliss: {
    backgroundImage: "url('bliss.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    "--xp-blue-dark": "#002e80",
    "--xp-blue-primary": "#245ddb",
    "--xp-blue-light": "#5b87e2",
    "--xp-blue-gradient": "linear-gradient(to bottom, #76a1f8 0%, #3d68c3 100%)",
    "--xp-title-gradient": "linear-gradient(to right, #0058e6 0%, #3a8df5 50%, #0058e6 100%)",
    "--xp-title-gradient-inactive": "linear-gradient(to right, #7ea6e7 0%, #9cbef3 50%, #7ea6e7 100%)",
    "--xp-titlebar-border-top": "#7ea7fc",
    "--xp-titlebar-border-top-inactive": "#b5d1fa",
    "--xp-start-gradient": "linear-gradient(to bottom, #3c9d3c 0%, #246a24 100%)",
    "--xp-start-hover": "linear-gradient(to bottom, #4cb84c 0%, #2f852f 100%)",
    "--xp-window-bg": "#ece9d8",
    "--xp-window-border": "#0050e6",
    "--xp-window-border-active": "#0055ff",
    "--xp-taskbar-bg": "linear-gradient(to bottom, #245ddb 0%, #0e3092 9%, #245ddb 18%, #245ddb 92%, #0e3092 100%)",
    "--xp-taskbar-border-top": "#7ea7fc",
    "--xp-taskbar-item-bg": "linear-gradient(to bottom, #3c82eb 0%, #1f50a8 100%)",
    "--xp-taskbar-item-border": "#002e80",
    "--xp-taskbar-item-bg-hover": "linear-gradient(to bottom, #5d9efa 0%, #2f6ecf 100%)",
    "--xp-taskbar-item-bg-active": "linear-gradient(to bottom, #16387a 0%, #2b61bd 100%)",
    "--xp-taskbar-item-border-active": "#102450",
    "--xp-systray-bg": "linear-gradient(to bottom, #0f8bf2 0%, #0c68c2 100%)",
    "--xp-start-right-bg": "#d3e5fa",
    "--xp-text-primary": "#333333",
    "--xp-text-muted": "#666666",
    "--xp-btn-minmax-bg": "linear-gradient(to bottom, #8eaaf4 0%, #3e68ce 100%)",
    "--xp-btn-primary-bg": "linear-gradient(to bottom, #4d8df6 0%, #1e52cf 100%)",
    "--xp-btn-primary-border": "#002e80",
    "--xp-btn-primary-bg-hover": "linear-gradient(to bottom, #6d9ff7 0%, #2f65df 100%)",
  },
  royale: {
    backgroundImage: "url('royale.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    "--xp-blue-dark": "#002060",
    "--xp-blue-primary": "#3b68c3",
    "--xp-blue-light": "#7da9fc",
    "--xp-blue-gradient": "linear-gradient(to bottom, #7da9fc 0%, #3b68c3 100%)",
    "--xp-title-gradient": "linear-gradient(to right, #3b68c3 0%, #7da9fc 50%, #3b68c3 100%)",
    "--xp-title-gradient-inactive": "linear-gradient(to right, #a5c1f5 0%, #c1d7f9 50%, #a5c1f5 100%)",
    "--xp-titlebar-border-top": "#a5c1f5",
    "--xp-titlebar-border-top-inactive": "#d6e5fd",
    "--xp-start-gradient": "linear-gradient(to bottom, #15ad15 0%, #086308 100%)",
    "--xp-start-hover": "linear-gradient(to bottom, #20cc20 0%, #0c820c 100%)",
    "--xp-window-bg": "#f0f3fd",
    "--xp-window-border": "#3b68c3",
    "--xp-window-border-active": "#7da9fc",
    "--xp-taskbar-bg": "linear-gradient(to bottom, #3b68c3 0%, #204ba3 9%, #3b68c3 18%, #3b68c3 92%, #204ba3 100%)",
    "--xp-taskbar-border-top": "#7da9fc",
    "--xp-taskbar-item-bg": "linear-gradient(to bottom, #5587e6 0%, #2a55b3 100%)",
    "--xp-taskbar-item-border": "#1a3b80",
    "--xp-taskbar-item-bg-hover": "linear-gradient(to bottom, #729cf0 0%, #3d68c9 100%)",
    "--xp-taskbar-item-bg-active": "linear-gradient(to bottom, #1a3c7a 0%, #305eb0 100%)",
    "--xp-taskbar-item-border-active": "#102450",
    "--xp-systray-bg": "linear-gradient(to bottom, #508cf3 0%, #2859b8 100%)",
    "--xp-start-right-bg": "#e6effb",
    "--xp-text-primary": "#203a70",
    "--xp-text-muted": "#506590",
    "--xp-btn-minmax-bg": "linear-gradient(to bottom, #a5c1f5 0%, #3b68c3 100%)",
    "--xp-btn-primary-bg": "linear-gradient(to bottom, #5587e6 0%, #2a55b3 100%)",
    "--xp-btn-primary-border": "#1a3b80",
    "--xp-btn-primary-bg-hover": "linear-gradient(to bottom, #729cf0 0%, #3d68c9 100%)",
  },
  zune: {
    backgroundImage: "url('zune.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    "--xp-blue-dark": "#1a1a1a",
    "--xp-blue-primary": "#ff6600",
    "--xp-blue-light": "#4e4e4e",
    "--xp-blue-gradient": "linear-gradient(to bottom, #4e4e4e 0%, #1a1a1a 100%)",
    "--xp-title-gradient": "linear-gradient(to right, #2b2b2b 0%, #3a3a3a 50%, #2b2b2b 100%)",
    "--xp-title-gradient-inactive": "linear-gradient(to right, #4c4c4c 0%, #5a5a5a 50%, #4c4c4c 100%)",
    "--xp-titlebar-border-top": "#5c5c5c",
    "--xp-titlebar-border-top-inactive": "#4c4c4c",
    "--xp-start-gradient": "linear-gradient(to bottom, #ff6600 0%, #cc5200 100%)",
    "--xp-start-hover": "linear-gradient(to bottom, #ff8533 0%, #e65c00 100%)",
    "--xp-window-bg": "#ece9d8",
    "--xp-window-border": "#4e4e4e",
    "--xp-window-border-active": "#ff6600",
    "--xp-taskbar-bg": "linear-gradient(to bottom, #2b2b2b 0%, #1a1a1a 9%, #2b2b2b 18%, #2b2b2b 92%, #1a1a1a 100%)",
    "--xp-taskbar-border-top": "#4e4e4e",
    "--xp-taskbar-item-bg": "linear-gradient(to bottom, #4c4c4c 0%, #2d2d2d 100%)",
    "--xp-taskbar-item-border": "#1c1c1c",
    "--xp-taskbar-item-bg-hover": "linear-gradient(to bottom, #5a5a5a 0%, #3a3a3a 100%)",
    "--xp-taskbar-item-bg-active": "linear-gradient(to bottom, #2b2b2b 0%, #ff6600 100%)",
    "--xp-taskbar-item-border-active": "#ff6600",
    "--xp-systray-bg": "linear-gradient(to bottom, #444444 0%, #2b2b2b 100%)",
    "--xp-start-right-bg": "#dfdad3",
    "--xp-text-primary": "#333333",
    "--xp-text-muted": "#666666",
    "--xp-btn-minmax-bg": "linear-gradient(to bottom, #6c6c6c 0%, #3c3c3c 100%)",
    "--xp-btn-primary-bg": "linear-gradient(to bottom, #ff7926 0%, #cc5200 100%)",
    "--xp-btn-primary-border": "#cc5200",
    "--xp-btn-primary-bg-hover": "linear-gradient(to bottom, #ff924d 0%, #e65c00 100%)",
  },
  classic: {
    backgroundColor: "#3b6ea5",
    backgroundImage: "none",
    "--xp-blue-dark": "#000080",
    "--xp-blue-primary": "#808080",
    "--xp-blue-light": "#d4d0c8",
    "--xp-blue-gradient": "none",
    "--xp-title-gradient": "linear-gradient(to right, #000080 0%, #1084d0 100%)",
    "--xp-title-gradient-inactive": "#808080",
    "--xp-titlebar-border-top": "#ffffff",
    "--xp-titlebar-border-top-inactive": "#ffffff",
    "--xp-start-gradient": "linear-gradient(to bottom, #d4d0c8 0%, #808080 100%)",
    "--xp-start-hover": "linear-gradient(to bottom, #ffffff 0%, #b0b0b0 100%)",
    "--xp-window-bg": "#d4d0c8",
    "--xp-window-border": "#808080",
    "--xp-window-border-active": "#000080",
    "--xp-taskbar-bg": "#d4d0c8",
    "--xp-taskbar-border-top": "#ffffff",
    "--xp-taskbar-item-bg": "#d4d0c8",
    "--xp-taskbar-item-border": "#808080",
    "--xp-taskbar-item-border-radius": "0px",
    "--xp-taskbar-item-box-shadow": "none",
    "--xp-taskbar-item-text-color": "#000000",
    "--xp-taskbar-item-text-shadow": "none",
    "--xp-taskbar-item-bg-hover": "#e6e6e6",
    "--xp-taskbar-item-bg-active": "#808080",
    "--xp-taskbar-item-border-active": "#000000",
    "--xp-taskbar-item-box-shadow-active": "none",
    "--xp-systray-bg": "#d4d0c8",
    "--xp-start-right-bg": "#d4d0c8",
    "--xp-text-primary": "#000000",
    "--xp-text-muted": "#808080",
    "--xp-btn-border": "2px outset #ffffff",
    "--xp-btn-border-radius": "0px",
    "--xp-btn-box-shadow": "none",
    "--xp-btn-text-color": "#000000",
    "--xp-btn-minmax-bg": "#d4d0c8",
    "--xp-btn-close-bg": "#d4d0c8",
    "--xp-btn-close-hover": "#e6e6e6",
    "--xp-btn-primary-bg": "#d4d0c8",
    "--xp-btn-primary-border": "#808080",
    "--xp-btn-primary-bg-hover": "#e6e6e6",
  }
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
      icon: 'xp-notepad.png',
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
      icon: 'xp-terminal.png',
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
      icon: 'xp-folder.png',
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
      icon: 'xp-info.png',
      x: 200,
      y: 100,
      w: 450,
      h: 380,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      active: false
    },
    {
      id: 'controlPanel',
      title: 'Control Panel (Kontrolna Tabla)',
      icon: 'xp-control.png',
      x: 100,
      y: 80,
      w: 460,
      h: 400,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      active: false
    },
    {
      id: 'trivia',
      title: 'Doge Trivia Kviz',
      icon: 'xp-game.png',
      x: 120,
      y: 100,
      w: 460,
      h: 440,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      active: false
    },
    {
      id: 'certificate',
      title: 'Luna Git Sertifikat',
      icon: 'xp-certificate.png',
      x: 140,
      y: 50,
      w: 680,
      h: 520,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      active: false
    }
  ]);

  // Podešavanja izgleda i asistenta
  const [bgTheme, setBgTheme] = useState<'bliss' | 'royale' | 'zune' | 'classic'>(() => {
    return (localStorage.getItem('luna_git_bg') as any) || 'bliss';
  });

  const [assistantChar, setAssistantChar] = useState<'doge' | 'snake' | 'bonzi'>(() => {
    return (localStorage.getItem('luna_git_assistant') as any) || 'doge';
  });

  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('luna_git_student_name') || '';
  });

  // Trivia Kviz stanja
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showTriviaFeedback, setShowTriviaFeedback] = useState(false);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaFinished, setTriviaFinished] = useState(false);

  // Start meni, BSOD, zvučni signali, Solitaire slavlje
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [showBSOD, setShowBSOD] = useState(false);
  const [showSolitaire, setShowSolitaire] = useState(false);
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('xp_username') || 'Luka';
  });
  const [tempUserName, setTempUserName] = useState(() => {
    return localStorage.getItem('xp_username') || 'Luka';
  });
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('luna_git_sound');
    return saved !== 'false';
  });
  const [timeStr, setTimeStr] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gitko pomoćnik
  const [gitkoMsg, setGitkoMsg] = useState<string>(
    'Zdravo! Ja sam Gitko. Pokreni učenje klikom na "Pokreni program" u Start meniju ili osmotri prečice na radnoj površini!'
  );
  const [showLevelSuccessModal, setShowLevelSuccessModal] = useState(false);

  // Refovi za drag i scroll
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<{ winId: string; startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeInfo = useRef<{ winId: string; startWidth: number; startHeight: number; startX: number; startY: number } | null>(null);
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

  // Čuvanje podešavanja u localStorage
  useEffect(() => {
    localStorage.setItem('luna_git_bg', bgTheme);
  }, [bgTheme]);

  useEffect(() => {
    localStorage.setItem('luna_git_assistant', assistantChar);
  }, [assistantChar]);

  useEffect(() => {
    localStorage.setItem('luna_git_student_name', studentName);
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('luna_git_sound', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

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
    if (isMobile) return;
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

  // Resize logika za prozore (instructions, terminal, graph)
  const handleResizeMouseDown = (id: string, e: React.MouseEvent) => {
    if (isMobile) return;
    e.stopPropagation();
    e.preventDefault();
    const win = windows.find(w => w.id === id);
    if (!win || win.isMaximized) return;

    focusWindow(id);
    resizeInfo.current = {
      winId: id,
      startWidth: win.w,
      startHeight: win.h,
      startX: e.clientX,
      startY: e.clientY
    };

    document.addEventListener('mousemove', handleGlobalResizeMouseMove);
    document.addEventListener('mouseup', handleGlobalResizeMouseUp);
  };

  const handleGlobalResizeMouseMove = (e: MouseEvent) => {
    if (!resizeInfo.current) return;
    const info = resizeInfo.current;
    const dx = e.clientX - info.startX;
    const dy = e.clientY - info.startY;

    // Razumne minimalne dimenzije (trenutne vrednosti kao minimalne)
    let minW = 300;
    let minH = 200;
    if (info.winId === 'instructions') {
      minW = 480;
      minH = 520;
    } else if (info.winId === 'terminal') {
      minW = 520;
      minH = 250;
    } else if (info.winId === 'graph') {
      minW = 520;
      minH = 250;
    }

    setWindows(prev =>
      prev.map(w =>
        w.id === info.winId
          ? {
            ...w,
            w: Math.max(minW, info.startWidth + dx),
            h: Math.max(minH, info.startHeight + dy)
          }
          : w
      )
    );
  };

  const handleGlobalResizeMouseUp = () => {
    resizeInfo.current = null;
    document.removeEventListener('mousemove', handleGlobalResizeMouseMove);
    document.removeEventListener('mouseup', handleGlobalResizeMouseUp);
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
      let updatedCommandsRun = [...levelCommandsRun];
      const typedCleaned = cmd.toLowerCase().trim().replace(/\s+/g, ' ');

      // Proveri da li se uneta komanda poklapa sa nekim od očekivanih za trenutni nivo
      currentLevel.expectedCommands.forEach(expectedCmd => {
        const expectedCleaned = expectedCmd.toLowerCase().trim().replace(/\s+/g, ' ');
        if (typedCleaned.startsWith(expectedCleaned) || (expectedCleaned === 'git checkout' && typedCleaned.startsWith('git switch'))) {
          if (!updatedCommandsRun.includes(expectedCleaned)) {
            updatedCommandsRun.push(expectedCleaned);
          }
        }
      });

      // Takođe zadrži opštu podršku za bilokoju git komandu da se upiše u istoriju radi kompatibilnosti
      const parts = cmd.toLowerCase().trim().split(/\s+/);
      const gitCmd = parts[0];
      const subCmd = parts[1];
      if (gitCmd === 'git' && subCmd) {
        const generalCmd = `git ${subCmd}`;
        if (!updatedCommandsRun.includes(generalCmd)) {
          updatedCommandsRun.push(generalCmd);
        }
      }

      setLevelCommandsRun(updatedCommandsRun);

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

  // Tastaturni osluškivač za "Enter" taster kada je modal uspeha aktivan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLevelSuccessModal && e.key === 'Enter') {
        e.preventDefault();
        setShowLevelSuccessModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLevelSuccessModal]);

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

  // Restartovanje samo trenutnog nivoa
  const resetCurrentLevel = () => {
    if (window.confirm(`Da li ste sigurni da želite da resetujete stanje za trenutni nivo "${currentLevel.title}"? Sve unete komande i stanje fajlova za ovaj nivo će biti vraćeni na početak.`)) {
      setRepoState(JSON.parse(JSON.stringify(currentLevel.initialState)));
      setLevelCommandsRun([]);
      setTerminalHistory([
        {
          input: 'clear',
          output: `Stanje za nivo "${currentLevel.title}" je uspešno resetovano. Srećno učenje!\nUnesite prvu komandu...`
        }
      ]);
      if (soundEnabled) playTone(400, 0, 0.25, 'sine');
      setIsStartOpen(false);
    }
  };

  const handleSaveUserName = () => {
    const finalName = tempUserName.trim() || 'Luka';
    setUserName(finalName);
    setTempUserName(finalName);
    localStorage.setItem('xp_username', finalName);
    setShowSaveFeedback(true);
    if (soundEnabled) {
      playTone(880, 0, 0.1, 'sine', 0.12);
      setTimeout(() => playTone(1100, 0, 0.15, 'sine', 0.12), 80);
    }
    setTimeout(() => {
      setShowSaveFeedback(false);
    }, 2500);
  };

  const hasActiveWindow = windows.some(w => w.isOpen && !w.isMinimized);

  return (
    <div className={`xp-desktop ${hasActiveWindow ? 'xp-desktop-has-active-window' : ''}`} style={bgStyles[bgTheme]}>
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
            maxWidth: '450px',
            pointerEvents: 'auto'
          }}>
            <h2 style={{ color: '#002e80', fontWeight: 'bold', fontSize: '22px', marginBottom: '15px' }}>🎉 Svaka čast, genije! 🎉</h2>
            <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '20px', color: '#333' }}>
              Završio si svih {levels.length} nivoa na platformi <strong>Luna Git</strong> i uspešno savladao teoriju prof. dr Igora Dejanovića na srpskom jeziku! Sada si spreman za rad na realnim projektima!
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
          <div className="xp-desktop-icon-img">
            <img src="xp-notepad.png" alt="Uputstvo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="xp-desktop-icon-text">Uputstvo</div>
        </div>

        <div className="xp-desktop-icon" onClick={() => toggleWindow('terminal')}>
          <div className="xp-desktop-icon-img">
            <img src="xp-terminal.png" alt="Git Terminal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="xp-desktop-icon-text">Git Terminal</div>
        </div>

        <div className="xp-desktop-icon" onClick={() => toggleWindow('graph')}>
          <div className="xp-desktop-icon-img">
            <img src="xp-folder.png" alt="Git Graf" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="xp-desktop-icon-text">Git Graf</div>
        </div>

        <div className="xp-desktop-icon" onClick={() => toggleWindow('controlPanel')}>
          <div className="xp-desktop-icon-img">
            <img src="xp-control.png" alt="Control Panel" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="xp-desktop-icon-text">Control Panel</div>
        </div>

        <div className="xp-desktop-icon" onClick={() => toggleWindow('trivia')}>
          <div className="xp-desktop-icon-img">
            <img src="xp-game.png" alt="Doge Kviz" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="xp-desktop-icon-text">Doge Kviz</div>
        </div>

        <div className="xp-desktop-icon" onClick={() => toggleWindow('certificate')}>
          <div className="xp-desktop-icon-img">
            <img src="xp-certificate.png" alt="Sertifikat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="xp-desktop-icon-text">Sertifikat</div>
        </div>

        <div className="xp-desktop-icon" onClick={() => toggleWindow('credits')}>
          <div className="xp-desktop-icon-img">
            <img src="xp-info.png" alt="Credits" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
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
                {win.icon.endsWith('.png') ? (
                  <img src={win.icon} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '4px' }} />
                ) : (
                  <span className="xp-window-title-icon">{win.icon}</span>
                )}
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
              {win.id === 'terminal' && (() => {
                const actualWidth = isMobile ? window.innerWidth : (win.isMaximized ? window.innerWidth : win.w);
                const termScale = isMobile ? (actualWidth / 420) : (actualWidth / 520);
                const termFontSize = Math.max(isMobile ? 12.5 : 10, Math.min(20, Math.floor(14 * termScale)));
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* XP Toolbar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 6px',
                      backgroundColor: 'var(--xp-window-bg, #ece9d8)',
                      borderBottom: '1px solid var(--xp-window-border, #7ea7fc)',
                      fontFamily: 'Tahoma, Arial, sans-serif',
                      fontSize: '11px',
                      color: '#000000',
                      boxSizing: 'border-box'
                    }}>
                      <button
                        className="xp-button"
                        onClick={(e) => { e.stopPropagation(); resetCurrentLevel(); }}
                        style={{
                          padding: '2px 8px',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 'normal',
                          cursor: 'pointer'
                        }}
                      >
                        🔄 Resetuj nivo
                      </button>
                      <button
                        className="xp-button"
                        onClick={(e) => { e.stopPropagation(); setGitkoMsg(currentLevel.hint); if (soundEnabled) playTone(440, 0, 0.1, 'sine'); }}
                        style={{
                          padding: '2px 8px',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 'normal',
                          cursor: 'pointer'
                        }}
                      >
                        💡 Pomoć
                      </button>
                    </div>
                    <div className="xp-terminal" style={{ flex: 1, fontSize: `${termFontSize}px` }} onClick={() => document.getElementById('term-input-field')?.focus()}>
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
                  </div>
                );
              })()}

              {/* 2. Instructions Window Content */}
              {win.id === 'instructions' && (() => {
                const actualWidth = isMobile ? window.innerWidth : (win.isMaximized ? window.innerWidth : win.w);
                const scale = isMobile ? (actualWidth / 400) : (actualWidth / 480);
                const catFontSize = Math.max(isMobile ? 10.5 : 9, Math.min(14, Math.floor(11 * scale)));
                const titleFontSize = Math.max(isMobile ? 16 : 14, Math.min(24, Math.floor(18 * scale)));
                const descFontSize = Math.max(isMobile ? 13.5 : 11, Math.min(17, Math.floor(13 * scale)));
                const hintFontSize = Math.max(isMobile ? 11.5 : 9, Math.min(14, Math.floor(11.5 * scale)));
                return (
                  <div className="xp-level-panel" style={{ height: '100%', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: `${catFontSize}px`, fontWeight: 'bold', color: '#666' }}>KATEGORIJA: {currentLevel.category}</span>
                      <span style={{ fontSize: `${catFontSize}px`, fontWeight: 'bold', color: '#245ddb' }}>NIVO {currentLevel.id} od {levels.length}</span>
                    </div>

                    <h2 style={{ fontSize: `${titleFontSize}px`, color: '#002e80', borderBottom: '2px solid #3b68c3', paddingBottom: '5px' }}>
                      {currentLevel.title}
                    </h2>

                    <div
                      style={{ fontSize: `${descFontSize}px`, lineHeight: '1.6', margin: '15px 0' }}
                      dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(currentLevel.description) }}
                    />

                    <div className="xp-level-box" style={{ fontSize: `${hintFontSize}px` }}>
                      <strong>💡 Pomoć i Savet:</strong>
                      <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: `${hintFontSize}px` }}>
                        {currentLevel.hint}
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid #d4d0c8' }}>
                      <button
                        className="xp-button"
                        disabled={currentLevelIdx === 0}
                        onClick={() => setCurrentLevelIdx(prev => prev - 1)}
                        style={{ fontSize: `${Math.max(10, Math.min(15, Math.floor(12 * scale)))}px` }}
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
                        style={{ fontSize: `${Math.max(10, Math.min(15, Math.floor(12 * scale)))}px` }}
                      >
                        Sledeći nivo {(completedLevels.includes(currentLevel.id) || currentLevel.id <= Math.max(...completedLevels, 0)) ? '🔓' : '🔒'}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Git Graph Window Content */}
              {win.id === 'graph' && (() => {
                const actualWidth = isMobile ? window.innerWidth : (win.isMaximized ? window.innerWidth : win.w);
                const graphScale = isMobile ? (actualWidth / 420) : (actualWidth / 520);
                const graphFontMultiplier = Math.max(0.7, Math.min(1.35, graphScale));
                return (
                  <GitGraph state={repoState} fontSizeMultiplier={graphFontMultiplier} />
                );
              })()}

              {/* 4. Credits Window Content */}
              {win.id === 'credits' && (
                <div style={{ padding: '20px', fontSize: '13px', lineHeight: '1.6', height: '100%', overflowY: 'auto' }}>
                  <h2 style={{ color: '#002e80', borderBottom: '2px solid #b0c9ea', paddingBottom: '4px', marginBottom: '12px' }}>
                    O Autoru i Priznanja
                  </h2>
                  <p>
                    <strong>Luna Git</strong> je interaktivna retro platforma za vizuelno i gejmifikovano učenje Git komandi, osmišljena u duhu legendarnog operativnog sistema <strong>Windows XP (Luna plava tema, Y2K stil)</strong>.
                  </p>
                  <p style={{ marginTop: '10px' }}>
                    📚 <strong>Edukativni materijal:</strong><br />
                    Sav teorijski sadržaj, zadaci i metodologija učenja preuzeti su iz javnih predavanja i slajdova <strong>Prof. dr Igora Dejanovića</strong> sa Fakulteta tehničkih nauka u Novom Sadu (kurs Tehnički alati / Git).
                    Sve zasluge za strukturu i kvalitet objašnjenja pripadaju profesoru Dejanoviću. Posetite izvorne materijale na:
                    <a href="https://igordejanovic.net/courses/tech/git/" target="_blank" rel="noreferrer" style={{ color: '#245ddb', marginLeft: '5px', textDecoration: 'underline' }}>igordejanovic.net/courses/tech/git/</a>
                  </p>
                  <p style={{ marginTop: '10px' }}>
                    💡 <strong>Inspiracija za vizuelni koncept:</strong><br />
                    Zahvaljujemo se i fenomenalnom projektu <strong>Learn Git Branching</strong> (learngitbranching.js.org) koji je poslužio kao glavna inspiracija za učenje Git-a putem interaktivnog grafičkog stabla na komandnoj liniji.
                  </p>
                  <p style={{ marginTop: '10px', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                    Projekat je kreiran od strane<a href="https://github.com/RileDev" target="_blank" rel="noreferrer" style={{ color: '#245ddb', marginLeft: '5px', textDecoration: 'underline' }}>github.com/RileDev</a> uz pomoc Antigravity alata.
                  </p>
                </div>
              )}

              {/* 5. Control Panel Window Content */}
              {win.id === 'controlPanel' && (
                <div style={{ padding: '15px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', boxSizing: 'border-box' }}>
                  <h3 style={{ color: '#002e80', borderBottom: '2px solid #b0c9ea', paddingBottom: '4px', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src="xp-control.png" alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                    Podešavanja Ekosistema
                  </h3>
                  
                  <div>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <img src="xp-palette.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                      Izaberi temu i izgled ekosistema (Themes)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {[
                        { id: 'bliss', name: 'Bliss (XP Klasik)' },
                        { id: 'royale', name: 'Royale Blue (Medijski centar)' },
                        { id: 'zune', name: 'Zune (Tamno narandžasto)' },
                        { id: 'classic', name: 'Classic Windows 2000' }
                      ].map(t => (
                        <button
                          key={t.id}
                          className={`xp-button ${bgTheme === t.id ? 'xp-button-primary' : ''}`}
                          onClick={() => {
                            setBgTheme(t.id as any);
                            if (soundEnabled) playTone(500, 0, 0.1, 'sine');
                          }}
                          style={{ padding: '8px', textAlign: 'left', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <img src={bgTheme === t.id ? 'xp-radio-on.png' : 'xp-radio-off.png'} alt="" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <img src="xp-user.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                      Izaberi retro asistenta
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {[
                        { id: 'doge', name: 'Gitko Doge', icon: 'doge.png' },
                        { id: 'snake', name: 'Solid Snake', icon: 'snake.png' },
                        { id: 'bonzi', name: 'BonziBuddy', icon: 'bonzi.png' }
                      ].map(a => (
                        <button
                          key={a.id}
                          className={`xp-button ${assistantChar === a.id ? 'xp-button-primary' : ''}`}
                          onClick={() => {
                            setAssistantChar(a.id as any);
                            if (soundEnabled) playTone(600, 0, 0.1, 'sine');
                            const welcomeMsgs = {
                              doge: 'Vau! Gitko Doge je ponovo tu! Mnogo git, vrlo grana!',
                              snake: 'Snake ovde. Spreman za akciju na terenu. Pazi se!',
                              bonzi: 'Zdravo! Ja sam tvoj najbolji ljubičasti drugar BonziBuddy!'
                            };
                            setGitkoMsg(welcomeMsgs[a.id as keyof typeof welcomeMsgs]);
                          }}
                          style={{ padding: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}
                        >
                          <img src={a.icon} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                          {a.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <img src="xp-sound.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                      Retro zvučni efekti
                    </h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className={`xp-button ${soundEnabled ? 'xp-button-primary' : ''}`}
                        onClick={() => {
                          setSoundEnabled(!soundEnabled);
                          if (!soundEnabled) {
                            setTimeout(() => playTone(600, 0, 0.15, 'sine'), 100);
                          }
                        }}
                        style={{ flex: 1, padding: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                      >
                        <img src={soundEnabled ? 'xp-sound.png' : 'xp-sound-off.png'} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                        {soundEnabled ? 'Uključeni retro zvukovi' : 'Zvukovi su isključeni'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '16px', marginRight: '4px' }}>👤</span>
                      Korisničko ime (Start Menu)
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="xp-terminal-input"
                        value={tempUserName}
                        onChange={(e) => setTempUserName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveUserName();
                          }
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: '#fff',
                          color: '#000',
                          border: '1px solid #7ea7fc',
                          padding: '6px 8px',
                          fontSize: '11px',
                          fontFamily: 'Tahoma, Arial, sans-serif',
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)',
                          boxSizing: 'border-box',
                          height: '26px'
                        }}
                        placeholder="Promeni ime ovde..."
                      />
                      <button
                        className="xp-button xp-button-primary"
                        onClick={handleSaveUserName}
                        style={{
                          padding: '2px 12px',
                          fontSize: '11px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        Sačuvaj
                      </button>
                    </div>
                    {showSaveFeedback && (
                      <div 
                        style={{ 
                          marginTop: '6px', 
                          fontSize: '11px', 
                          color: '#008000', 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          animation: 'fadeIn 0.2s ease-in-out'
                        }}
                      >
                        <span>✓</span> Ime uspešno sačuvano!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 6. Trivia Quiz Window Content */}
              {win.id === 'trivia' && (() => {
                const questions = [
                  {
                    q: "Koja komanda inicijalizuje novi Git repozitorijum?",
                    options: ["git start", "git init", "git create", "git new"],
                    answer: 1,
                    exp: "Komanda 'git init' stvara prazan .git direktorijum i započinje praćenje istorije projekta."
                  },
                  {
                    q: "Šta tačno radi 'git add <fajl>'?",
                    options: [
                      "Snima promene u trajnu istoriju.",
                      "Briše neželjene fajlove sa diska.",
                      "Prebacuje promene u pripremnu zonu (staging area).",
                      "Šalje kod na GitHub."
                    ],
                    answer: 2,
                    exp: "Pripremna zona (index ili staging area) služi za biranje izmena koje će ući u sledeći commit."
                  },
                  {
                    q: "Koja je glavna razlika između git merge i git rebase?",
                    options: [
                      "Merge pravi novi merge commit i čuva originalnu istoriju, dok rebase prepisuje istoriju praveći je linearnom.",
                      "Merge briše fajlove, a rebase ih čuva.",
                      "Rebase radi samo na serveru, a merge samo lokalno.",
                      "Nema nikakve razlike."
                    ],
                    answer: 0,
                    exp: "Merge pravi dodatni commit koji spaja dve grane. Rebase pomera bazu grane na vrh druge, prepisujući istoriju."
                  },
                  {
                    q: "Čemu služi komanda git stash?",
                    options: [
                      "Za trajno brisanje grana.",
                      "Za privremeno sklanjanje lokalnih izmena kako bismo dobili čisto radno stablo.",
                      "Za preuzimanje koda sa servera.",
                      "Za preimenovanje fajlova."
                    ],
                    answer: 1,
                    exp: "Stash sklanja modifikovane fajlove na stek i vraća čisto stablo, što omogućava brzu promenu grana."
                  },
                  {
                    q: "Kako možemo bezbedno izmeniti poruku poslednjeg commit-a?",
                    options: [
                      "git commit --change",
                      "git commit --amend -m \"Nova poruka\"",
                      "git commit --reset",
                      "git rewrite"
                    ],
                    answer: 1,
                    exp: "--amend prepravlja poslednji commit, dodajući mu trenutne pripremljene izmene i novu poruku."
                  },
                  {
                    q: "Šta se dešava kada uradite git fetch?",
                    options: [
                      "Preuzimaju se novi commit-i sa servera, ali se ne spajaju sa vašim lokalnim radom.",
                      "Vaš kod se automatski šalje na server.",
                      "Briše se ceo repozitorijum.",
                      "Spajaju se grane."
                    ],
                    answer: 0,
                    exp: "Fetch preuzima metapodatke i commit-e sa servera u origin/master, ali ih ne spaja u vaš lokalni master."
                  },
                  {
                    q: "Koja komanda se koristi za kreiranje i prelazak na novu granu u jednom koraku?",
                    options: [
                      "git checkout -b <ime>",
                      "git branch -c <ime>",
                      "git switch -new <ime>",
                      "git new-branch <ime>"
                    ],
                    answer: 0,
                    exp: "git checkout -b kreira novu granu i odmah preusmerava vaš HEAD pokazivač na nju."
                  },
                  {
                    q: "Čemu služi dnevnik git reflog?",
                    options: [
                      "Prikazuje listu fajlova u pripremnoj zoni.",
                      "Beleži svako kretanje HEAD pokazivača, omogućavajući pronalaženje naizgled obrisanih commit-ova.",
                      "Koristi se za komunikaciju sa kolegama na projektu.",
                      "Prikazuje statistiku linija koda."
                    ],
                    answer: 1,
                    exp: "Reflog beleži apsolutno svaku akciju (commit, checkout, reset). Ako izgubite commit, tamo ćete naći heš."
                  },
                  {
                    q: "Šta radi git bisect?",
                    options: [
                      "Spaja dve grane odjednom.",
                      "Koristi binarnu pretragu kroz istoriju commit-ova da brzo locira commit koji je uveo bag.",
                      "Klonira dva repozitorijuma paralelno.",
                      "Briše pola commit-ova iz istorije."
                    ],
                    answer: 1,
                    exp: "Bisect sprovodi binarnu pretragu između dobrog i lošeg commit-a kako bi se locirao krivac za bag."
                  }
                ];

                const currentQ = questions[triviaIndex];

                const handleAnswer = (idx: number) => {
                  setSelectedOption(idx);
                  setShowTriviaFeedback(true);
                  const isCorrect = idx === currentQ.answer;

                  if (isCorrect) {
                    setTriviaScore(s => s + 1);
                    if (soundEnabled) playTone(783.99, 0, 0.3, 'sine', 0.12);
                    
                    const corMsgs = {
                      doge: "Vau! Mnogo tačno, vrlo pametno, vau! Klasa Git stručnjaka!",
                      snake: "Izvanredan rad na terenu! Tvoj Git IQ je na nivou elitnih specijalaca.",
                      bonzi: "Apsolutno fantastično! Tvoj odgovor je magično tačan! 🍌"
                    };
                    setGitkoMsg(corMsgs[assistantChar]);
                  } else {
                    if (soundEnabled) playTone(150, 0, 0.4, 'sawtooth', 0.15);
                    
                    const incorMsgs = {
                      doge: "O ne! Vrlo netačno, mnogo greška, tužni doge. Pokušaj opet!",
                      snake: "Snake? Snake?! SNAAAAAKE! Nije tačno! Koncentriši se, neprijatelj te posmatra!",
                      bonzi: "Ups! Moje banane kažu da to nije tačan odgovor! Više sreće u sledećem koraku."
                    };
                    setGitkoMsg(incorMsgs[assistantChar]);
                  }
                };

                const handleNextTrivia = () => {
                  setSelectedOption(null);
                  setShowTriviaFeedback(false);
                  if (triviaIndex < questions.length - 1) {
                    setTriviaIndex(prev => prev + 1);
                  } else {
                    setTriviaFinished(true);
                    if (soundEnabled) playXpSuccess();
                  }
                };

                const resetTrivia = () => {
                  setTriviaIndex(0);
                  setSelectedOption(null);
                  setShowTriviaFeedback(false);
                  setTriviaScore(0);
                  setTriviaFinished(false);
                };

                if (triviaFinished) {
                  return (
                    <div style={{ padding: '20px', textAlign: 'center', height: '100%', overflowY: 'auto' }}>
                      <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏆</div>
                      <h3 style={{ color: '#002e80', marginBottom: '10px' }}>Kviz završen!</h3>
                      <p style={{ fontSize: '15px', marginBottom: '20px' }}>
                        Tvoj rezultat je <strong>{triviaScore}</strong> od <strong>{questions.length}</strong> poena!
                      </p>
                      <div className="xp-level-box" style={{ marginBottom: '20px', display: 'inline-block', maxWidth: '350px' }}>
                        {triviaScore === questions.length ? (
                          <span>🚀 Perfektan rezultat! Pravi si Git General.</span>
                        ) : triviaScore >= 6 ? (
                          <span>👍 Odlično znanje! Skoro sve ti je kristalno jasno.</span>
                        ) : (
                          <span>⚠️ Nije loše, ali pročitaj uputstva još jednom i pokušaj ponovo.</span>
                        )}
                      </div>
                      <div>
                        <button className="xp-button xp-button-primary" onClick={resetTrivia}>Igraj ponovo</button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '11px', color: '#666', borderBottom: '1px solid #d4d0c8', paddingBottom: '5px' }}>
                      <span>Pitanje {triviaIndex + 1} od {questions.length}</span>
                      <span>Rezultat: {triviaScore} tačnih</span>
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#002e80', marginBottom: '15px', minHeight: '40px' }}>
                      {currentQ.q}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                      {currentQ.options.map((opt, idx) => {
                        return (
                          <button
                            key={idx}
                            className="xp-button"
                            disabled={selectedOption !== null}
                            onClick={() => handleAnswer(idx)}
                            style={{
                              padding: '10px',
                              textAlign: 'left',
                              fontSize: '12px',
                              backgroundColor: selectedOption !== null && idx === currentQ.answer ? '#10b981' : selectedOption === idx ? '#f87171' : '',
                              color: selectedOption !== null && (idx === currentQ.answer || idx === selectedOption) ? '#fff' : '#000',
                              transition: 'all 0.1s ease'
                            }}
                          >
                            <strong>{String.fromCharCode(65 + idx)})</strong> {opt}
                          </button>
                        );
                      })}
                    </div>

                    {showTriviaFeedback && (
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="xp-level-box" style={{ fontSize: '11px', borderLeftColor: selectedOption === currentQ.answer ? '#10b981' : '#f87171' }}>
                          <strong>💡 Objašnjenje:</strong> {currentQ.exp}
                        </div>
                        <button className="xp-button xp-button-primary" onClick={handleNextTrivia} style={{ alignSelf: 'flex-end' }}>
                          {triviaIndex < questions.length - 1 ? 'Sledeće pitanje ➡️' : 'Završi kviz 🏁'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 7. Certificate Window Content */}
              {win.id === 'certificate' && (() => {
                const isUnlocked = completedLevels.length >= levels.length || completedLevels.includes(levels[levels.length - 1].id);

                if (!isUnlocked) {
                  return (
                    <div style={{ padding: '30px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ fontSize: '54px', marginBottom: '20px' }}>🔒</div>
                      <h3 style={{ color: '#002e80', marginBottom: '10px' }}>Luna Git Sertifikat je Zaključan!</h3>
                      <p style={{ fontSize: '13px', color: '#666', maxWidth: '400px', marginBottom: '20px', lineHeight: '1.6' }}>
                        Da biste preuzeli ovaj ekskluzivni dokaz o Git pismenosti, morate završiti svih <strong>{levels.length} nivoa</strong>.
                        Vaš trenutni napredak iznosi:
                      </p>
                      <div style={{ width: '100%', maxWidth: '350px', height: '22px', backgroundColor: '#e0dfdb', border: '1px solid #999', padding: '2px', borderRadius: '3px', marginBottom: '10px' }}>
                        <div style={{
                          width: `${(completedLevels.length / levels.length) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(to bottom, #76c76c 0%, #3ca03c 100%)',
                          transition: 'width 0.5s ease-in-out'
                        }} />
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                        Završeno {completedLevels.length} od {levels.length} nivoa ({Math.round((completedLevels.length / levels.length) * 100)}%)
                      </div>
                    </div>
                  );
                }

                return (
                  <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center', backgroundColor: '#f0f3fd', border: '1px solid #d3e2f9', padding: '10px', borderRadius: '4px' }} className="no-print">
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#002e80', display: 'block', marginBottom: '4px' }}>
                          Unesi svoje puno ime za sertifikat:
                        </label>
                        <input
                          type="text"
                          className="xp-terminal-input"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="Ime i prezime"
                          style={{
                            backgroundColor: '#fff',
                            color: '#000',
                            border: '1px solid #99aab5',
                            padding: '6px',
                            width: '100%',
                            borderRadius: '3px',
                            fontFamily: 'sans-serif'
                          }}
                        />
                      </div>
                      <button
                        className="xp-button xp-button-primary"
                        onClick={() => window.print()}
                        style={{ height: '34px', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        🖨️ Odštampaj / Sačuvaj PDF
                      </button>
                    </div>

                    <div
                      id="printable-certificate"
                      style={{
                        border: '12px double #d4af37',
                        padding: '30px',
                        backgroundColor: '#faf8f0',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        fontFamily: "'Georgia', serif",
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        minHeight: '400px',
                        color: '#333'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '180px',
                        opacity: 0.04,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        zIndex: 0
                      }}>
                        GIT
                      </div>

                      <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', color: '#a08435', marginBottom: '15px', zIndex: 1 }}>
                        LUNA GIT EDUKATIVNA RETRO PLATFORMA
                      </div>

                      <h2 style={{ fontSize: '24px', color: '#002e80', margin: '0 0 10px 0', fontWeight: 'bold', fontFamily: "'Georgia', serif", zIndex: 1 }}>
                        SERTIFIKAT O STRUČNOSTI
                      </h2>

                      <div style={{ width: '80px', height: '2px', backgroundColor: '#d4af37', marginBottom: '20px', zIndex: 1 }} />

                      <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#666', marginBottom: '10px', zIndex: 1 }}>
                        Ovim se svečano i sa ponosom potvrđuje da je
                      </p>

                      <h1 style={{ fontSize: '28px', color: '#111', fontWeight: 'bold', textDecoration: 'underline', margin: '10px 0 20px 0', minHeight: '38px', fontFamily: "'Georgia', serif", zIndex: 1 }}>
                        {studentName || 'Mladi Git Stručnjak'}
                      </h1>

                      <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#444', maxWidth: '500px', marginBottom: '30px', zIndex: 1 }}>
                        uspešno savladao/la celokupni edukativni program učenja Git-a koji se sastoji od <strong>{levels.length} naprednih interaktivnih lekcija</strong>,
                        i time stekao/la praktično znanje o kontroli verzija, grananju, spajanju koda, rešavanju konflikata, privremenom sklanjanju rada, i naprednoj prepravci istorije.
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto', padding: '0 20px', zIndex: 1, gap: '20px', alignItems: 'flex-end' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontStyle: 'italic', fontSize: '12px', color: '#666', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Prof. dr Igor Dejanović
                          </div>
                          <div style={{ borderTop: '1px solid #999', paddingTop: '5px', fontSize: '11px', fontWeight: 'bold', color: '#555' }}>
                            Autor predavanja (FTN)
                          </div>
                        </div>

                        <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '4px dashed #d4af37',
                            backgroundColor: '#fff9e6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)'
                          }}>
                            <img
                              src={
                                assistantChar === 'doge'
                                  ? "doge.png"
                                  : assistantChar === 'snake'
                                  ? "snake.png"
                                  : "bonzi.png"
                              }
                              alt="Pečat"
                              style={{ width: '45px', height: '45px', objectFit: 'contain', transform: 'rotate(-10deg)' }}
                            />
                          </div>
                          <div style={{
                            position: 'absolute',
                            fontSize: '8px',
                            fontWeight: 'bold',
                            color: '#d4af37',
                            textTransform: 'uppercase',
                            bottom: 2
                          }}>
                            LUNA ODOBRENO
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontStyle: 'italic', fontSize: '12px', color: '#666', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {assistantChar === 'doge' ? 'Gitko Doge' : assistantChar === 'snake' ? 'Solid Snake' : 'BonziBuddy'}
                          </div>
                          <div style={{ borderTop: '1px solid #999', paddingTop: '5px', fontSize: '11px', fontWeight: 'bold', color: '#555' }}>
                            Svedok obuke
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Bottom Status Bar with Resize Grip for Resizable Windows */}
            {['instructions', 'terminal', 'graph'].includes(win.id) && !win.isMaximized && !isMobile && (
              <div 
                className="xp-window-statusbar" 
                style={{
                  height: '20px',
                  backgroundColor: 'var(--xp-window-bg, #ece9d8)',
                  borderTop: '1px solid #d4d0c8',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '6px',
                  paddingRight: '16px', // Offsets scrollbars safely
                  fontSize: '11px',
                  color: '#444',
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                  position: 'relative'
                }}
              >
                <span>Spreman</span>
                {/* Resize Handle is nested at the bottom right of the status bar */}
                <div
                  style={{
                    position: 'absolute',
                    right: '2px',
                    bottom: '2px',
                    width: '12px',
                    height: '12px',
                    cursor: 'se-resize',
                    backgroundImage: 'linear-gradient(135deg, transparent 30%, #555555 30%, #555555 40%, transparent 40%, transparent 50%, #555555 50%, #555555 60%, transparent 60%, transparent 70%, #555555 70%, #555555 80%, transparent 80%)',
                    backgroundSize: '4px 4px',
                    zIndex: 999,
                  }}
                  onMouseDown={(e) => handleResizeMouseDown(win.id, e)}
                />
              </div>
            )}
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
            const msgs = {
              doge: "Ja sam Gitko Doge! Mnogo git, vrlo grana, vau! Klikni na ikone na radnoj površini da otvoriš Git Graf ili Uputstvo.",
              snake: "Snake ovde. Pukovniče, ušao sam u Git repozitorijum. Pazi na konflikte, over.",
              bonzi: "Zdravo! Ja sam tvoj najbolji ljubičasti drugar BonziBuddy! Hoćeš li da ti ispričam vic o programerima? 🍇"
            };
            setGitkoMsg(msgs[assistantChar]);
            if (soundEnabled) playTone(440, 0, 0.15, 'sine');
          }}
        >
          <img 
            src={
              assistantChar === 'doge'
                ? "doge.png"
                : assistantChar === 'snake'
                ? "snake.png"
                : "bonzi.png"
            } 
            alt={assistantChar === 'doge' ? 'Gitko Doge' : assistantChar === 'snake' ? 'Solid Snake' : 'BonziBuddy'} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
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
              <div className="xp-dialog-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button className="xp-button" onClick={() => { setShowLevelSuccessModal(false); handleNextLevel(); }}>
                  Novi nivo
                </button>
                <button 
                  className="xp-button xp-button-primary" 
                  onClick={() => setShowLevelSuccessModal(false)}
                  style={{ fontWeight: 'bold' }}
                  autoFocus
                >
                  Zatvori
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
          <img src="xp-start.png" alt="start logo" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
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
                {win.icon.endsWith('.png') ? (
                  <img src={win.icon} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '6px' }} />
                ) : (
                  <span className="xp-taskbar-icon">{win.icon}</span>
                )}
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
              <div>{userName}</div>
              <div style={{ fontSize: '9px', fontWeight: 'normal', textShadow: 'none', color: '#c3d5ff' }}>Administrator</div>
            </div>
          </div>

          {/* Content */}
          <div className="xp-start-content">
            <div className="xp-start-left">
              <div className="xp-start-item" onClick={() => { setCurrentLevelIdx(0); setIsStartOpen(false); }}>
                <img src="xp-computer.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                <div>
                  <strong>Pokreni program za učenje</strong>
                  <div className="xp-start-item-subtext">Počni od prvog nivoa</div>
                </div>
              </div>
              <div className="xp-start-item" onClick={() => { toggleWindow('terminal'); setIsStartOpen(false); }}>
                <img src="xp-terminal.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                <div>
                  <strong>Git Command Prompt</strong>
                  <div className="xp-start-item-subtext">Terminal za kucanje komandi</div>
                </div>
              </div>
              <div className="xp-start-item" onClick={() => { toggleWindow('graph'); setIsStartOpen(false); }}>
                <img src="xp-folder.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                <div>
                  <strong>Git Graph Explorer</strong>
                  <div className="xp-start-item-subtext">Vizuelni pregled stabla</div>
                </div>
              </div>
              <div className="xp-start-separator" />
              <div className="xp-start-item" style={{ marginTop: 'auto' }} onClick={() => { toggleWindow('credits'); setIsStartOpen(false); }}>
                <img src="xp-info.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                <div>
                  <strong>About Luna Git</strong>
                  <div className="xp-start-item-subtext">O autoru i predavanjima</div>
                </div>
              </div>
            </div>

            <div className="xp-start-right">
              <div className="xp-start-item" onClick={() => { toggleWindow('instructions'); setIsStartOpen(false); }}>
                <img src="xp-notepad.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '6px' }} />
                <span>Uputstva za nivoe</span>
              </div>
              <div className="xp-start-item" onClick={() => {
                const nextLevelId = completedLevels.length > 0 ? Math.min(Math.max(...completedLevels) + 1, levels.length) : 1;
                const nextIdx = levels.findIndex(l => l.id === nextLevelId);
                if (nextIdx !== -1) {
                  setCurrentLevelIdx(nextIdx);
                }
                setIsStartOpen(false);
              }}>
                <img src="xp-game.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '6px' }} />
                <span>Nastavi napredak</span>
              </div>
              <div className="xp-start-separator" />
              <div className="xp-start-item" onClick={() => { toggleWindow('controlPanel'); setIsStartOpen(false); }}>
                <img src="xp-control.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '6px' }} />
                <span>Control Panel</span>
              </div>
              <div className="xp-start-item" onClick={() => { toggleWindow('trivia'); setIsStartOpen(false); }}>
                <img src="xp-game.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '6px' }} />
                <span>Doge Trivia Kviz</span>
              </div>
              <div className="xp-start-item" onClick={() => { toggleWindow('certificate'); setIsStartOpen(false); }}>
                <img src="xp-certificate.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '6px' }} />
                <span>XP Sertifikat</span>
              </div>
              <div className="xp-start-separator" />
              <div className="xp-start-item" onClick={resetCurrentLevel}>
                <img src="xp-lightning.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '6px' }} />
                <span>Resetuj trenutni nivo</span>
              </div>
              <div className="xp-start-item" onClick={resetAllProgress}>
                <img src="xp-refresh.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '6px' }} />
                <span>Resetuj napredak</span>
              </div>
              {/* Uskršnje jaje: Plavi ekran smrti */}
              <div className="xp-start-item" onClick={() => { setShowBSOD(true); setIsStartOpen(false); }}>
                <img src="xp-fire.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '6px' }} />
                <span>Crash System (BSOD)</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="xp-start-footer">
            <div className="xp-footer-btn" onClick={resetAllProgress}>
              <img src="xp-key.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '4px' }} />
              <span>Odjavi se (Log Off)</span>
            </div>
            <div className="xp-footer-btn" onClick={() => window.close()}>
              <img src="xp-shutdown.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '4px' }} />
              <span>Ugasi (Turn Off)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
