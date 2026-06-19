import React from 'react';
import { playXpStartup } from '../audio';

interface BsodProps {
  onClose: () => void;
  soundEnabled: boolean;
}

export const Bsod: React.FC<BsodProps> = ({ onClose, soundEnabled }) => {
  return (
    <div className="xp-bsod">
      <div className="xp-bsod-header">LUNA_GIT_SYSTEM_FAILURE</div>
      <p>Došlo je do neočekivane greške u sistemu tokom emulacije Git komandi.</p>
      <p>Ukoliko vidite ovaj ekran po prvi put, opustite se i restartujte računar. Ako se problem ponovi, proverite da li ste pravilno savladali razliku između `git merge` i `git rebase` po predavanjima prof. dr Igora Dejanovića.</p>
      <p>Tehničke informacije:</p>
      <p>*** STOP: 0x000000D1 (0x0000000C, 0x00000002, 0x00000000, 0xF86B5A89)<br />*** luna_git_engine.sys - Address F86B5A89 base at F86B0000, DateStamp 36b072a3</p>
      <p>Kliknite na dugme ispod za brzi restart operativnog sistema:</p>
      <button
        className="xp-bsod-btn"
        onClick={() => {
          onClose();
          if (soundEnabled) playXpStartup();
        }}
      >
        Restartuj računar (Reboot)
      </button>
    </div>
  );
};
