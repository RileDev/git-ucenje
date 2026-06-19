import React, { useState } from 'react';
import type { AssistantChar, BgTheme } from '../types';
import { playTone } from '../audio';

interface ControlPanelProps {
  bgTheme: BgTheme;
  onChangeTheme: (t: BgTheme) => void;
  assistantChar: AssistantChar;
  onChangeAssistant: (a: AssistantChar) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  userName: string;
  onSaveUserName: (name: string) => void;
}

const themes: { id: BgTheme; name: string }[] = [
  { id: 'bliss',   name: 'Bliss (XP Klasik)'             },
  { id: 'royale',  name: 'Royale Blue (Medijski centar)' },
  { id: 'zune',    name: 'Zune (Tamno narandžasto)'      },
  { id: 'classic', name: 'Classic Windows 2000'          },
];

const assistants: { id: AssistantChar; name: string; icon: string }[] = [
  { id: 'doge',  name: 'Gitko Doge',  icon: 'doge.png'  },
  { id: 'snake', name: 'Solid Snake', icon: 'snake.png' },
  { id: 'bonzi', name: 'BonziBuddy',  icon: 'bonzi.png' },
];

export const ControlPanelWindow: React.FC<ControlPanelProps> = ({
  bgTheme,
  onChangeTheme,
  assistantChar,
  onChangeAssistant,
  soundEnabled,
  onToggleSound,
  userName,
  onSaveUserName,
}) => {
  const [tempUserName, setTempUserName] = useState(userName);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);

  const handleSave = () => {
    const finalName = tempUserName.trim() || 'Luka';
    setTempUserName(finalName);
    onSaveUserName(finalName);
    setShowSaveFeedback(true);
    if (soundEnabled) {
      playTone(880, 0, 0.1, 'sine', 0.12);
      setTimeout(() => playTone(1100, 0, 0.15, 'sine', 0.12), 80);
    }
    setTimeout(() => setShowSaveFeedback(false), 2500);
  };

  return (
    <div
      style={{
        padding: 15,
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 15,
        boxSizing: 'border-box',
      }}
    >
      <h3
        style={{
          color: '#002e80',
          borderBottom: '2px solid #b0c9ea',
          paddingBottom: 4,
          margin: '0 0 10px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <img src="xp-control.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
        Podešavanja Ekosistema
      </h3>

      <div>
        <h4
          style={{
            fontWeight: 'bold',
            marginBottom: 8,
            color: '#333',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <img src="xp-palette.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
          Izaberi temu i izgled ekosistema (Themes)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {themes.map(t => (
            <button
              key={t.id}
              className={`xp-button ${bgTheme === t.id ? 'xp-button-primary' : ''}`}
              onClick={() => {
                onChangeTheme(t.id);
                if (soundEnabled) playTone(500, 0, 0.1, 'sine');
              }}
              style={{
                padding: 8,
                textAlign: 'left',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <img
                src={bgTheme === t.id ? 'xp-radio-on.png' : 'xp-radio-off.png'}
                alt=""
                style={{ width: 12, height: 12, objectFit: 'contain' }}
              />
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4
          style={{
            fontWeight: 'bold',
            marginBottom: 8,
            color: '#333',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <img src="xp-user.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
          Izaberi retro asistenta
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {assistants.map(a => (
            <button
              key={a.id}
              className={`xp-button ${assistantChar === a.id ? 'xp-button-primary' : ''}`}
              onClick={() => {
                onChangeAssistant(a.id);
                if (soundEnabled) playTone(600, 0, 0.1, 'sine');
              }}
              style={{
                padding: 8,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                justifyContent: 'center',
              }}
            >
              <img src={a.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
              {a.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4
          style={{
            fontWeight: 'bold',
            marginBottom: 8,
            color: '#333',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <img src="xp-sound.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
          Retro zvučni efekti
        </h4>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className={`xp-button ${soundEnabled ? 'xp-button-primary' : ''}`}
            onClick={() => {
              // Test-tone only fires when sound was off (the toggle is enabling it).
              const wasOff = !soundEnabled;
              onToggleSound();
              if (wasOff) setTimeout(() => playTone(600, 0, 0.15, 'sine'), 100);
            }}
            style={{
              flex: 1,
              padding: 8,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: 'center',
            }}
          >
            <img
              src={soundEnabled ? 'xp-sound.png' : 'xp-sound-off.png'}
              alt=""
              style={{ width: 16, height: 16, objectFit: 'contain' }}
            />
            {soundEnabled ? 'Uključeni retro zvukovi' : 'Zvukovi su isključeni'}
          </button>
        </div>
      </div>

      <div>
        <h4
          style={{
            fontWeight: 'bold',
            marginBottom: 8,
            color: '#333',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 16, marginRight: 4 }}>👤</span>
          Korisničko ime (Start Menu)
        </h4>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            className="xp-terminal-input"
            value={tempUserName}
            onChange={(e) => setTempUserName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            style={{
              flex: 1,
              backgroundColor: '#fff',
              color: '#000',
              border: '1px solid #7ea7fc',
              padding: '6px 8px',
              fontSize: 11,
              fontFamily: 'Tahoma, Arial, sans-serif',
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)',
              boxSizing: 'border-box',
              height: 26,
            }}
            placeholder="Promeni ime ovde..."
          />
          <button
            className="xp-button xp-button-primary"
            onClick={handleSave}
            style={{
              padding: '2px 12px',
              fontSize: 11,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            Sačuvaj
          </button>
        </div>
        {showSaveFeedback && (
          <div
            style={{
              marginTop: 6,
              fontSize: 11,
              color: '#008000',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              animation: 'fadeIn 0.2s ease-in-out',
            }}
          >
            <span>✓</span> Ime uspešno sačuvano!
          </div>
        )}
      </div>
    </div>
  );
};
