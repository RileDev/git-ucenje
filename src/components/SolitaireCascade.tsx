import React, { useEffect, useRef } from 'react';
import { levels } from '../levelsData';

interface SolitaireCascadeProps {
  onClose: () => void;
  onRestart: () => void;
}

export const SolitaireCascade: React.FC<SolitaireCascadeProps> = ({ onClose, onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animId = 0;

    interface Card { x: number; y: number; vx: number; vy: number; color: string; title: string; }

    const activeCards: Card[] = [];
    const colors = ['#245ddb', '#3c9d3c', '#c43c16', '#ff8c00', '#8a2be2'];
    const gitTerms = ['GIT', 'COMMIT', 'BRANCH', 'MERGE', 'PUSH', 'PULL', 'REBASE', 'CLONE'];

    const spawnCard = () => {
      activeCards.push({
        x: Math.random() * (canvas.width - 100) + 50,
        y: 50,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        title: gitTerms[Math.floor(Math.random() * gitTerms.length)],
      });
    };

    spawnCard();
    let spawnTimer = 0;

    const drawCard = (c: Card) => {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(c.x + 3, c.y + 3, 90, 130);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.x, c.y, 90, 130);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(c.x, c.y, 90, 130);

      ctx.fillStyle = c.color;
      ctx.fillRect(c.x + 1, c.y + 1, 88, 25);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Tahoma, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(c.title, c.x + 45, c.y + 18);

      ctx.font = '28px Arial';
      ctx.fillText('🌿', c.x + 45, c.y + 80);

      ctx.fillStyle = c.color;
      ctx.font = '9px monospace';
      ctx.fillText('v1.0', c.x + 75, c.y + 120);
    };

    const update = () => {
      spawnTimer++;
      if (spawnTimer % 22 === 0 && activeCards.length < 32) spawnCard();

      activeCards.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.25;

        if (c.x < 0 || c.x > canvas.width - 90) {
          c.vx = -c.vx * 0.9;
          c.x = c.x < 0 ? 0 : canvas.width - 90;
        }

        if (c.y > canvas.height - 130) {
          c.vy = -c.vy * 0.85;
          c.y = canvas.height - 130;
          if (Math.abs(c.vy) < 1.5) {
            c.y = 50;
            c.x = Math.random() * (canvas.width - 100) + 50;
            c.vx = (Math.random() - 0.5) * 8;
            c.vy = Math.random() * 4 + 2;
          }
        }

        drawCard(c);
      });

      animId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="solitaire-container">
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 225, 0.95)',
          border: '2px solid #245ddb',
          borderRadius: 6,
          padding: 30,
          textAlign: 'center',
          boxShadow: '10px 10px 30px rgba(0,0,0,0.5)',
          zIndex: 1000,
          maxWidth: 450,
          pointerEvents: 'auto',
        }}
      >
        <h2 style={{ color: '#002e80', fontWeight: 'bold', fontSize: 22, marginBottom: 15 }}>
          🎉 Svaka čast, genije! 🎉
        </h2>
        <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 20, color: '#333' }}>
          Završio si svih {levels.length} nivoa na platformi <strong>Luna Git</strong> i uspešno savladao teoriju prof. dr Igora Dejanovića na srpskom jeziku! Sada si spreman za rad na realnim projektima!
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="xp-button xp-button-primary" onClick={onClose}>Zatvori kaskadu</button>
          <button className="xp-button" onClick={onRestart}>Uči ispočetka</button>
        </div>
      </div>
    </div>
  );
};
