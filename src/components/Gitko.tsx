import React, { useEffect, useState } from 'react';
import type { AssistantChar } from '../types';
import { assistantImage, assistantName, assistantWelcome } from '../assistant';
import { playTone } from '../audio';

interface GitkoProps {
  assistantChar: AssistantChar;
  message: string;
  lastTaskMsg: string;
  soundEnabled: boolean;
  onMessageChange: (msg: string) => void;
}

const AUTO_HIDE_MS = 8000;

export const Gitko: React.FC<GitkoProps> = ({
  assistantChar,
  message,
  lastTaskMsg,
  soundEnabled,
  onMessageChange,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  // Auto-hide timer — paused while the user is hovering the bubble so longer
  // messages can be read without disappearing mid-sentence.
  useEffect(() => {
    if (!message || isHovering) return;
    const t = setTimeout(() => onMessageChange(''), AUTO_HIDE_MS);
    return () => clearTimeout(t);
  }, [message, isHovering, onMessageChange]);

  const welcome = assistantWelcome(assistantChar);

  const handleClick = () => {
    if (!message) {
      // When hidden, prefer the latest task message (likelier to be useful) and
      // fall back to the welcome blurb if nothing has happened yet.
      onMessageChange(lastTaskMsg && lastTaskMsg !== welcome ? lastTaskMsg : welcome);
    } else if (message === welcome) {
      onMessageChange(lastTaskMsg || welcome);
    } else {
      onMessageChange(welcome);
    }
    if (soundEnabled) playTone(440, 0, 0.15, 'sine');
  };

  // When the bubble is hidden but a meaningful task message exists, pulse the
  // character + show a small chat badge so the user knows it is interactive.
  const showHint = !message && Boolean(lastTaskMsg);

  return (
    <div className="xp-gitko-container">
      {message && (
        <div
          className="xp-gitko-bubble"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {message}
        </div>
      )}
      <div
        className={`xp-gitko-char ${showHint ? 'xp-gitko-char-pulse' : ''}`}
        onClick={handleClick}
        title={message ? 'Klikni za drugu poruku' : 'Klikni za poruku'}
      >
        <img
          src={assistantImage(assistantChar)}
          alt={assistantName(assistantChar)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        {showHint && (
          <div className="xp-gitko-badge" aria-hidden="true">💬</div>
        )}
      </div>
    </div>
  );
};
