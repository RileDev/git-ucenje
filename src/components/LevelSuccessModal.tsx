import React, { useEffect } from 'react';

interface Props {
  open: boolean;
  levelTitle: string;
  onClose: () => void;
  onNext: () => void;
}

export const LevelSuccessModal: React.FC<Props> = ({ open, levelTitle, onClose, onNext }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  // Fixed confetti pieces — period-appropriate colors, CSS-only, no library.
  const confettiColors = ['#3b82f6', '#facc15', '#22c55e', '#ef4444', '#a855f7', '#fb923c'];
  const confettiPieces = Array.from({ length: 24 }, (_, i) => ({
    left: (i * 41 + 7) % 100,
    delay: (i % 8) * 0.08,
    duration: 1.6 + (i % 5) * 0.25,
    color: confettiColors[i % confettiColors.length],
    rotate: (i * 53) % 360,
  }));

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div className="xp-window" style={{ width: 380, position: 'relative', overflow: 'visible' }}>
        <div className="xp-confetti-layer" aria-hidden="true">
          {confettiPieces.map((p, i) => (
            <span
              key={i}
              className="xp-confetti-piece"
              style={{
                left: `${p.left}%`,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                // Consumed by the confetti-fall keyframe (a plain inline `transform` would be
                // overridden by the animation's own transform values from frame 0).
                ['--confetti-rotate' as string]: `${p.rotate}deg`,
              }}
            />
          ))}
        </div>
        <div className="xp-window-titlebar">
          <div className="xp-window-title"><span>🎉 Nivo rešen!</span></div>
          <div className="xp-window-controls">
            <div className="xp-control-btn xp-btn-close" onClick={onClose}>×</div>
          </div>
        </div>
        <div className="xp-dialog">
          <div className="xp-dialog-row">
            <div className="xp-dialog-icon" style={{ fontSize: 32 }}>🏆</div>
            <div>
              <h4 style={{ fontWeight: 'bold', color: '#002e80' }}>Čestitamo!</h4>
              <p style={{ marginTop: 5 }}>Uspešno ste rešili nivo: <strong>{levelTitle}</strong>!</p>
            </div>
          </div>
          <div className="xp-dialog-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="xp-button" onClick={() => { onClose(); onNext(); }}>Novi nivo</button>
            <button
              className="xp-button xp-button-primary"
              onClick={onClose}
              style={{ fontWeight: 'bold' }}
              autoFocus
            >
              Zatvori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
