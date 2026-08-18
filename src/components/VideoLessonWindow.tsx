import React, { useState } from 'react';
import type { WindowState } from '../types';

interface Props {
  win: WindowState;
  isMobile: boolean;
  onOpenCertificate: () => void;
}

export const VideoLessonWindow: React.FC<Props> = ({
  win: _win,
  isMobile: _isMobile,
  onOpenCertificate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Tahoma, Arial, sans-serif' }}>
      {/* Video Player Container */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#000000',
          aspectRatio: '16/9',
          maxHeight: 260,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '2px solid #334155',
          overflow: 'hidden',
        }}
      >
        {/* Video Screen Content */}
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 42, marginBottom: 8, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>
            🎬
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: 16, color: '#60a5fa', fontWeight: 'bold' }}>
            Nivo 3: Git Remote & GitHub Masterclass
          </h3>
          <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', maxWidth: 380, lineHeight: 1.4 }}>
            Kompletan video vodič: Povezivanje projekta Kafić Luna na pravi GitHub, SSH autentifikacija, Pull Requests i timska saradnja.
          </p>
        </div>

        {/* Play Button Overlay */}
        <button
          onClick={() => {
            setIsPlaying(!isPlaying);
            if (!isPlaying) setVideoProgress(35);
          }}
          style={{
            position: 'absolute',
            backgroundColor: isPlaying ? 'rgba(37, 99, 235, 0.8)' : 'rgba(239, 68, 68, 0.9)',
            color: '#ffffff',
            border: '2px solid #ffffff',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            transition: 'all 0.2s ease',
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Video Control Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 11,
          }}
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: 14 }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setVideoProgress(Math.floor(pos * 100));
            }}
            style={{
              flex: 1,
              height: 5,
              backgroundColor: '#334155',
              borderRadius: 3,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${isPlaying ? Math.max(videoProgress, 40) : videoProgress}%`,
                height: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: 3,
              }}
            />
          </div>
          <span style={{ color: '#94a3b8', fontSize: 10 }}>
            {isPlaying ? '05:12' : '00:00'} / 14:25
          </span>
          <span style={{ cursor: 'pointer' }}>🔊</span>
          <span style={{ cursor: 'pointer' }}>⛶</span>
        </div>
      </div>

      {/* Video Outline & Topics */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, backgroundColor: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontSize: 13, color: '#38bdf8' }}>
            📑 Sadržaj Video Lekcije (Teme i Tajmstampovi):
          </h4>
          <button
            className="xp-button xp-button-primary"
            onClick={onOpenCertificate}
            style={{ fontSize: 11, padding: '3px 10px', fontWeight: 'bold' }}
          >
            🏆 Preuzmi Sertifikat
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
          {[
            { time: '00:00', title: 'Uvod u GitHub i distribuirani remote repozitorijum', desc: 'Zašto lokalni Git dobija punu snagu tek sa GitHub-om.' },
            { time: '02:30', title: 'Kreiranje repozitorijuma na GitHub.com', desc: 'Public vs Private, README, licenca i podešavanja.' },
            { time: '05:15', title: 'Povezivanje: git remote add origin i git push', desc: 'Postavljanje upstream grane i slanje koda na server.' },
            { time: '08:40', title: 'Timski rad: Pull Requests (PR) i Code Review', desc: 'Kako se predlažu, pregledaju i spajaju izmene u timu.' },
            { time: '11:20', title: 'Vibecoding sa AI asistentima i GitHub-om', desc: 'Najbolje prakse za kontrolu verzija u modernom razvoju.' },
          ].map(item => (
            <div
              key={item.time}
              style={{
                padding: 8,
                backgroundColor: '#1e293b',
                borderRadius: 4,
                borderLeft: '3px solid #38bdf8',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  backgroundColor: '#0369a1',
                  color: '#ffffff',
                  padding: '1px 5px',
                  borderRadius: 3,
                  fontSize: 10,
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                }}
              >
                {item.time}
              </span>
              <div>
                <strong style={{ color: '#f1f5f9', fontSize: 11 }}>{item.title}</strong>
                <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 10,
            backgroundColor: '#1e1b4b',
            border: '1px solid #4338ca',
            borderRadius: 6,
            fontSize: 11,
            color: '#c7d2fe',
            lineHeight: 1.5,
          }}
        >
          💡 <strong>Napomena:</strong> Nivo 3 nema zadataka ni hintova za kucanje u terminalu. Kada odgledaš video demonstraciju, klikni na dugme <strong>'Preuzmi Sertifikat'</strong> kako bi generisao svoj zvanični Luna Git sertifikat sa svojim imenom!
        </div>
      </div>
    </div>
  );
};
