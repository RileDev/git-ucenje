import React from 'react';

interface StartMenuProps {
  userName: string;
  onStartLearning: () => void;
  onOpen: (id: string) => void;
  onContinueProgress: () => void;
  onResetCurrent: () => void;
  onResetAll: () => void;
  onCrash: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  userName,
  onStartLearning,
  onOpen,
  onContinueProgress,
  onResetCurrent,
  onResetAll,
  onCrash,
}) => (
  <div className="xp-start-menu">
    <div className="xp-start-header">
      <div className="xp-start-avatar">👤</div>
      <div>
        <div>{userName}</div>
        <div style={{ fontSize: 9, fontWeight: 'normal', textShadow: 'none', color: '#c3d5ff' }}>
          Administrator
        </div>
      </div>
    </div>

    <div className="xp-start-content">
      <div className="xp-start-left">
        <div className="xp-start-item" onClick={onStartLearning}>
          <img src="xp-computer.png" alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <div>
            <strong>Pokreni program za učenje</strong>
            <div className="xp-start-item-subtext">Počni od prvog nivoa</div>
          </div>
        </div>
        <div className="xp-start-item" onClick={() => onOpen('terminal')}>
          <img src="xp-terminal.png" alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <div>
            <strong>Git Command Prompt</strong>
            <div className="xp-start-item-subtext">Terminal za kucanje komandi</div>
          </div>
        </div>
        <div className="xp-start-item" onClick={() => onOpen('graph')}>
          <img src="xp-folder.png" alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <div>
            <strong>Git Graph Explorer</strong>
            <div className="xp-start-item-subtext">Vizuelni pregled stabla</div>
          </div>
        </div>
        <div className="xp-start-separator" />
        <div className="xp-start-item" style={{ marginTop: 'auto' }} onClick={() => onOpen('credits')}>
          <img src="xp-info.png" alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <div>
            <strong>About Luna Git</strong>
            <div className="xp-start-item-subtext">O autoru i predavanjima</div>
          </div>
        </div>
      </div>

      <div className="xp-start-right">
        <div className="xp-start-item" onClick={() => onOpen('instructions')}>
          <img src="xp-notepad.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
          <span>Uputstva za nivoe</span>
        </div>
        <div className="xp-start-item" onClick={onContinueProgress}>
          <img src="xp-game.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
          <span>Nastavi napredak</span>
        </div>
        <div className="xp-start-separator" />
        <div className="xp-start-item" onClick={() => onOpen('controlPanel')}>
          <img src="xp-control.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
          <span>Control Panel</span>
        </div>
        <div className="xp-start-item" onClick={() => onOpen('trivia')}>
          <img src="xp-game.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
          <span>Doge Trivia Kviz</span>
        </div>
        <div className="xp-start-item" onClick={() => onOpen('certificate')}>
          <img src="xp-certificate.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
          <span>XP Sertifikat</span>
        </div>
        <div className="xp-start-separator" />
        <div className="xp-start-item" onClick={onResetCurrent}>
          <img src="xp-lightning.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
          <span>Resetuj trenutni nivo</span>
        </div>
        <div className="xp-start-item" onClick={onResetAll}>
          <img src="xp-refresh.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
          <span>Resetuj napredak</span>
        </div>
        <div className="xp-start-item" onClick={onCrash}>
          <img src="xp-fire.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 6 }} />
          <span>Crash System (BSOD)</span>
        </div>
      </div>
    </div>

    <div className="xp-start-footer">
      <div className="xp-footer-btn" onClick={onResetAll}>
        <img src="xp-key.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 4 }} />
        <span>Odjavi se (Log Off)</span>
      </div>
      <div className="xp-footer-btn" onClick={() => window.close()}>
        <img src="xp-shutdown.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain', marginRight: 4 }} />
        <span>Ugasi (Turn Off)</span>
      </div>
    </div>
  </div>
);
