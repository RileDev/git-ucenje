import React from 'react';
import type { WindowState } from '../types';

interface TaskbarProps {
  windows: WindowState[];
  onStartToggle: () => void;
  onTaskItemClick: (win: WindowState) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  timeStr: string;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  onStartToggle,
  onTaskItemClick,
  soundEnabled,
  onToggleSound,
  timeStr,
}) => (
  <div className="xp-taskbar">
    <button className="xp-start-btn" onClick={onStartToggle}>
      <img src="xp-start.png" alt="start logo" style={{ width: 18, height: 18, objectFit: 'contain' }} />
      <span>start</span>
    </button>

    <div className="xp-taskbar-tasks">
      {windows.filter(w => w.isOpen).map(win => (
        <div
          key={win.id}
          className={`xp-taskbar-item ${win.active && !win.isMinimized ? 'active' : ''}`}
          onClick={() => onTaskItemClick(win)}
        >
          {win.icon.endsWith('.png') ? (
            <img src={win.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
          ) : (
            <span className="xp-taskbar-icon">{win.icon}</span>
          )}
          <span className="xp-taskbar-text">{win.title}</span>
        </div>
      ))}
    </div>

    <div className="xp-systray">
      <div className="xp-systray-icons">
        <span
          style={{ cursor: 'pointer' }}
          onClick={onToggleSound}
          title={soundEnabled ? 'Isključi retro zvukove' : 'Uključi retro zvukove'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </span>
      </div>
      <div>{timeStr}</div>
    </div>
  </div>
);
