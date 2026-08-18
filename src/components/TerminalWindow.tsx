import React, { useEffect, useRef } from 'react';
import type { Level } from '../levelsData';
import type { TerminalEntry, WindowState } from '../types';
import { playTone } from '../audio';

interface Props {
  win: WindowState;
  isMobile: boolean;
  currentLevel: Level;
  terminalHistory: TerminalEntry[];
  terminalInput: string;
  setTerminalInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResetLevel: () => void;
  soundEnabled: boolean;
  setGitkoMsg: (msg: string) => void;
}

export const TerminalWindow: React.FC<Props> = ({
  win,
  isMobile,
  currentLevel,
  terminalHistory,
  terminalInput,
  setTerminalInput,
  onSubmit,
  onResetLevel,
  soundEnabled,
  setGitkoMsg,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const actualWidth = isMobile
    ? window.innerWidth
    : (win.isMaximized ? window.innerWidth : win.w);
  const termScale = isMobile ? (actualWidth / 420) : (actualWidth / 520);
  const termFontSize = Math.max(isMobile ? 14.5 : 10, Math.min(20, Math.floor(14 * termScale)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 6px',
          backgroundColor: 'var(--xp-window-bg, #ece9d8)',
          borderBottom: '1px solid var(--xp-window-border, #7ea7fc)',
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: 11,
          color: '#000000',
          boxSizing: 'border-box',
        }}
      >
        <button
          className="xp-button"
          onClick={(e) => { e.stopPropagation(); onResetLevel(); }}
          style={{
            padding: '2px 8px',
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 'normal',
            cursor: 'pointer',
          }}
        >
          🔄 Resetuj nivo
        </button>
        <button
          className="xp-button"
          onClick={(e) => {
            e.stopPropagation();
            const hintText = currentLevel.hint1
              ? `${currentLevel.hint1}${currentLevel.hint2 ? '\nKljuč: ' + currentLevel.hint2 : ''}`
              : 'Pročitaj uputstvo za lekciju na levoj strani ekrana!';
            setGitkoMsg(hintText);
            if (soundEnabled) playTone(440, 0, 0.1, 'sine');
          }}
          style={{
            padding: '2px 8px',
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 'normal',
            cursor: 'pointer',
          }}
        >
          💡 Pomoć
        </button>
      </div>

      <div
        className="xp-terminal"
        style={{ flex: 1, fontSize: `${termFontSize}px` }}
        onClick={() => document.getElementById('term-input-field')?.focus()}
      >
        <div className="xp-terminal-history">
          {terminalHistory.map((h, i) => (
            <div key={i}>
              {h.input && (
                <div className="xp-terminal-input-row">
                  <span className="xp-terminal-prompt">luka@luna-xp:~$</span>
                  <span>{h.input}</span>
                </div>
              )}
              <div
                style={{
                  color: h.isError ? '#f87171' : '#10b981',
                  whiteSpace: 'pre-wrap',
                  marginTop: 3,
                }}
              >
                {h.output}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={onSubmit} className="xp-terminal-input-row">
          <span className="xp-terminal-prompt">luka@luna-xp:~$</span>
          <input
            id="term-input-field"
            type="text"
            className="xp-terminal-input"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};
