import React from 'react';

interface DesktopIconsProps {
  onToggle: (id: string) => void;
}

const icons: { id: string; label: string; img: string }[] = [
  { id: 'instructions',     label: 'Uputstvo',        img: 'xp-notepad.png'     },
  { id: 'graph',            label: 'Git Graf',        img: 'xp-folder.png'      },
  { id: 'projectExplorer',  label: 'Kafić Luna',      img: 'xp-computer.png'    },
  { id: 'terminal',         label: 'Git Terminal',    img: 'xp-terminal.png'    },
  { id: 'liveBrowser',      label: 'Live Web',        img: 'xp-palette.png'     },
  // { id: 'videoLesson',   label: 'Nivo 3 Video',    img: 'xp-info.png'        },
  { id: 'certificate',      label: 'Sertifikat',      img: 'xp-certificate.png' },
  { id: 'controlPanel',     label: 'Control Panel',   img: 'xp-control.png'     },
  { id: 'trivia',           label: 'Doge Kviz',       img: 'xp-game.png'        },
];

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onToggle }) => (
  <div className="xp-desktop-grid">
    {icons.map(i => (
      <div key={i.id} className="xp-desktop-icon" onClick={() => onToggle(i.id)}>
        <div className="xp-desktop-icon-img">
          <img src={i.img} alt={i.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="xp-desktop-icon-text">{i.label}</div>
      </div>
    ))}
  </div>
);
