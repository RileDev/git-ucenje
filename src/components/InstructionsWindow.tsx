import React from 'react';
import type { Level } from '../levelsData';
import { levels } from '../levelsData';
import type { WindowState } from '../types';
import { parseMarkdownToHtml } from '../markdown';

interface Props {
  win: WindowState;
  isMobile: boolean;
  currentLevel: Level;
  currentLevelIdx: number;
  setCurrentLevelIdx: React.Dispatch<React.SetStateAction<number>>;
  completedLevels: number[];
  setShowSolitaire: (b: boolean) => void;
}

export const InstructionsWindow: React.FC<Props> = ({
  win,
  isMobile,
  currentLevel,
  currentLevelIdx,
  setCurrentLevelIdx,
  completedLevels,
  setShowSolitaire,
}) => {
  const actualWidth = isMobile
    ? window.innerWidth
    : (win.isMaximized ? window.innerWidth : win.w);
  const scale = isMobile ? (actualWidth / 400) : (actualWidth / 480);
  const catFontSize   = Math.max(isMobile ? 12.5 : 9,  Math.min(14, Math.floor(11   * scale)));
  const titleFontSize = Math.max(isMobile ? 18   : 14, Math.min(24, Math.floor(18   * scale)));
  const descFontSize  = Math.max(isMobile ? 15.5 : 11, Math.min(17, Math.floor(13   * scale)));
  const hintFontSize  = Math.max(isMobile ? 13.5 : 9,  Math.min(14, Math.floor(11.5 * scale)));
  const btnFontSize   = Math.max(10, Math.min(15, Math.floor(12 * scale)));

  const canAdvance =
    completedLevels.includes(currentLevel.id) ||
    currentLevel.id <= Math.max(...completedLevels, 0);

  return (
    <div className="xp-level-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 15,
        }}
      >
        <span style={{ fontSize: `${catFontSize}px`, fontWeight: 'bold', color: '#666' }}>
          KATEGORIJA: {currentLevel.category}
        </span>
        <span style={{ fontSize: `${catFontSize}px`, fontWeight: 'bold', color: '#245ddb' }}>
          NIVO {currentLevel.id} od {levels.length}
        </span>
      </div>

      <h2
        style={{
          fontSize: `${titleFontSize}px`,
          color: '#002e80',
          borderBottom: '2px solid #3b68c3',
          paddingBottom: 5,
        }}
      >
        {currentLevel.title}
      </h2>

      <div
        style={{ fontSize: `${descFontSize}px`, lineHeight: 1.6, margin: '15px 0' }}
        dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(currentLevel.description) }}
      />

      <div className="xp-level-box" style={{ fontSize: `${hintFontSize}px` }}>
        <strong>💡 Pomoć i Savet:</strong>
        <div
          style={{
            marginTop: 5,
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: `${hintFontSize}px`,
          }}
        >
          {currentLevel.hint}
        </div>
      </div>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          gap: 10,
          paddingTop: 10,
          borderTop: '1px solid #d4d0c8',
        }}
      >
        <button
          className="xp-button"
          disabled={currentLevelIdx === 0}
          onClick={() => setCurrentLevelIdx(prev => prev - 1)}
          style={{ fontSize: `${btnFontSize}px` }}
        >
          Prethodni nivo
        </button>
        <button
          className="xp-button xp-button-primary"
          disabled={!canAdvance}
          onClick={() => {
            if (currentLevelIdx < levels.length - 1) setCurrentLevelIdx(prev => prev + 1);
            else setShowSolitaire(true);
          }}
          style={{ fontSize: `${btnFontSize}px` }}
        >
          Sledeći nivo {canAdvance ? '🔓' : '🔒'}
        </button>
      </div>
    </div>
  );
};
