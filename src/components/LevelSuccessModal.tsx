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
      }}
    >
      <div className="xp-window" style={{ width: 380, position: 'relative' }}>
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
