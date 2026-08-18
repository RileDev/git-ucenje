import React, { useState } from 'react';
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
  onOpenVideo?: () => void;
}

export const InstructionsWindow: React.FC<Props> = ({
  win,
  isMobile,
  currentLevel,
  currentLevelIdx,
  setCurrentLevelIdx,
  completedLevels,
  setShowSolitaire,
  onOpenVideo,
}) => {
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);

  const actualWidth = isMobile
    ? window.innerWidth
    : (win.isMaximized ? window.innerWidth : win.w);
  const scale = isMobile ? (actualWidth / 400) : (actualWidth / 480);
  const catFontSize   = Math.max(isMobile ? 11 : 9,  Math.min(13, Math.floor(10.5 * scale)));
  const titleFontSize = Math.max(isMobile ? 16 : 13, Math.min(20, Math.floor(16   * scale)));
  const descFontSize  = Math.max(isMobile ? 13.5 : 10.5, Math.min(15, Math.floor(12 * scale)));
  const btnFontSize   = Math.max(10, Math.min(13, Math.floor(11.5 * scale)));

  const canAdvance =
    currentLevel.isReadingOnly ||
    completedLevels.includes(currentLevel.id) ||
    currentLevel.id <= Math.max(...completedLevels, 0) + 1;

  return (
    <div className="xp-level-panel" style={{ height: '100%', overflowY: 'auto', padding: 14, backgroundColor: '#ffffff', color: '#1e293b' }}>
      {/* Category & Level Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: 4,
        }}
      >
        <span style={{ fontSize: `${catFontSize}px`, fontWeight: 'bold', color: '#64748b' }}>
          {currentLevel.category.toUpperCase()}
        </span>
        <span style={{ fontSize: `${catFontSize}px`, fontWeight: 'bold', color: '#2563eb' }}>
          LEKCIJA {currentLevelIdx + 1} od {levels.length}
        </span>
      </div>

      {/* Lesson Title */}
      <h2
        style={{
          fontSize: `${titleFontSize}px`,
          color: '#1e3a8a',
          margin: '0 0 10px 0',
          fontWeight: 'bold',
        }}
      >
        {currentLevel.title}
      </h2>

      {/* Story & Why it matters / Description */}
      <div
        style={{ fontSize: `${descFontSize}px`, lineHeight: 1.5, marginBottom: 12 }}
        dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(currentLevel.description) }}
      />

      {/* Task Box (if not reading only) */}
      {!currentLevel.isReadingOnly && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            borderLeft: '4px solid #3b82f6',
            padding: '9px 12px',
            marginBottom: 12,
            borderRadius: '0 4px 4px 0',
            fontSize: `${descFontSize}px`,
          }}
        >
          <strong style={{ color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
            <span>⚡</span>
            <span>Tvoj Zadatak:</span>
          </strong>
          <div
            style={{ color: '#1e293b', fontWeight: '500', lineHeight: 1.5 }}
            dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(currentLevel.task) }}
          />
        </div>
      )}

      {/* Interactive Hints Accordion */}
      {!currentLevel.isReadingOnly && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {/* Hint 1 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
            <div
              onClick={() => setShowHint1(!showHint1)}
              style={{
                backgroundColor: '#f8fafc',
                padding: '5px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: `${descFontSize - 0.5}px`,
                fontWeight: '600',
                color: '#334155',
              }}
            >
              <span>💡 Hint 1 (Pojmovni nagoveštaj)</span>
              <span>{showHint1 ? '▲ Sakrij' : '▼ Prikaži'}</span>
            </div>
            {showHint1 && (
              <div style={{ padding: '8px 10px', backgroundColor: '#ffffff', fontSize: `${descFontSize - 1}px`, color: '#475569', lineHeight: 1.4 }}>
                {currentLevel.hint1}
              </div>
            )}
          </div>

          {/* Hint 2 */}
          <div style={{ border: '1px solid #fed7aa', borderRadius: 4, overflow: 'hidden' }}>
            <div
              onClick={() => setShowHint2(!showHint2)}
              style={{
                backgroundColor: '#fff7ed',
                padding: '5px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: `${descFontSize - 0.5}px`,
                fontWeight: '600',
                color: '#9a3412',
              }}
            >
              <span>🔑 Hint 2 (Tačna komanda / Rešenje)</span>
              <span>{showHint2 ? '▲ Sakrij' : '▼ Otključaj'}</span>
            </div>
            {showHint2 && (
              <div
                style={{
                  padding: '8px 10px',
                  backgroundColor: '#fffbeb',
                  fontSize: `${descFontSize - 1}px`,
                  fontFamily: 'monospace',
                  color: '#9a3412',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {currentLevel.hint2}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Overview Pill */}
      {currentLevel.quickOverview && (
        <div
          style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            padding: '6px 10px',
            fontSize: `${descFontSize - 1}px`,
            color: '#334155',
            marginBottom: 12,
          }}
        >
          <strong>📋 Brzi pregled:</strong> {currentLevel.quickOverview}
        </div>
      )}

      {/* Video Lesson Special Button for Level 3 */}
      {currentLevel.levelNumber === 3 && onOpenVideo && (
        <div style={{ margin: '10px 0' }}>
          <button
            className="xp-button xp-button-primary"
            onClick={onOpenVideo}
            style={{ width: '100%', padding: '6px 12px', fontSize: `${btnFontSize + 1}px`, fontWeight: 'bold' }}
          >
            🎬 Otvori Video Plejer za Nivo 3
          </button>
        </div>
      )}

      {/* Navigation Buttons Footer */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          gap: 8,
          paddingTop: 10,
          borderTop: '1px solid #e2e8f0',
        }}
      >
        {currentLevelIdx > 0 && (
          <button
            className="xp-button"
            onClick={() => {
              setShowHint1(false);
              setShowHint2(false);
              setCurrentLevelIdx(prev => prev - 1);
            }}
            style={{ fontSize: `${btnFontSize}px`, padding: '3px 8px' }}
          >
            ◀ Prethodna
          </button>
        )}
        <button
          className="xp-button xp-button-primary"
          disabled={!canAdvance}
          onClick={() => {
            setShowHint1(false);
            setShowHint2(false);
            if (currentLevelIdx < levels.length - 1) {
              setCurrentLevelIdx(prev => prev + 1);
            } else {
              setShowSolitaire(true);
            }
          }}
          style={{ fontSize: `${btnFontSize}px`, padding: '3px 10px', marginLeft: 'auto' }}
        >
          Sledeća lekcija {canAdvance ? '🔓' : '🔒'}
        </button>
      </div>
    </div>
  );
};
