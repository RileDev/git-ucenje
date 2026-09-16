import React from 'react';
import type { WindowState } from '../types';

interface Props {
  terminalWindow: WindowState | undefined;
  onDismiss: () => void;
}

// First-load only: dims the desktop except for a cutout over the Terminal window (a large
// box-shadow "hole", a standard CSS spotlight trick — no DOM measurement needed since the
// window's screen position already lives in `windows` state) with a short arrow/callout
// pointing at it. Dismissed by the button or by typing the first command.
export const IntroSpotlight: React.FC<Props> = ({ terminalWindow, onDismiss }) => {
  if (!terminalWindow || !terminalWindow.isOpen) return null;

  const { x, y, w, h } = terminalWindow;
  const calloutTop = Math.max(8, y - 76);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
      onClick={onDismiss}
    >
      {/* The cutout: a transparent box over the terminal, whose box-shadow dims everything else */}
      <div
        style={{
          position: 'absolute',
          top: y,
          left: x,
          width: w,
          height: h,
          borderRadius: 4,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          border: '2px solid #fbbf24',
          pointerEvents: 'none',
        }}
      />

      {/* Callout bubble pointing at the terminal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: calloutTop,
          left: x,
          maxWidth: Math.min(360, w),
          backgroundColor: '#fffbeb',
          border: '1px solid #fbbf24',
          borderRadius: 6,
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontFamily: 'Tahoma, Arial, sans-serif',
        }}
      >
        <div style={{ fontSize: 12.5, color: '#78350f', lineHeight: 1.5, marginBottom: 8 }}>
          👋 Dobrodošli! Ovde ukucavaš Git komande — prati zadatak u prozoru sa uputstvom (levo) i
          unesi svoju prvu komandu ovde 👇
        </div>
        <button className="xp-button xp-button-primary" onClick={onDismiss} style={{ fontSize: 11, padding: '3px 10px' }}>
          Razumem
        </button>
      </div>
    </div>
  );
};
