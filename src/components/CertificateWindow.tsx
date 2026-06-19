import React from 'react';
import { levels } from '../levelsData';
import type { AssistantChar } from '../types';
import { assistantImage, assistantName } from '../assistant';

interface Props {
  completedLevels: number[];
  studentName: string;
  setStudentName: (s: string) => void;
  assistantChar: AssistantChar;
}

export const CertificateWindow: React.FC<Props> = ({
  completedLevels,
  studentName,
  setStudentName,
  assistantChar,
}) => {
  const isUnlocked =
    completedLevels.length >= levels.length ||
    completedLevels.includes(levels[levels.length - 1].id);

  if (!isUnlocked) {
    return (
      <div
        style={{
          padding: 30,
          textAlign: 'center',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 54, marginBottom: 20 }}>🔒</div>
        <h3 style={{ color: '#002e80', marginBottom: 10 }}>
          Luna Git Sertifikat je Zaključan!
        </h3>
        <p style={{ fontSize: 13, color: '#666', maxWidth: 400, marginBottom: 20, lineHeight: 1.6 }}>
          Da biste preuzeli ovaj ekskluzivni dokaz o Git pismenosti, morate završiti svih{' '}
          <strong>{levels.length} nivoa</strong>. Vaš trenutni napredak iznosi:
        </p>
        <div
          style={{
            width: '100%',
            maxWidth: 350,
            height: 22,
            backgroundColor: '#e0dfdb',
            border: '1px solid #999',
            padding: 2,
            borderRadius: 3,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: `${(completedLevels.length / levels.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(to bottom, #76c76c 0%, #3ca03c 100%)',
              transition: 'width 0.5s ease-in-out',
            }}
          />
        </div>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: '#333' }}>
          Završeno {completedLevels.length} od {levels.length} nivoa ({Math.round((completedLevels.length / levels.length) * 100)}%)
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 15,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="no-print"
        style={{
          display: 'flex',
          gap: 15,
          marginBottom: 15,
          alignItems: 'center',
          backgroundColor: '#f0f3fd',
          border: '1px solid #d3e2f9',
          padding: 10,
          borderRadius: 4,
        }}
      >
        <div style={{ flex: 1 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 'bold',
              color: '#002e80',
              display: 'block',
              marginBottom: 4,
            }}
          >
            Unesi svoje puno ime za sertifikat:
          </label>
          <input
            type="text"
            className="xp-terminal-input"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Ime i prezime"
            style={{
              backgroundColor: '#fff',
              color: '#000',
              border: '1px solid #99aab5',
              padding: 6,
              width: '100%',
              borderRadius: 3,
              fontFamily: 'sans-serif',
            }}
          />
        </div>
        <button
          className="xp-button xp-button-primary"
          onClick={() => window.print()}
          style={{ height: 34, alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          🖨️ Odštampaj / Sačuvaj PDF
        </button>
      </div>

      <div
        id="printable-certificate"
        style={{
          border: '12px double #d4af37',
          padding: 30,
          backgroundColor: '#faf8f0',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          fontFamily: "'Georgia', serif",
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          minHeight: 400,
          color: '#333',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 180,
            opacity: 0.04,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        >
          GIT
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 'bold',
            letterSpacing: 2,
            color: '#a08435',
            marginBottom: 15,
            zIndex: 1,
          }}
        >
          LUNA GIT EDUKATIVNA RETRO PLATFORMA
        </div>

        <h2
          style={{
            fontSize: 24,
            color: '#002e80',
            margin: '0 0 10px 0',
            fontWeight: 'bold',
            fontFamily: "'Georgia', serif",
            zIndex: 1,
          }}
        >
          SERTIFIKAT O STRUČNOSTI
        </h2>

        <div style={{ width: 80, height: 2, backgroundColor: '#d4af37', marginBottom: 20, zIndex: 1 }} />

        <p style={{ fontStyle: 'italic', fontSize: 13, color: '#666', marginBottom: 10, zIndex: 1 }}>
          Ovim se svečano i sa ponosom potvrđuje da je
        </p>

        <h1
          style={{
            fontSize: 28,
            color: '#111',
            fontWeight: 'bold',
            textDecoration: 'underline',
            margin: '10px 0 20px 0',
            minHeight: 38,
            fontFamily: "'Georgia', serif",
            zIndex: 1,
          }}
        >
          {studentName || 'Mladi Git Stručnjak'}
        </h1>

        <p
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: '#444',
            maxWidth: 500,
            marginBottom: 30,
            zIndex: 1,
          }}
        >
          uspešno savladao/la celokupni edukativni program učenja Git-a koji se sastoji od{' '}
          <strong>{levels.length} naprednih interaktivnih lekcija</strong>, i time stekao/la
          praktično znanje o kontroli verzija, grananju, spajanju koda, rešavanju konflikata,
          privremenom sklanjanju rada, i naprednoj prepravci istorije.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 'auto',
            padding: '0 20px',
            zIndex: 1,
            gap: 20,
            alignItems: 'flex-end',
          }}
        >
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div
              style={{
                fontStyle: 'italic',
                fontSize: 12,
                color: '#666',
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Prof. dr Igor Dejanović
            </div>
            <div
              style={{
                borderTop: '1px solid #999',
                paddingTop: 5,
                fontSize: 11,
                fontWeight: 'bold',
                color: '#555',
              }}
            >
              Autor predavanja (FTN)
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              width: 90,
              height: 90,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '4px dashed #d4af37',
                backgroundColor: '#fff9e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
              }}
            >
              <img
                src={assistantImage(assistantChar)}
                alt="Pečat"
                style={{ width: 45, height: 45, objectFit: 'contain', transform: 'rotate(-10deg)' }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                fontSize: 8,
                fontWeight: 'bold',
                color: '#d4af37',
                textTransform: 'uppercase',
                bottom: 2,
              }}
            >
              LUNA ODOBRENO
            </div>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div
              style={{
                fontStyle: 'italic',
                fontSize: 12,
                color: '#666',
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {assistantName(assistantChar)}
            </div>
            <div
              style={{
                borderTop: '1px solid #999',
                paddingTop: 5,
                fontSize: 11,
                fontWeight: 'bold',
                color: '#555',
              }}
            >
              Svedok obuke
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
