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
import './LunaTheme.css';

const initialWindows: WindowState[] = [
  { id: 'instructions',  title: 'Uputstvo za učenje',              icon: 'xp-notepad.png',     x: 30,  y: 40,  w: 480, h: 520, isOpen: true,  isMinimized: false, isMaximized: false, active: true  },
  { id: 'terminal',      title: 'Komandna linija (Terminal)',      icon: 'xp-terminal.png',    x: 540, y: 40,  w: 520, h: 250, isOpen: true,  isMinimized: false, isMaximized: false, active: false },
  { id: 'graph',         title: 'Vizuelni Git Graf',               icon: 'xp-folder.png',      x: 540, y: 310, w: 520, h: 250, isOpen: true,  isMinimized: false, isMaximized: false, active: false },
  { id: 'credits',       title: 'Zasluge i O Autoru',              icon: 'xp-info.png',        x: 200, y: 100, w: 450, h: 380, isOpen: false, isMinimized: false, isMaximized: false, active: false },
  { id: 'controlPanel',  title: 'Control Panel (Kontrolna Tabla)', icon: 'xp-control.png',     x: 100, y: 80,  w: 460, h: 400, isOpen: false, isMinimized: false, isMaximized: false, active: false },
  { id: 'trivia',        title: 'Doge Trivia Kviz',                icon: 'xp-game.png',        x: 120, y: 100, w: 460, h: 440, isOpen: false, isMinimized: false, isMaximized: false, active: false },
  { id: 'certificate',   title: 'Luna Git Sertifikat',             icon: 'xp-certificate.png', x: 140, y: 50,  w: 680, h: 520, isOpen: false, isMinimized: false, isMaximized: false, active: false },
];

const RESIZABLE_IDS = new Set(['instructions', 'terminal', 'graph']);

const INITIAL_GREETING =
  'Zdravo! Ja sam Gitko. Pokreni učenje klikom na "Pokreni program" u Start meniju ili osmotri prečice na radnoj površini!';

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
  const [repoState, setRepoState] = useState<RepoState>(() => currentLevel.initialState);
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [levelCommandsRun, setLevelCommandsRun] = useState<string[]>([]);

  // ── Window manager ────────────────────────────────────────────────────────
  const wm = useWindowManager(initialWindows);
  const { windows, setWindows } = wm;

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

  // Ref shadow of soundEnabled so the once-on-mount startup sound effect doesn't
  // close over a stale value (item #3).
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

  // ── Effects: viewport, clock, startup sound, persisters, level reset ──────
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
    setRepoState(currentLevel.initialState);
    setTerminalHistory([{
      output: `Dobrodošli na Nivo ${currentLevel.id}: ${currentLevel.title}\nUkucajte 'git help' da vidite podržane komande.`,
    }]);
    setTerminalInput('');
    setLevelCommandsRun([]);
    setTaskMsg(`Nivo ${currentLevel.id}: ${currentLevel.title}. Pročitaj uputstvo levo i unesi prvu komandu u terminal!`);
    localStorage.setItem('luna_git_current_level', currentLevelIdx.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevelIdx]);

  // ── Drag / resize handlers ────────────────────────────────────────────────
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
    let minW = 300;
    let minH = 200;
    if (info.winId === 'instructions') { minW = 480; minH = 520; }
    else if (info.winId === 'terminal') { minW = 520; minH = 250; }
    else if (info.winId === 'graph')    { minW = 520; minH = 250; }
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
      setTaskMsg(`Oops! Komanda '${cmd}' je prijavila grešku. Pogledaj ispis u terminalu ili klikni na 'Pomoć' na radnoj površini!`);
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
          (expectedCleaned === 'git checkout' && typedCleaned.startsWith('git switch'))
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

      const solved = currentLevel.validate(result.newState);
      const allExpectedRun = currentLevel.expectedCommands.every(cmdName => {
        const cleanedExpected = cmdName.toLowerCase().trim();
        if (cleanedExpected === 'git checkout') {
          return updatedCommandsRun.includes('git checkout') || updatedCommandsRun.includes('git switch');
        }
        return updatedCommandsRun.includes(cleanedExpected);
      });

      if (solved && allExpectedRun) {
        if (soundEnabled) playXpSuccess();
        setTaskMsg('Fenomenalno! Uspešno si rešio sve zadatke na ovom nivou! Pogledaj sledeći korak.');
        const nextCompleted = Array.from(new Set([...completedLevels, currentLevel.id]));
        setCompletedLevels(nextCompleted);
        localStorage.setItem('luna_git_completed', JSON.stringify(nextCompleted));
        setShowLevelSuccessModal(true);
      } else if (solved && !allExpectedRun) {
        const missingCmds = currentLevel.expectedCommands.filter(cmdName => {
          const cleaned = cmdName.toLowerCase().trim();
          if (cleaned === 'git checkout') {
            return !updatedCommandsRun.includes('git checkout') && !updatedCommandsRun.includes('git switch');
          }
          return !updatedCommandsRun.includes(cleaned);
        });
        setTaskMsg(`Skoro je gotovo! Uspešno ste podesili repozitorijum, ali da biste zaista savladali nivo, morate isprobati i preostale komande u uputstvu: ${missingCmds.join(', ')}!`);
      } else {
        setTaskMsg('Dobar korak! Nastavi dalje da pratiš uputstva kako bi rešio nivo.');
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
      setTaskMsg('ČESTITAMO! Uspešno si prošao kompletnu obuku za Git na srpskoj latinici u Luna Git platformi!');
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
      setWindows(prev => prev.map(w =>
        RESIZABLE_IDS.has(w.id) ? { ...w, isOpen: true } : w
      ));
    }
  };

  const resetCurrentLevel = () => {
    if (
      window.confirm(
        `Da li ste sigurni da želite da resetujete stanje za trenutni nivo "${currentLevel.title}"? Sve unete komande i stanje fajlova za ovaj nivo će biti vraćeni na početak.`
      )
    ) {
      setRepoState(JSON.parse(JSON.stringify(currentLevel.initialState)));
      setLevelCommandsRun([]);
      setTerminalHistory([{
        input: 'clear',
        output: `Stanje za nivo "${currentLevel.title}" je uspešno resetovano. Srećno učenje!\nUnesite prvu komandu...`,
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
      doge:  'Vau! Gitko Doge je ponovo tu! Mnogo git, vrlo grana!',
      snake: 'Snake ovde. Spreman za akciju na terenu. Pazi se!',
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
            onFocus={focusWindow}
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onTitleBarMouseDown={handleTitleBarMouseDown}
            onResizeMouseDown={handleResizeMouseDown}
          >
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
            {win.id === 'instructions' && (
              <InstructionsWindow
                win={win}
                isMobile={isMobile}
                currentLevel={currentLevel}
                currentLevelIdx={currentLevelIdx}
                setCurrentLevelIdx={setCurrentLevelIdx}
                completedLevels={completedLevels}
                setShowSolitaire={setShowSolitaire}
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
