import React, { useState } from 'react';
import type { WindowState } from '../types';
import type { RepoState } from '../gitEngine';
import type { Level } from '../levelsData';
import { isFileIgnored } from '../gitEngine';
import { playTone } from '../audio';

interface Props {
  win: WindowState;
  isMobile: boolean;
  repoState: RepoState;
  setRepoState: React.Dispatch<React.SetStateAction<RepoState>>;
  currentLevel: Level;
  soundEnabled: boolean;
}

export const ProjectExplorerWindow: React.FC<Props> = ({
  win,
  isMobile,
  repoState,
  setRepoState,
  currentLevel,
  soundEnabled,
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  const isInitialized =
    repoState.isInitialized === true ||
    Object.keys(repoState.commits).length > 0 ||
    repoState.head.target !== '' ||
    repoState.branches['main'] !== undefined;

  const patterns = repoState.gitignorePatterns || [];
  const staged = repoState.index.staged;
  const modified = repoState.workingDirectory.modified;
  const untracked = repoState.workingDirectory.untracked;

  // Determine list of files to display
  const allKnownFiles = Array.from(
    new Set([
      ...(repoState.workingDirectory.files || []),
      ...(repoState.workingDirectory.untracked || []),
      ...(repoState.workingDirectory.modified || []),
      ...(repoState.index.staged || []),
    ])
  );

  // If level 3 (.gitignore), ensure node_modules, secrets.txt, .DS_Store, .gitignore are in the folder
  if (currentLevel.lessonNumber === 3) {
    if (!allKnownFiles.includes('node_modules')) allKnownFiles.push('node_modules');
    if (!allKnownFiles.includes('secrets.txt')) allKnownFiles.push('secrets.txt');
    if (!allKnownFiles.includes('.DS_Store')) allKnownFiles.push('.DS_Store');
    if (!allKnownFiles.includes('.gitignore')) allKnownFiles.push('.gitignore');
  }

  // If level 9 (amend / favicon), ensure favicon.ico is present
  if (currentLevel.lessonNumber === 9 && !allKnownFiles.includes('favicon.ico')) {
    allKnownFiles.push('favicon.ico');
  }

  // Get file status
  const getFileStatus = (filename: string): { label: string; bg: string; color: string; icon: string } => {
    if (filename === '.git') {
      return { label: 'Sistemski', bg: '#e2e8f0', color: '#475569', icon: '🔒' };
    }
    if (repoState.mergeInProgress && repoState.mergeInProgress.conflictFile === filename) {
      return { label: 'Konflikt', bg: '#fee2e2', color: '#b91c1c', icon: '⚔️' };
    }
    if (isFileIgnored(filename, patterns) && filename !== '.gitignore') {
      return { label: 'Ignored', bg: '#f1f5f9', color: '#64748b', icon: '🔘' };
    }
    if (staged.includes(filename)) {
      return { label: 'Staged', bg: '#dcfce7', color: '#15803d', icon: '🟢' };
    }
    if (modified.includes(filename)) {
      return { label: 'Modified', bg: '#fef9c3', color: '#854d0e', icon: '🟡' };
    }
    if (untracked.includes(filename)) {
      return { label: 'Untracked', bg: '#fee2e2', color: '#b91c1c', icon: '🔴' };
    }
    return { label: 'Tracked', bg: '#e0e7ff', color: '#3730a3', icon: '⚪' };
  };

  const getFileIcon = (filename: string): string => {
    if (filename === '.git' || filename === 'node_modules') return '📁';
    if (filename.endsWith('.html')) return '🌐';
    if (filename.endsWith('.css')) return '🎨';
    if (filename.endsWith('.js')) return '📜';
    if (filename === '.gitignore') return '⚙️';
    if (filename === 'secrets.txt') return '🔑';
    if (filename === 'favicon.ico') return '☕';
    if (filename.endsWith('.txt') || filename.endsWith('.DS_Store')) return '📄';
    return '📄';
  };

  const handleOpenFile = (filename: string) => {
    setSelectedFile(filename);
    setIsEditing(false);

    if (filename === '.git') {
      const content = `[SISTEMSKI GIT DIREKTORIJUM]\nSadrži Git objekte, reference grana (refs/heads/main), HEAD pokazivač i konfiguraciju.`;
      setPreviewContent(content);
      setEditedText(content);
      return;
    }
    if (filename === 'node_modules') {
      const content = `[FOLDER ZAVISNOSTI]\nSadrži biblioteke i pakete (npr. live-server).\nOvaj folder se automatski ignoriše kroz .gitignore.`;
      setPreviewContent(content);
      setEditedText(content);
      return;
    }
    if (filename === '.DS_Store') {
      const content = `[SISTEMSKI METAPODACI OS-a]\nSistemski fajl koji operativni sistem automatski kreira.\nIgnoriše se kroz .gitignore.`;
      setPreviewContent(content);
      setEditedText(content);
      return;
    }
    if (filename === 'secrets.txt') {
      const content = repoState.fileContents?.['secrets.txt'] || `EMAIL_API_KEY="sk_live_kaficluna_9823471029834"\nSMTP_PASSWORD="super_secret_cafe_pass"\n`;
      setPreviewContent(content);
      setEditedText(content);
      return;
    }
    if (filename === '.gitignore') {
      const content = repoState.fileContents?.['.gitignore'] || `node_modules/\n.DS_Store\n`;
      setPreviewContent(content);
      setEditedText(content);
      return;
    }
    if (filename === 'favicon.ico') {
      const content = `[IKONICA PROJEKTA]\nFavicon Kafić Luna (☕ Šoljica kafe) za prikaz u browser tabu.`;
      setPreviewContent(content);
      setEditedText(content);
      return;
    }

    const content = repoState.fileContents?.[filename] || `// Sadržaj fajla ${filename}\n// Kafić Luna sajt`;
    setPreviewContent(content);
    setEditedText(content);
  };

  const handleSaveFileContent = () => {
    if (!selectedFile) return;

    let updatedPatterns = repoState.gitignorePatterns ? [...repoState.gitignorePatterns] : [];
    let updatedUntracked = [...repoState.workingDirectory.untracked];
    let updatedIgnored = repoState.workingDirectory.ignored ? [...repoState.workingDirectory.ignored] : [];

    if (selectedFile === '.gitignore') {
      const lines = editedText.split('\n').map(l => l.trim()).filter(Boolean);
      updatedPatterns = Array.from(new Set(lines));
      updatedUntracked = repoState.workingDirectory.untracked.filter(f => !isFileIgnored(f, updatedPatterns));
      updatedIgnored = Array.from(new Set([...(repoState.workingDirectory.files || []), 'node_modules', '.DS_Store', 'secrets.txt'].filter(f => isFileIgnored(f, updatedPatterns))));
    }

    setRepoState(prev => ({
      ...prev,
      fileContents: {
        ...prev.fileContents,
        [selectedFile]: editedText,
      },
      gitignorePatterns: selectedFile === '.gitignore' ? updatedPatterns : prev.gitignorePatterns,
      workingDirectory: {
        ...prev.workingDirectory,
        files: Array.from(new Set([...prev.workingDirectory.files, selectedFile])),
        untracked: updatedUntracked,
        ignored: updatedIgnored,
      },
    }));

    setPreviewContent(editedText);
    setIsEditing(false);

    if (soundEnabled) {
      playTone(659.25, 0, 0.1, 'sine', 0.1);
    }
  };

  const handleResolveConflict = () => {
    if (!repoState.mergeInProgress) return;
    const resolvedHtml = `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <title>Kafić Luna</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>☕ Kafić Luna</h1>
    <nav>
      <a href="#pocetna">Početna</a>
      <a href="#onama">O nama</a>
      <a href="#meni">Meni</a>
      <a href="#kontakt">Kontakt</a>
    </nav>
  </header>
  <main>
    <section id="pocetna">
      <h2>Dobrodošli u Kafić Luna</h2>
      <p>Mesto gde se miris sveže mlevene kafe spaja sa prijatnom atmosferom.</p>
    </section>
    <section id="onama">
      <h2>O nama</h2>
      <p>Kafić Luna je osnovan sa idejom da ponudi vrhunski espresso i miran ambijent.</p>
    </section>
    <section id="meni">
      <h2>Naš Meni</h2>
      <p>Espresso, Cappuccino, Flat White i domaći kroasani.</p>
    </section>
    <section id="kontakt">
      <h2>Kontakt</h2>
      <p>Knez Mihailova 12, Beograd | info@kafic-luna.rs</p>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>`;

    setRepoState(prev => ({
      ...prev,
      fileContents: {
        ...prev.fileContents,
        'index.html': resolvedHtml,
      },
      mergeInProgress: {
        ...prev.mergeInProgress!,
        conflictFile: undefined,
      },
    }));
    setPreviewContent(resolvedHtml);
  };

  const actualWidth = isMobile
    ? window.innerWidth
    : (win.isMaximized ? window.innerWidth : win.w);
  const scale = isMobile ? (actualWidth / 360) : (actualWidth / 420);
  const gridItemWidth = Math.max(70, Math.min(95, Math.floor(80 * scale)));

  const isEditable = selectedFile && !['.git', 'node_modules', '.DS_Store'].includes(selectedFile);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', fontFamily: 'Tahoma, Arial, sans-serif' }}>
      {/* Explorer Address Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          backgroundColor: '#ece9d8',
          borderBottom: '1px solid #d4d0c8',
          fontSize: 11,
          color: '#333',
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#666' }}>Adresa:</span>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 6px',
            backgroundColor: '#ffffff',
            border: '1px solid #7f9db9',
            borderRadius: 2,
            fontSize: 11,
          }}
        >
          <span>📁</span>
          <span style={{ fontWeight: '600', color: '#002e80' }}>C:\kafic-luna</span>
          <span style={{ color: '#888', marginLeft: 'auto', fontSize: 10 }}>
            {allKnownFiles.length} stavki
          </span>
        </div>
      </div>

      {/* Main Files Grid View */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexWrap: 'wrap', gap: 12, alignContent: 'flex-start' }}>
        {/* .git folder */}
        {isInitialized && (
          <div
            onClick={() => handleOpenFile('.git')}
            style={{
              width: gridItemWidth,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '6px 4px',
              borderRadius: 4,
              cursor: 'pointer',
              border: selectedFile === '.git' ? '1px solid #316ac5' : '1px solid transparent',
              backgroundColor: selectedFile === '.git' ? '#e2ecfa' : 'transparent',
              opacity: 0.8,
            }}
            title="Sistemski .git direktorijum (kreiran pomoću git init)"
          >
            <div style={{ fontSize: 32, marginBottom: 2, filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))' }}>
              🔒
            </div>
            <div style={{ fontSize: 11, fontWeight: 'bold', color: '#555', textAlign: 'center', wordBreak: 'break-all' }}>
              .git
            </div>
            <div
              style={{
                marginTop: 3,
                fontSize: 9,
                padding: '1px 4px',
                borderRadius: 3,
                backgroundColor: '#e2e8f0',
                color: '#475569',
                fontWeight: 'bold',
              }}
            >
              sistemski
            </div>
          </div>
        )}

        {/* Project Files in Grid */}
        {allKnownFiles.map(filename => {
          const status = getFileStatus(filename);
          const icon = getFileIcon(filename);
          const isSelected = selectedFile === filename;

          return (
            <div
              key={filename}
              onClick={() => handleOpenFile(filename)}
              style={{
                width: gridItemWidth,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '6px 4px',
                borderRadius: 4,
                cursor: 'pointer',
                border: isSelected ? '1px solid #316ac5' : '1px solid transparent',
                backgroundColor: isSelected ? '#e2ecfa' : 'transparent',
                transition: 'background-color 0.1s ease',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 2, filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))' }}>
                {icon}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: '#111827',
                  textAlign: 'center',
                  wordBreak: 'break-all',
                  lineHeight: 1.2,
                  maxWidth: '100%',
                }}
              >
                {filename}
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontSize: 9,
                  padding: '1px 5px',
                  borderRadius: 3,
                  backgroundColor: status.bg,
                  color: status.color,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <span>{status.icon}</span>
                <span>{status.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* File Content Preview / Inspector Sub-panel */}
      {selectedFile && (
        <div
          style={{
            borderTop: '2px solid #7ea7fc',
            backgroundColor: '#f8fafc',
            padding: 8,
            maxHeight: '48%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>📄</span>
              <strong style={{ fontSize: 11, color: '#002e80' }}>{selectedFile}</strong>
              {(() => {
                const s = getFileStatus(selectedFile);
                return (
                  <span
                    style={{
                      fontSize: 9,
                      padding: '1px 5px',
                      borderRadius: 3,
                      backgroundColor: s.bg,
                      color: s.color,
                      fontWeight: 'bold',
                    }}
                  >
                    {s.label}
                  </span>
                );
              })()}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {isEditable && (
                isEditing ? (
                  <button
                    className="xp-button xp-button-primary"
                    onClick={handleSaveFileContent}
                    style={{ fontSize: 10, padding: '1px 8px', fontWeight: 'bold' }}
                  >
                    💾 Sačuvaj
                  </button>
                ) : (
                  <button
                    className="xp-button"
                    onClick={() => {
                      setIsEditing(true);
                      setEditedText(repoState.fileContents?.[selectedFile] || previewContent || '');
                    }}
                    style={{ fontSize: 10, padding: '1px 8px' }}
                  >
                    ✏️ Uredi
                  </button>
                )
              )}
              <button
                className="xp-button"
                onClick={() => {
                  setSelectedFile(null);
                  setIsEditing(false);
                }}
                style={{ fontSize: 10, padding: '1px 6px' }}
              >
                Zatvori
              </button>
            </div>
          </div>

          {/* Merge conflict resolver button */}
          {repoState.mergeInProgress && repoState.mergeInProgress.conflictFile === selectedFile && (
            <div style={{ margin: '2px 0', padding: 6, backgroundColor: '#fef2f2', border: '1px solid #f87171', borderRadius: 4 }}>
              <div style={{ fontSize: 10.5, color: '#991b1b', fontWeight: 'bold', marginBottom: 4 }}>
                ⚠️ U ovom fajlu postoji merge konflikt između grana!
              </div>
              <button
                className="xp-button xp-button-primary"
                onClick={handleResolveConflict}
                style={{ fontSize: 11, padding: '3px 8px', width: '100%', fontWeight: 'bold' }}
              >
                ✨ Razreši konflikt (Ukloni markere i zadrži Meni i Kontakt)
              </button>
            </div>
          )}

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <textarea
                value={editedText}
                onChange={e => setEditedText(e.target.value)}
                placeholder="Unesite sadržaj..."
                style={{
                  width: '100%',
                  height: 80,
                  fontFamily: 'monospace',
                  fontSize: 11,
                  padding: 4,
                  border: '1px solid #7f9db9',
                  borderRadius: 2,
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>
          ) : (
            <pre
              style={{
                margin: 0,
                padding: 6,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 3,
                fontFamily: 'monospace',
                fontSize: 10.5,
                color: '#334155',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 120,
                overflowY: 'auto',
              }}
            >
              {previewContent}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
