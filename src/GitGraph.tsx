import React, { useMemo } from 'react';
import { type RepoState, type Commit, getCommitList } from './gitEngine';

interface GitGraphProps {
  state: RepoState;
  fontSizeMultiplier?: number;
}

export const GitGraph: React.FC<GitGraphProps> = ({ state, fontSizeMultiplier = 1.0 }) => {
  const { commits, branches, head, remoteBranches, tags } = state;

  // Izračunavanje kolona (X) i redova (Y) za svaki commit
  const layout = useMemo(() => {
    const commitList = getCommitList(commits);
    if (commitList.length === 0) return { nodes: {}, edges: [] };

    const nodes: { [id: string]: { x: number; y: number; col: number; row: number; commit: Commit } } = {};
    const edges: { from: string; to: string; isMerge?: boolean }[] = [];

    // 1. Pronalaženje kolona (X) - redosled commit-ova
    const memoCol: { [id: string]: number } = {};
    const getCol = (id: string): number => {
      if (memoCol[id] !== undefined) return memoCol[id];
      const commit = commits[id];
      if (!commit || commit.parentIds.length === 0) {
        memoCol[id] = 0;
        return 0;
      }
      const parentCols = commit.parentIds.map(pId => getCol(pId));
      const col = Math.max(...parentCols) + 1;
      memoCol[id] = col;
      return col;
    };

    // 2. Pronalaženje redova (Y) po granama
    const memoRow: { [id: string]: number } = {};
    const branchRows: { [name: string]: number } = {
      main: 0,
      master: 0,
      'meni-sekcija': 1,
      'kontakt-forma': -1,
      develop: -1,
      feature: 1,
      'origin/main': 0
    };

    let nextRow = 2;

    const getRow = (id: string): number => {
      if (memoRow[id] !== undefined) return memoRow[id];
      const commit = commits[id];
      if (!commit) return 0;

      // Check pointing branches
      const pointing = Object.keys(branches).filter(b => branches[b] === id);
      if (pointing.length > 0) {
        for (const b of pointing) {
          if (branchRows[b] !== undefined) {
            memoRow[id] = branchRows[b];
            return branchRows[b];
          }
        }
        const assigned = nextRow++;
        branchRows[pointing[0]] = assigned;
        memoRow[id] = assigned;
        return assigned;
      }

      if (commit.parentIds.length > 0) {
        const parentRow = getRow(commit.parentIds[0]);
        memoRow[id] = parentRow;
        return parentRow;
      }

      memoRow[id] = 0;
      return 0;
    };

    commitList.forEach(c => {
      getCol(c.id);
      getRow(c.id);
    });

    const paddingX = 85;
    const paddingY = 55;
    const startX = 60;
    const centerY = 110;

    commitList.forEach(c => {
      const col = memoCol[c.id] || 0;
      const row = memoRow[c.id] || 0;

      nodes[c.id] = {
        x: startX + col * paddingX,
        y: centerY + row * paddingY,
        col,
        row,
        commit: c
      };

      c.parentIds.forEach((pId, idx) => {
        if (commits[pId]) {
          edges.push({ from: pId, to: c.id, isMerge: idx > 0 });
        }
      });
    });

    return { nodes, edges };
  }, [commits, branches]);

  // Sakupljanje oznaka (labels) za svaki commit
  const commitLabels = useMemo(() => {
    const labels: { [commitId: string]: { name: string; isRemote: boolean; isHead: boolean; isTag?: boolean }[] } = {};

    // Lokalne grane
    Object.keys(branches).forEach(bName => {
      const cId = branches[bName];
      if (!cId) return;
      if (!labels[cId]) labels[cId] = [];
      const isHead = head.type === 'branch' && head.target === bName;
      labels[cId].push({ name: bName, isRemote: false, isHead });
    });

    // Remote grane
    if (remoteBranches) {
      Object.keys(remoteBranches).forEach(bName => {
        const cId = remoteBranches[bName];
        if (!cId) return;
        if (!labels[cId]) labels[cId] = [];
        const exists = labels[cId].some(l => l.name === bName);
        if (!exists) {
          labels[cId].push({ name: bName, isRemote: true, isHead: false });
        }
      });
    }

    // Tagovi
    if (tags) {
      Object.keys(tags).forEach(tagName => {
        const cId = tags[tagName];
        if (!cId) return;
        if (!labels[cId]) labels[cId] = [];
        labels[cId].push({ name: `tag: ${tagName}`, isRemote: false, isHead: false, isTag: true });
      });
    }

    // Detached HEAD
    if (head.type === 'commit' && head.target) {
      const cId = head.target;
      if (labels[cId]) {
        const hasHead = labels[cId].some(l => l.isHead);
        if (!hasHead) {
          labels[cId].push({ name: 'HEAD', isRemote: false, isHead: true });
        }
      } else {
        labels[cId] = [{ name: 'HEAD', isRemote: false, isHead: true }];
      }
    }

    return labels;
  }, [branches, remoteBranches, tags, head]);

  const { nodes, edges } = layout;
  const nodeKeys = Object.keys(nodes);

  if (nodeKeys.length === 0) {
    const isInitialized = state.isInitialized === true || Object.keys(branches).length > 0 || head.target !== '';
    if (isInitialized) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            color: '#333',
            backgroundColor: '#f0f4fc',
            padding: '20px',
            textAlign: 'center',
            fontFamily: 'Tahoma, sans-serif',
          }}
        >
          <div style={{ fontSize: `${Math.floor(36 * fontSizeMultiplier)}px`, marginBottom: 8 }}>
            🌱
          </div>
          <h4 style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: 6, fontSize: `${Math.max(12, Math.floor(15 * fontSizeMultiplier))}px` }}>
            Repozitorijum je uspešno inicijalizovan!
          </h4>
          <p style={{ fontSize: `${Math.max(10, Math.floor(11.5 * fontSizeMultiplier))}px`, maxWidth: 300, lineHeight: 1.4, color: '#475569' }}>
            Nalaziš se na grani <strong style={{ color: '#2563eb' }}>main</strong>.<br />
            Dodaj fajlove sa <code style={{ backgroundColor: '#e2e8f0', padding: '1px 4px', borderRadius: 3 }}>git add .</code> i napravi prvi commit!
          </p>
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          color: '#666',
          backgroundColor: '#f8fafc',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'Tahoma, sans-serif',
        }}
      >
        <div style={{ fontSize: `${Math.floor(36 * fontSizeMultiplier)}px`, marginBottom: 8 }}>
          📁
        </div>
        <h4 style={{ fontWeight: 'bold', color: '#1e3a8a', marginBottom: 6, fontSize: `${Math.max(12, Math.floor(14.5 * fontSizeMultiplier))}px` }}>
          Repozitorijum nije inicijalizovan
        </h4>
        <p style={{ fontSize: `${Math.max(10, Math.floor(11 * fontSizeMultiplier))}px`, maxWidth: 280, color: '#64748b' }}>
          Ukucaj <code style={{ backgroundColor: '#e2e8f0', color: '#b91c1c', fontWeight: 'bold', padding: '2px 4px', borderRadius: 3 }}>git init</code> u terminal dole da započneš praćenje projekta <strong>Kafić Luna</strong>.
        </p>
      </div>
    );
  }

  // Calculate SVG bounds
  const maxX = Math.max(...Object.values(nodes).map(n => n.x), 350) + 90;
  const minY = Math.min(...Object.values(nodes).map(n => n.y), 40) - 40;
  const maxY = Math.max(...Object.values(nodes).map(n => n.y), 160) + 60;
  const svgHeight = Math.max(maxY - minY + 30, 220);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#ffffff',
        fontFamily: 'Tahoma, Arial, sans-serif',
      }}
    >
      <svg width={maxX} height={svgHeight} style={{ minWidth: '100%', minHeight: '100%' }}>
        <defs>
          <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="menuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="contactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Edges / Connections between commits */}
        {edges.map((e, idx) => {
          const fromNode = nodes[e.from];
          const toNode = nodes[e.to];
          if (!fromNode || !toNode) return null;

          const isCurve = fromNode.y !== toNode.y;
          const strokeColor = e.isMerge ? '#8b5cf6' : (fromNode.row === 1 ? '#10b981' : (fromNode.row === -1 ? '#a855f7' : '#3b82f6'));

          if (isCurve) {
            const midX = (fromNode.x + toNode.x) / 2;
            const pathData = `M ${fromNode.x} ${fromNode.y} C ${midX} ${fromNode.y}, ${midX} ${toNode.y}, ${toNode.x} ${toNode.y}`;
            return (
              <path
                key={`edge-${idx}`}
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={e.isMerge ? 3 : 2.5}
                strokeDasharray={e.isMerge ? '4 2' : 'none'}
              />
            );
          }

          return (
            <line
              key={`edge-${idx}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={strokeColor}
              strokeWidth={2.5}
            />
          );
        })}

        {/* Nodes / Commits */}
        {nodeKeys.map(cId => {
          const node = nodes[cId];
          const labels = commitLabels[cId] || [];
          const isCurrentHead = labels.some(l => l.isHead);
          const hasTag = labels.some(l => l.isTag);

          let nodeFill = 'url(#mainGrad)';
          if (node.row === 1) nodeFill = 'url(#menuGrad)';
          if (node.row === -1) nodeFill = 'url(#contactGrad)';
          if (node.commit.parentIds.length > 1) nodeFill = '#7c3aed';

          return (
            <g key={`node-${cId}`} filter="url(#shadow)">
              {/* Active HEAD Halo */}
              {isCurrentHead && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={19}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                />
              )}

              {/* Commit Circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={14}
                fill={nodeFill}
                stroke="#ffffff"
                strokeWidth={2}
                cursor="pointer"
              />

              {/* Commit ID Label */}
              <text
                x={node.x}
                y={node.y + 4}
                fill="#ffffff"
                fontSize={10}
                fontWeight="bold"
                textAnchor="middle"
                pointerEvents="none"
              >
                {cId}
              </text>

              {/* Branch / Tag Badges */}
              {labels.map((lbl, lIdx) => {
                const badgeY = node.y - 22 - lIdx * 19;
                const isHead = lbl.isHead;
                const isTag = lbl.isTag;
                const isRemote = lbl.isRemote;

                let badgeBg = '#2563eb';
                if (lbl.name.includes('meni')) badgeBg = '#059669';
                if (lbl.name.includes('kontakt')) badgeBg = '#7c3aed';
                if (isRemote) badgeBg = '#d97706';
                if (isTag) badgeBg = '#0891b2';
                if (lbl.name === 'HEAD') badgeBg = '#dc2626';

                return (
                  <g key={`lbl-${cId}-${lIdx}`}>
                    <rect
                      x={node.x - 30}
                      y={badgeY - 11}
                      width={60}
                      height={15}
                      rx={3}
                      fill={badgeBg}
                      stroke={isHead ? '#fbbf24' : '#ffffff'}
                      strokeWidth={isHead ? 1.5 : 0.8}
                    />
                    <text
                      x={node.x}
                      y={badgeY}
                      fill="#ffffff"
                      fontSize={9}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {lbl.name.length > 9 ? `${lbl.name.substring(0, 8)}…` : lbl.name}
                    </text>
                  </g>
                );
              })}

              {/* Commit Message snippet below */}
              <text
                x={node.x}
                y={node.y + 24}
                fill="#475569"
                fontSize={9.5}
                textAnchor="middle"
                fontWeight="500"
              >
                {node.commit.message.length > 14
                  ? `${node.commit.message.substring(0, 13)}…`
                  : node.commit.message}
              </text>
              {hasTag && (
                <text
                  x={node.x}
                  y={node.y + 35}
                  fill="#0891b2"
                  fontSize={8.5}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  🏷️ release
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
