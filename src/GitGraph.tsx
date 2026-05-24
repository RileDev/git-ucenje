import React, { useMemo } from 'react';
import { type RepoState, type Commit, getCommitList } from './gitEngine';

interface GitGraphProps {
  state: RepoState;
  goalState?: {
    commits: string[];
    branches: { [name: string]: string };
  };
}

export const GitGraph: React.FC<GitGraphProps> = ({ state }) => {
  const { commits, branches, head, remoteBranches } = state;

  // Izračunavanje kolona (X koordinata) i redova (Y koordinata) za svaki commit
  const layout = useMemo(() => {
    const commitList = getCommitList(commits);
    if (commitList.length === 0) return { nodes: {}, edges: [] };

    const nodes: { [id: string]: { x: number; y: number; col: number; row: number; commit: Commit } } = {};
    const edges: { from: string; to: string }[] = [];

    // 1. Pronalaženje kolona (X) - širina grafa
    // col = dubina commit-a od korena
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

    // 2. Pronalaženje redova (Y) - visina grafa
    // master je na redu 0. feature je na 1, bugfix na -1 itd.
    const memoRow: { [id: string]: number } = {};
    const branchRows: { [name: string]: number } = {
      master: 0,
      main: 0,
      feature: 1,
      develop: -1,
      bugfix: 2,
      hotfix: -2,
      'origin/master': 0
    };

    let nextAvailableRow = 3;

    // Pridruživanje redova na osnovu grana
    const getRow = (id: string): number => {
      if (memoRow[id] !== undefined) return memoRow[id];
      
      const commit = commits[id];
      if (!commit) return 0;

      // Da li neka grana pokazuje direktno na ovaj commit?
      const pointingBranches = Object.keys(branches).filter(b => branches[b] === id);
      if (remoteBranches) {
        pointingBranches.push(...Object.keys(remoteBranches).filter(b => remoteBranches[b] === id));
      }

      if (pointingBranches.length > 0) {
        // Uzmi prvi definisan red za neku od ovih grana
        for (const b of pointingBranches) {
          if (branchRows[b] !== undefined) {
            memoRow[id] = branchRows[b];
            return branchRows[b];
          }
        }
        // Ako nema predefinisanog, kreiraj novi red za prvu granu
        const newRow = nextAvailableRow++;
        branchRows[pointingBranches[0]] = newRow;
        memoRow[id] = newRow;
        return newRow;
      }

      // Ako nema direktne grane, nasledi red od prvog roditelja
      if (commit.parentIds.length > 0) {
        const parentRow = getRow(commit.parentIds[0]);
        memoRow[id] = parentRow;
        return parentRow;
      }

      memoRow[id] = 0;
      return 0;
    };

    // Izračunaj kolone i redove za sve
    commitList.forEach(c => {
      getCol(c.id);
      getRow(c.id);
    });

    // Podesi koordinate (skaliranje)
    const paddingX = 85;
    const paddingY = 65;
    const startX = 60;
    const centerY = 150;

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

      // Dodaj ivice od roditelja ka detetu (konekcije)
      c.parentIds.forEach(pId => {
        if (commits[pId]) {
          edges.push({ from: pId, to: c.id });
        }
      });
    });

    return { nodes, edges };
  }, [commits, branches, remoteBranches]);

  // Prikupljanje grana koje pokazuju na pojedine commit-e
  const commitLabels = useMemo(() => {
    const labels: { [commitId: string]: { name: string; isRemote: boolean; isHead: boolean }[] } = {};
    
    // Dodaj lokalne grane
    Object.keys(branches).forEach(bName => {
      const cId = branches[bName];
      if (!cId) return;
      if (!labels[cId]) labels[cId] = [];
      const isHead = head.type === 'branch' && head.target === bName;
      labels[cId].push({ name: bName, isRemote: false, isHead });
    });

    // Dodaj prateće remote grane
    if (remoteBranches) {
      Object.keys(remoteBranches).forEach(bName => {
        const cId = remoteBranches[bName];
        if (!cId) return;
        if (!labels[cId]) labels[cId] = [];
        // Da li HEAD pokazuje direktno na ovo (detached)
        const isHead = head.type === 'commit' && head.target === cId;
        // Izbegavamo dupliranje ako već postoji ista lokalna grana sa aktivnim HEAD
        const exists = labels[cId].some(l => l.name === bName);
        if (!exists) {
          labels[cId].push({ name: bName, isRemote: true, isHead });
        }
      });
    }

    // Provera da li je detached HEAD koji nije vezan za lokalnu granu
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
  }, [branches, remoteBranches, head]);

  const { nodes, edges } = layout;
  const nodeKeys = Object.keys(nodes);

  // Ukoliko nema commit-a, prikaži retro placeholder
  if (nodeKeys.length === 0) {
    const isInitialized = Object.keys(branches).length > 0 || head.target !== '';
    if (isInitialized) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          color: '#333',
          backgroundColor: '#f0f3f9',
          padding: '20px',
          textAlign: 'center',
          fontFamily: '"Tahoma", sans-serif'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '15px',
            filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.15))'
          }}>🌿</div>
          <h4 style={{ fontWeight: 'bold', color: '#224488', marginBottom: '8px' }}>
            Repozitorijum je uspešno inicijalizovan!
          </h4>
          <p style={{ fontSize: '12.5px', maxWidth: '320px', lineHeight: '1.4', color: '#555' }}>
            Nalazite se na grani <strong style={{ color: '#245ddb' }}>master</strong>.<br/>
            Kreirajte svoj prvi commit kako biste započeli crtanje vizuelnog grafa!
          </p>
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#ffffe1',
            border: '1px solid #d4d0c8',
            borderRadius: '4px',
            fontSize: '11.5px',
            color: '#000',
            textAlign: 'left',
            fontFamily: 'monospace',
            boxShadow: '1px 1px 3px rgba(0,0,0,0.1)'
          }}>
            1. git add readme.txt<br/>
            2. git commit -m "Moj prvi commit"
          </div>
        </div>
      );
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        color: '#666',
        backgroundColor: '#f6f9fc',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '36px',
          marginBottom: '15px',
          filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))'
        }}>📁</div>
        <h4 style={{ fontWeight: 'bold', color: '#224488', marginBottom: '8px' }}>Repozitorijum nije inicijalizovan</h4>
        <p style={{ fontSize: '12px', maxWidth: '300px' }}>
          Ukucajte <code style={{ backgroundColor: '#eef3fd', padding: '2px 4px', borderRadius: '3px', color: '#c7254e', fontWeight: 'bold' }}>git init</code> u terminal sa desne strane da započnete učenje!
        </p>
      </div>
    );
  }

  // Računanje širine i visine SVG platna na osnovu koordinata
  const maxX = Math.max(...nodeKeys.map(k => nodes[k].x), 400) + 120;
  const minY = Math.min(...nodeKeys.map(k => nodes[k].y), 100) - 80;
  const maxY = Math.max(...nodeKeys.map(k => nodes[k].y), 220) + 100;
  const height = maxY - minY;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'auto',
      backgroundColor: '#f0f3f9',
      border: '1px inset #808080',
      position: 'relative'
    }}>
      {/* Retro Grid Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(#ccd5e8 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        pointerEvents: 'none'
      }} />

      <svg
        width={maxX}
        height={height}
        viewBox={`0 ${minY} ${maxX} ${height}`}
        style={{ position: 'relative', zIndex: 1, display: 'block' }}
      >
        {/* Defs za strelice i stilove */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#728dbb" />
          </marker>
          
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
            <feOffset dx="1" dy="1.5" />
            <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Iscrtavanje konekcionih linija (Edges) - zakrivljeni Bezier kablovi */}
        {edges.map((edge, idx) => {
          const fromNode = nodes[edge.from];
          const toNode = nodes[edge.to];
          if (!fromNode || !toNode) return null;

          // Crtamo od deteta (desno) ka roditelju (levo)
          const startX = toNode.x - 18; // blago pomereno ka obodu
          const startY = toNode.y;
          const endX = fromNode.x + 18;
          const endY = fromNode.y;

          // Bezier kontrolne tačke za glatku horizontalnu S-krivu
          const cp1X = startX - 25;
          const cp1Y = startY;
          const cp2X = endX + 25;
          const cp2Y = endY;

          return (
            <path
              key={`edge-${idx}`}
              d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
              fill="none"
              stroke="#728dbb"
              strokeWidth="2.5"
              markerEnd="url(#arrow)"
              strokeDasharray={toNode.commit.isRemote ? "4,4" : "none"}
            />
          );
        })}

        {/* Iscrtavanje Commit čvorova */}
        {nodeKeys.map(id => {
          const node = nodes[id];
          const labels = commitLabels[id] || [];
          const isHEADNode = labels.some(l => l.isHead);
          const isRemoteOnly = node.commit.isRemote;

          return (
            <g key={`node-${id}`} filter="url(#shadow)">
              {/* Pulsirajući oreol za HEAD čvor */}
              {isHEADNode && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  fill="none"
                  stroke="#38a169"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  opacity="0.8"
                >
                  <animate
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="10s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Spoljašnji prsten / Commit krug */}
              <circle
                cx={node.x}
                cy={node.y}
                r="16"
                fill={isRemoteOnly ? "#fff0f0" : "#2b73db"}
                stroke={isHEADNode ? "#38a169" : (isRemoteOnly ? "#e53e3e" : "#002e80")}
                strokeWidth={isHEADNode ? "3" : "2"}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              />

              {/* ID commit-a (C0, C1, C2...) */}
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fill={isRemoteOnly ? "#e53e3e" : "#ffffff"}
                fontSize="11"
                fontWeight="bold"
                style={{ pointerEvents: 'none', fontFamily: '"Share Tech Mono", monospace' }}
              >
                {id}
              </text>

              {/* Commit poruka lebdi iznad kruga */}
              <title>{`${id}: ${node.commit.message}`}</title>
              <text
                x={node.x}
                y={node.y + 30}
                textAnchor="middle"
                fill="#4a5568"
                fontSize="9"
                fontWeight="500"
                style={{ pointerEvents: 'none' }}
              >
                {node.commit.message.length > 15 
                  ? node.commit.message.substring(0, 12) + "..." 
                  : node.commit.message}
              </text>

              {/* Iscrtavanje zastavica za grane koje pokazuju na ovaj commit */}
              {labels.length > 0 && (
                <g transform={`translate(${node.x}, ${node.y - 25})`}>
                  {labels.map((label, lIdx) => {
                    const flagY = -lIdx * 20;
                    const isRemote = label.isRemote;
                    const isHead = label.isHead;
                    
                    // Određivanje boja zastavice
                    let bgColor = '#b3d1ff'; // svetlo plava
                    let borderColor = '#0e3092';
                    let textColor = '#002e80';

                    if (isRemote) {
                      bgColor = '#ffd1d1'; // svetlo crvena
                      borderColor = '#a30000';
                      textColor = '#800000';
                    }
                    if (isHead) {
                      bgColor = '#d2f4d2'; // svetlo zelena
                      borderColor = '#1e5a1e';
                      textColor = '#0f3a0f';
                    }

                    const flagText = label.name + (isHead ? ' *' : '');
                    const labelWidth = flagText.length * 6 + 14;

                    return (
                      <g key={`label-${lIdx}`} transform={`translate(${-labelWidth / 2}, ${flagY})`}>
                        {/* Zastavica */}
                        <rect
                          width={labelWidth}
                          height={16}
                          rx="3"
                          ry="3"
                          fill={bgColor}
                          stroke={borderColor}
                          strokeWidth="1.5"
                        />
                        <text
                          x={labelWidth / 2}
                          y="11"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fill={textColor}
                          style={{ fontFamily: '"Tahoma", "Outfit", sans-serif' }}
                        >
                          {flagText}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
