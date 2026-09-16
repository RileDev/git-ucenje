import React, { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const CONFIRM_WORD = 'RESETUJ';

// Requires typing a confirmation word before the destructive button enables — this is the one
// truly irreversible action in the app (wipes all completed lessons, saved commit messages,
// hint/reset history), so it gets a stronger guard than the plain window.confirm() used
// elsewhere (e.g. resetting a single lesson).
export const ConfirmResetModal: React.FC<Props> = ({ open, onCancel, onConfirm }) => {
  const [typed, setTyped] = useState('');

  // Reset the typed word on close from any path (×, Otkaži, Escape, or a successful confirm) —
  // done in the handlers rather than an effect watching `open`, since this component stays
  // mounted across opens/closes and resetting-on-prop-change belongs to the event that closed it,
  // not to a render effect.
  const handleCancel = () => { setTyped(''); onCancel(); };
  const handleConfirm = () => { setTyped(''); onConfirm(); };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); handleCancel(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const canConfirm = typed.trim().toUpperCase() === CONFIRM_WORD;

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
      <div className="xp-window" style={{ width: 400, position: 'relative' }}>
        <div className="xp-window-titlebar">
          <div className="xp-window-title"><span>⚠️ Obriši kompletan napredak</span></div>
          <div className="xp-window-controls">
            <div className="xp-control-btn xp-btn-close" onClick={handleCancel}>×</div>
          </div>
        </div>
        <div className="xp-dialog">
          <div className="xp-dialog-row">
            <div className="xp-dialog-icon" style={{ fontSize: 32 }}>🗑️</div>
            <div>
              <h4 style={{ fontWeight: 'bold', color: '#b91c1c' }}>Ovo se ne može opozvati!</h4>
              <p style={{ marginTop: 5, fontSize: 12.5, lineHeight: 1.5 }}>
                Briše se sav rešeni napredak, sačuvane poruke commit-ova koje si sam/a napisao/la,
                i istorija hint-ova/resetovanja za svaku lekciju. Za potvrdu, otkucaj{' '}
                <strong>{CONFIRM_WORD}</strong> u polje ispod.
              </p>
            </div>
          </div>
          <input
            type="text"
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && canConfirm) handleConfirm(); }}
            placeholder={CONFIRM_WORD}
            className="xp-terminal-input"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              backgroundColor: '#fff',
              color: '#000',
              border: '1px solid #99aab5',
              padding: 6,
              margin: '8px 0 4px 0',
              fontFamily: 'monospace',
              letterSpacing: 1,
            }}
          />
          <div className="xp-dialog-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="xp-button" onClick={handleCancel}>Otkaži</button>
            <button
              className="xp-button xp-button-primary"
              disabled={!canConfirm}
              onClick={handleConfirm}
              style={{ fontWeight: 'bold', opacity: canConfirm ? 1 : 0.5, cursor: canConfirm ? 'pointer' : 'default' }}
            >
              🗑️ Obriši sve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
