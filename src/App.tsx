import React, { useCallback, useEffect, useRef, useState } from 'react';
import { executeGitCommand } from './gitEngine';
import type { RepoState } from './gitEngine';
import { levels } from './levelsData';
import type { Level } from './levelsData';
import { GitGraph } from './GitGraph';
import { useWindowManager } from './hooks/useWindowManager';
import { playTone, playXpError, playXpStartup, playXpSuccess } from './audio';
import { bgStyles } from './themes';
import type { AssistantChar, BgTheme, TerminalEntry, WindowState } from './types';
import { XpWindow } from './components/XpWindow';
import { Bsod } from './components/Bsod';
import { SolitaireCascade } from './components/SolitaireCascade';
import { Gitko } from './components/Gitko';
import { LevelSuccessModal } from './components/LevelSuccessModal';
import { DesktopIcons } from './components/DesktopIcons';
import { Taskbar } from './components/Taskbar';
import { StartMenu } from './components/StartMenu';
import { CreditsWindow } from './components/CreditsWindow';
import { ControlPanelWindow } from './components/ControlPanelWindow';
import { CertificateWindow } from './components/CertificateWindow';
import { TriviaWindow } from './components/TriviaWindow';
import { TerminalWindow } from './components/TerminalWindow';
import { InstructionsWindow } from './components/InstructionsWindow';
import { ProjectExplorerWindow } from './components/ProjectExplorerWindow';
import { LiveBrowserWindow } from './components/LiveBrowserWindow';
import { VideoLessonWindow } from './components/VideoLessonWindow';
import './LunaTheme.css';

// Compute initial window layout based on user's exact specification
const computeInitialWindows = (): WindowState[] => {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const h = typeof window !== 'undefined' ? window.innerHeight : 900;
  const totalHeight = Math.max(500, h - 35); // account for 35px taskbar
  const gap = 6;
  const leftMargin = 10;
  const topMargin = 6;

  // Left Column (Instructions): ~22% of screen
  const w1 = Math.max(280, Math.floor(w * 0.22));
  const h1 = totalHeight - 12;

  // Right Column (Live Browser): ~26% of screen
  const w4 = Math.max(300, Math.floor(w * 0.26));
  const h4 = totalHeight - 12;
  const x4 = w - w4 - 10;

  // Middle Section (Between Col 1 and Col 4)
  const xMid = leftMargin + w1 + gap;
  const midWidth = Math.max(360, x4 - gap - xMid);

  // Top Half of Middle: Git Graph & File Explorer
  const topHeight = Math.floor((totalHeight - 12 - gap) * 0.46);
  const wGraph = Math.floor((midWidth - gap) * 0.5);
  const wExplorer = midWidth - gap - wGraph;
  const xExplorer = xMid + wGraph + gap;

  // Bottom Half of Middle: Terminal
  const yBottom = topMargin + topHeight + gap;
  const bottomHeight = totalHeight - 12 - topHeight - gap;

  return [
    {
      id: 'instructions',
      title: 'Uputstvo za učenje (Kafić Luna)',
      icon: 'xp-notepad.png',
      x: leftMargin,
      y: topMargin,
      w: w1,
      h: h1,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      active: true,
    },
    {
      id: 'graph',
      title: 'Vizuelni Git Graf',
      icon: 'xp-folder.png',
      x: xMid,
      y: topMargin,
      w: wGraph,
      h: topHeight,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      active: false,
    },
    {
      id: 'projectExplorer',
      title: 'Projekat: kafic-luna',
      icon: 'xp-computer.png',
      x: xExplorer,
      y: topMargin,
      w: wExplorer,
      h: topHeight,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      active: false,
    },
    {
      id: 'terminal',
      title: 'Komandna linija (Terminal)',
      icon: 'xp-terminal.png',
      x: xMid,
      y: yBottom,
      w: midWidth,
      h: bottomHeight,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      active: false,
    },
    {
      id: 'liveBrowser',
      title: 'Kafić Luna — Live Web Pregledač',
      icon: 'xp-palette.png',
      x: x4,
      y: topMargin,
      w: w4,
      h: h4,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      active: false,
    },
    {
      id: 'videoLesson',
      title: 'Nivo 3: Git Remote & GitHub (Video Lekcija)',
      icon: 'xp-info.png',
      x: Math.floor(w * 0.2),
      y: 50,
      w: 720,
      h: 520,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      active: false,
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
      active: false,
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
      active: false,
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
      active: false,
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
      active: false,
    },
  ];
};

const RESIZABLE_IDS = new Set([
  'instructions',
  'terminal',
  'graph',
  'projectExplorer',
  'liveBrowser',
  'videoLesson',
]);

const INITIAL_GREETING =
  'Zdravo! Ja sam Gitko. Dobrodošli u novi projekat "Kafić Luna"! Pogledaj raspored prozora i uputstvo sa leve strane!';

export const App: React.FC = () => {
  // ── Level progress ────────────────────────────────────────────────────────
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(() => {
    const saved = localStorage.getItem('luna_git_current_level');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    const saved = localStorage.getItem('luna_git_completed');
    return saved ? JSON.parse(saved) : [];
  });
  const currentLevel: Level = levels[currentLevelIdx] || levels[0];

  // ── Repo / terminal state ─────────────────────────────────────────────────
  const [repoState, setRepoState] = useState<RepoState>(() =>
    JSON.parse(JSON.stringify(currentLevel.initialState))
  );
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [levelCommandsRun, setLevelCommandsRun] = useState<string[]>([]);

  // ── Window manager ────────────────────────────────────────────────────────
  const wm = useWindowManager(computeInitialWindows());
  const { windows, setWindows } = wm;

  // ── Zoom / Accessibility state per window ─────────────────────────────────
  const [zoomScales, setZoomScales] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('luna_git_zoom_scales');
    return saved ? JSON.parse(saved) : { instructions: 1.05 };
  });

  useEffect(() => {
    localStorage.setItem('luna_git_zoom_scales', JSON.stringify(zoomScales));
  }, [zoomScales]);

  const handleZoomIn = useCallback((id: string) => {
    setZoomScales(prev => {
      const current = prev[id] || 1.0;
      const next = Math.min(2.5, +(current + 0.15).toFixed(2));
      return { ...prev, [id]: next };
    });
  }, []);

  const handleZoomOut = useCallback((id: string) => {
    setZoomScales(prev => {
      const current = prev[id] || 1.0;
      const next = Math.max(0.6, +(current - 0.15).toFixed(2));
      return { ...prev, [id]: next };
    });
  }, []);

  const handleZoomReset = useCallback((id: string) => {
    setZoomScales(prev => ({ ...prev, [id]: 1.0 }));
  }, []);

  // Keyboard accessibility shortcuts for Ctrl + + / Ctrl + - / Ctrl + 0
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
          e.preventDefault();
          const activeWin = windows.find(w => w.active && w.isOpen && !w.isMinimized);
          const targetId = activeWin ? activeWin.id : 'instructions';
          handleZoomIn(targetId);
        } else if (e.key === '-' || e.code === 'NumpadSubtract') {
          e.preventDefault();
          const activeWin = windows.find(w => w.active && w.isOpen && !w.isMinimized);
          const targetId = activeWin ? activeWin.id : 'instructions';
          handleZoomOut(targetId);
        } else if (e.key === '0' || e.code === 'Numpad0') {
          e.preventDefault();
          const activeWin = windows.find(w => w.active && w.isOpen && !w.isMinimized);
          const targetId = activeWin ? activeWin.id : 'instructions';
          handleZoomReset(targetId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windows, handleZoomIn, handleZoomOut, handleZoomReset]);

  // ── Settings ──────────────────────────────────────────────────────────────
  const [bgTheme, setBgTheme] = useState<BgTheme>(
    () => (localStorage.getItem('luna_git_bg') as BgTheme) || 'bliss'
  );
  const [assistantChar, setAssistantChar] = useState<AssistantChar>(
    () => (localStorage.getItem('luna_git_assistant') as AssistantChar) || 'doge'
  );
  const [studentName, setStudentName] = useState<string>(
    () => localStorage.getItem('luna_git_student_name') || ''
  );
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem('xp_username') || 'Luka'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    () => localStorage.getItem('luna_git_sound') !== 'false'
  );

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  // ── Misc UI state ─────────────────────────────────────────────────────────
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [showBSOD, setShowBSOD] = useState(false);
  const [showSolitaire, setShowSolitaire] = useState(false);
  const [showLevelSuccessModal, setShowLevelSuccessModal] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ── Gitko assistant messages ──────────────────────────────────────────────
  const [gitkoMsg, setGitkoMsg] = useState<string>(INITIAL_GREETING);
  const [lastTaskMsg, setLastTaskMsg] = useState<string>(INITIAL_GREETING);
  const setTaskMsg = useCallback((msg: string) => {
    setGitkoMsg(msg);
    setLastTaskMsg(msg);
  }, []);

  // ── Drag / resize refs ────────────────────────────────────────────────────
  const dragInfo = useRef<{ winId: string; startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeInfo = useRef<{ winId: string; startWidth: number; startHeight: number; startX: number; startY: number } | null>(null);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const hrs = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (soundEnabledRef.current) playXpStartup();
    }, 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { localStorage.setItem('luna_git_bg', bgTheme); }, [bgTheme]);
  useEffect(() => { localStorage.setItem('luna_git_assistant', assistantChar); }, [assistantChar]);
  useEffect(() => { localStorage.setItem('luna_git_student_name', studentName); }, [studentName]);
  useEffect(() => { localStorage.setItem('luna_git_sound', soundEnabled ? 'true' : 'false'); }, [soundEnabled]);

  useEffect(() => {
    setRepoState(JSON.parse(JSON.stringify(currentLevel.initialState)));
    setTerminalHistory([{
      output: `Dobrodošli u Projekat "Kafić Luna" — ${currentLevel.title}\nUkucajte 'git help' da vidite podržane komande.`,
    }]);
    setTerminalInput('');
    setLevelCommandsRun([]);
    setTaskMsg(`${currentLevel.title}. Pogledaj zadatak u levom prozoru i unesi prvu komandu!`);
    localStorage.setItem('luna_git_current_level', currentLevelIdx.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevelIdx]);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current) return;
    const info = dragInfo.current;
    const dx = e.clientX - info.startX;
    const dy = e.clientY - info.startY;
    setWindows(prev => prev.map(w => w.id === info.winId
      ? {
          ...w,
          x: Math.max(0, Math.min(window.innerWidth - 100, info.winX + dx)),
          y: Math.max(0, Math.min(window.innerHeight - 80, info.winY + dy)),
        }
      : w
    ));
  };
  const handleGlobalMouseUp = () => {
    dragInfo.current = null;
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };
  const handleTitleBarMouseDown = (id: string, e: React.MouseEvent) => {
    if (isMobile) return;
    const win = windows.find(w => w.id === id);
    if (!win || win.isMaximized) return;
    wm.focusWindow(id);
    setIsStartOpen(false);
    dragInfo.current = { winId: id, startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalResizeMouseMove = (e: MouseEvent) => {
    if (!resizeInfo.current) return;
    const info = resizeInfo.current;
    const dx = e.clientX - info.startX;
    const dy = e.clientY - info.startY;
    const minW = 220;
    const minH = 160;
    setWindows(prev => prev.map(w => w.id === info.winId
      ? { ...w, w: Math.max(minW, info.startWidth + dx), h: Math.max(minH, info.startHeight + dy) }
      : w
    ));
  };
  const handleGlobalResizeMouseUp = () => {
    resizeInfo.current = null;
    document.removeEventListener('mousemove', handleGlobalResizeMouseMove);
    document.removeEventListener('mouseup', handleGlobalResizeMouseUp);
  };
  const handleResizeMouseDown = (id: string, e: React.MouseEvent) => {
    if (isMobile) return;
    e.stopPropagation();
    e.preventDefault();
    const win = windows.find(w => w.id === id);
    if (!win || win.isMaximized) return;
    wm.focusWindow(id);
    setIsStartOpen(false);
    resizeInfo.current = {
      winId: id,
      startWidth: win.w,
      startHeight: win.h,
      startX: e.clientX,
      startY: e.clientY,
    };
    document.addEventListener('mousemove', handleGlobalResizeMouseMove);
    document.addEventListener('mouseup', handleGlobalResizeMouseUp);
  };

  // ── Window control wrappers ───────────────────────────────────────────────
  const focusWindow = (id: string) => { wm.focusWindow(id); setIsStartOpen(false); };
  const toggleWindow = (id: string) => { wm.toggleWindow(id); setIsStartOpen(false); };
  const handleClose    = (id: string, e: React.MouseEvent) => { e.stopPropagation(); wm.closeWindow(id); };
  const handleMinimize = (id: string, e: React.MouseEvent) => { e.stopPropagation(); wm.minimizeWindow(id); };
  const handleMaximize = (id: string, e: React.MouseEvent) => { e.stopPropagation(); wm.maximizeWindow(id); };

  const onTaskItemClick = (win: WindowState) => {
    if (win.isMinimized) wm.focusWindow(win.id);
    else if (win.active) wm.minimizeWindow(win.id);
    else wm.focusWindow(win.id);
  };

  // ── Terminal submit ───────────────────────────────────────────────────────
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const currentHist: TerminalEntry[] = [...terminalHistory, { input: cmd, output: '' }];
    const result = executeGitCommand(repoState, cmd);

    if (result.error) {
      if (soundEnabled) playXpError();
      setTaskMsg(`Oops! Komanda '${cmd}' je prijavila grešku. Pogledaj ispis u terminalu ili potraži Hint levo!`);
      currentHist[currentHist.length - 1].output = result.output;
      currentHist[currentHist.length - 1].isError = true;
      setTerminalHistory(currentHist);
    } else {
      setRepoState(result.newState);
      currentHist[currentHist.length - 1].output = result.output;
      setTerminalHistory(currentHist);

      const updatedCommandsRun = [...levelCommandsRun];
      const typedCleaned = cmd.toLowerCase().trim().replace(/\s+/g, ' ');

      currentLevel.expectedCommands.forEach(expectedCmd => {
        const expectedCleaned = expectedCmd.toLowerCase().trim().replace(/\s+/g, ' ');
        if (
          typedCleaned.startsWith(expectedCleaned) ||
          (expectedCleaned === 'git checkout' && typedCleaned.startsWith('git switch')) ||
          (expectedCleaned === 'git switch' && typedCleaned.startsWith('git checkout'))
        ) {
          if (!updatedCommandsRun.includes(expectedCleaned)) {
            updatedCommandsRun.push(expectedCleaned);
          }
        }
      });

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

      const solved = currentLevel.validate(result.newState, updatedCommandsRun);
      const allExpectedRun = currentLevel.expectedCommands.length === 0 || currentLevel.expectedCommands.every(cmdName => {
        const cleanedExpected = cmdName.toLowerCase().trim();
        if (cleanedExpected === 'git checkout' || cleanedExpected === 'git switch') {
          return updatedCommandsRun.includes('git checkout') || updatedCommandsRun.includes('git switch');
        }
        return updatedCommandsRun.includes(cleanedExpected);
      });

      if (solved && allExpectedRun) {
        if (soundEnabled) playXpSuccess();
        setTaskMsg('Fenomenalno! Uspešno si rešio sve zadatke za ovu lekciju! Pređi na sledeći korak.');
        const nextCompleted = Array.from(new Set([...completedLevels, currentLevel.id]));
        setCompletedLevels(nextCompleted);
        localStorage.setItem('luna_git_completed', JSON.stringify(nextCompleted));
        setShowLevelSuccessModal(true);
      } else if (solved && !allExpectedRun) {
        const missingCmds = currentLevel.expectedCommands.filter(cmdName => {
          const cleaned = cmdName.toLowerCase().trim();
          if (cleaned === 'git checkout' || cleaned === 'git switch') {
            return !updatedCommandsRun.includes('git checkout') && !updatedCommandsRun.includes('git switch');
          }
          return !updatedCommandsRun.includes(cleaned);
        });
        setTaskMsg(`Skoro gotovo! Preostalo je da isprobaš i komandu: ${missingCmds.join(', ')}!`);
      } else {
        setTaskMsg('Odličan korak! Nastavi da pratiš uputstvo i unesi sledeću komandu.');
      }
    }

    setTerminalInput('');
  };

  // ── Level navigation ──────────────────────────────────────────────────────
  const handleNextLevel = () => {
    setShowLevelSuccessModal(false);
    if (currentLevelIdx < levels.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
    } else {
      setShowSolitaire(true);
      setTaskMsg('ČESTITAMO! Uspešno si prošao kompletan kurs za Git na projektu Kafić Luna!');
    }
  };

  const resetAllProgress = () => {
    if (window.confirm('Da li ste sigurni da želite da obrišete kompletan napredak u učenju?')) {
      localStorage.removeItem('luna_git_current_level');
      localStorage.removeItem('luna_git_completed');
      setCompletedLevels([]);
      setCurrentLevelIdx(0);
      setShowSolitaire(false);
      setIsStartOpen(false);
      setWindows(computeInitialWindows());
    }
  };

  const resetCurrentLevel = () => {
    if (
      window.confirm(
        `Da li ste sigurni da želite da resetujete stanje za trenutnu lekciju "${currentLevel.title}"?`
      )
    ) {
      setRepoState(JSON.parse(JSON.stringify(currentLevel.initialState)));
      setLevelCommandsRun([]);
      setTerminalHistory([{
        input: 'clear',
        output: `Stanje za lekciju "${currentLevel.title}" je uspešno resetovano.\nUnesite komandu...`,
      }]);
      if (soundEnabled) playTone(400, 0, 0.25, 'sine');
      setIsStartOpen(false);
    }
  };

  // ── Settings handlers ─────────────────────────────────────────────────────
  const handleSaveUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('xp_username', name);
  };

  const handleChangeAssistant = (a: AssistantChar) => {
    setAssistantChar(a);
    const welcomeMsgs: Record<AssistantChar, string> = {
      doge:  'Vau! Gitko Doge je ponovo tu! Mnogo git, vrlo Kafić Luna!',
      snake: 'Snake ovde. Spreman za rad na projektu Kafić Luna. Pazi se!',
      bonzi: 'Zdravo! Ja sam tvoj najbolji ljubičasti drugar BonziBuddy!',
    };
    setGitkoMsg(welcomeMsgs[a]);
  };

  // ── Start menu actions ────────────────────────────────────────────────────
  const handleStartLearning = () => {
    setCurrentLevelIdx(0);
    setIsStartOpen(false);
  };

  const handleContinueProgress = () => {
    const nextLevelId =
      completedLevels.length > 0
        ? Math.min(Math.max(...completedLevels) + 1, levels.length)
        : 1;
    const nextIdx = levels.findIndex(l => l.id === nextLevelId);
    if (nextIdx !== -1) setCurrentLevelIdx(nextIdx);
    setIsStartOpen(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const hasActiveWindow = windows.some(w => w.isOpen && !w.isMinimized);

  return (
    <div
      className={`xp-desktop ${hasActiveWindow ? 'xp-desktop-has-active-window' : ''}`}
      style={bgStyles[bgTheme]}
    >
      {showBSOD && <Bsod onClose={() => setShowBSOD(false)} soundEnabled={soundEnabled} />}

      {showSolitaire && (
        <SolitaireCascade
          onClose={() => setShowSolitaire(false)}
          onRestart={resetAllProgress}
        />
      )}

      <DesktopIcons onToggle={toggleWindow} />

      {windows.map(win => {
        if (!win.isOpen || win.isMinimized) return null;
        return (
          <XpWindow
            key={win.id}
            win={win}
            isMobile={isMobile}
            resizable={RESIZABLE_IDS.has(win.id)}
            zoomScale={zoomScales[win.id] || 1.0}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onFocus={focusWindow}
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onTitleBarMouseDown={handleTitleBarMouseDown}
            onResizeMouseDown={handleResizeMouseDown}
          >
            {win.id === 'instructions' && (
              <InstructionsWindow
                win={win}
                isMobile={isMobile}
                currentLevel={currentLevel}
                currentLevelIdx={currentLevelIdx}
                setCurrentLevelIdx={setCurrentLevelIdx}
                completedLevels={completedLevels}
                setShowSolitaire={setShowSolitaire}
                onOpenVideo={() => wm.focusWindow('videoLesson')}
              />
            )}

            {win.id === 'graph' && (() => {
              const actualWidth = isMobile
                ? window.innerWidth
                : (win.isMaximized ? window.innerWidth : win.w);
              const graphScale = isMobile ? (actualWidth / 420) : (actualWidth / 520);
              const fontMul = Math.max(0.7, Math.min(1.35, graphScale));
              return <GitGraph state={repoState} fontSizeMultiplier={fontMul} />;
            })()}

            {win.id === 'projectExplorer' && (
              <ProjectExplorerWindow
                win={win}
                isMobile={isMobile}
                repoState={repoState}
                setRepoState={setRepoState}
                currentLevel={currentLevel}
                soundEnabled={soundEnabled}
              />
            )}

            {win.id === 'terminal' && (
              <TerminalWindow
                win={win}
                isMobile={isMobile}
                currentLevel={currentLevel}
                terminalHistory={terminalHistory}
                terminalInput={terminalInput}
                setTerminalInput={setTerminalInput}
                onSubmit={handleTerminalSubmit}
                onResetLevel={resetCurrentLevel}
                soundEnabled={soundEnabled}
                setGitkoMsg={setGitkoMsg}
              />
            )}

            {win.id === 'liveBrowser' && (
              <LiveBrowserWindow
                win={win}
                isMobile={isMobile}
                repoState={repoState}
                currentLevel={currentLevel}
              />
            )}

            {win.id === 'videoLesson' && (
              <VideoLessonWindow
                win={win}
                isMobile={isMobile}
                onOpenCertificate={() => {
                  wm.closeWindow('videoLesson');
                  wm.focusWindow('certificate');
                }}
              />
            )}

            {win.id === 'credits' && <CreditsWindow />}

            {win.id === 'controlPanel' && (
              <ControlPanelWindow
                bgTheme={bgTheme}
                onChangeTheme={setBgTheme}
                assistantChar={assistantChar}
                onChangeAssistant={handleChangeAssistant}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(s => !s)}
                userName={userName}
                onSaveUserName={handleSaveUserName}
              />
            )}

            {win.id === 'trivia' && (
              <TriviaWindow
                assistantChar={assistantChar}
                soundEnabled={soundEnabled}
                setGitkoMsg={setGitkoMsg}
              />
            )}

            {win.id === 'certificate' && (
              <CertificateWindow
                completedLevels={completedLevels}
                studentName={studentName}
                setStudentName={setStudentName}
                assistantChar={assistantChar}
              />
            )}
          </XpWindow>
        );
      })}

      <Gitko
        assistantChar={assistantChar}
        message={gitkoMsg}
        lastTaskMsg={lastTaskMsg}
        soundEnabled={soundEnabled}
        onMessageChange={setGitkoMsg}
      />

      <LevelSuccessModal
        open={showLevelSuccessModal}
        levelTitle={currentLevel.title}
        onClose={() => setShowLevelSuccessModal(false)}
        onNext={handleNextLevel}
      />

      <Taskbar
        windows={windows}
        onStartToggle={() => setIsStartOpen(o => !o)}
        onTaskItemClick={onTaskItemClick}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(s => !s)}
        timeStr={timeStr}
      />

      {isStartOpen && (
        <StartMenu
          userName={userName}
          onStartLearning={handleStartLearning}
          onOpen={toggleWindow}
          onContinueProgress={handleContinueProgress}
          onResetCurrent={resetCurrentLevel}
          onResetAll={resetAllProgress}
          onCrash={() => { setShowBSOD(true); setIsStartOpen(false); }}
        />
      )}
    </div>
  );
};

export default App;
