import React from 'react';
import { levels } from '../levelsData';

interface Props {
  completedLevels: number[];
  hintsOpened: Record<number, { hint1: boolean; hint2: boolean }>;
  resetCounts: Record<number, number>;
  currentLevelId: number;
  onSelectLevel: (levelIdx: number) => void;
}

// Groups lessons by their `category` field (e.g. "Nivo 1: Osnove"), preserving array order —
// the same grouping the lesson titles already imply, just surfaced as an overview.
const groupByCategory = () => {
  const groups: { category: string; items: { level: (typeof levels)[number]; idx: number }[] }[] = [];
  levels.forEach((level, idx) => {
    const last = groups[groups.length - 1];
    if (last && last.category === level.category) {
      last.items.push({ level, idx });
    } else {
      groups.push({ category: level.category, items: [{ level, idx }] });
    }
  });
  return groups;
};

export const ProgressWindow: React.FC<Props> = ({
  completedLevels,
  hintsOpened,
  resetCounts,
  currentLevelId,
  onSelectLevel,
}) => {
  const groups = groupByCategory();
  const solvedCount = completedLevels.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', fontFamily: 'Tahoma, Arial, sans-serif' }}>
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #d4d0c8',
          backgroundColor: '#f1f5f9',
          fontSize: 12,
          color: '#334155',
          fontWeight: 'bold',
        }}
      >
        Rešeno {solvedCount} od {levels.length} lekcija — klikni na red da otvoriš tu lekciju.
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px' }}>
        {groups.map(group => (
          <div key={group.category} style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 'bold',
                color: '#64748b',
                textTransform: 'uppercase',
                padding: '6px 4px 3px 4px',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {group.category}
            </div>
            {group.items.map(({ level, idx }) => {
              const solved = completedLevels.includes(level.id);
              const isCurrent = level.id === currentLevelId;
              const hints = hintsOpened[level.id];
              const resets = resetCounts[level.id] ?? 0;
              return (
                <div
                  key={level.id}
                  onClick={() => onSelectLevel(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 6px',
                    borderRadius: 3,
                    cursor: 'pointer',
                    backgroundColor: isCurrent ? '#e0ecff' : 'transparent',
                    border: isCurrent ? '1px solid #93c5fd' : '1px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{solved ? '✅' : '⬜'}</span>
                  <span style={{ flex: 1, fontSize: 11.5, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {level.title}
                  </span>
                  {!level.isReadingOnly && (
                    <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', gap: 4, alignItems: 'center' }} title="Korišćeni hint-ovi">
                      {hints?.hint1 && <span title="Hint 1 pogledan">👁1</span>}
                      {hints?.hint2 && <span title="Hint 2 pogledan (tačno rešenje)">👁2</span>}
                    </span>
                  )}
                  {resets > 0 && (
                    <span
                      title="Broj resetovanja ove lekcije"
                      style={{
                        fontSize: 9.5,
                        color: '#92400e',
                        backgroundColor: '#fef3c7',
                        borderRadius: 3,
                        padding: '1px 5px',
                        fontWeight: 'bold',
                      }}
                    >
                      🔄 {resets}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
