import React, { useState } from 'react';
import type { WindowState } from '../types';
import type { RepoState } from '../gitEngine';
import type { Level } from '../levelsData';

interface Props {
  win: WindowState;
  isMobile: boolean;
  repoState: RepoState;
  currentLevel: Level;
}

export const LiveBrowserWindow: React.FC<Props> = ({
  win: _win,
  isMobile: _isMobile,
  repoState,
  currentLevel,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'menu' | 'contact'>('home');
  const [orderedItem, setOrderedItem] = useState<string | null>(null);

  // Dynamic conditions based on repoState and level
  const commits = repoState.commits;
  const commitList = Object.values(commits);
  const currentBranch = repoState.head.type === 'branch' ? repoState.head.target : 'main';

  // Check if "O nama" is unlocked (from pulled commit or level >= 10)
  const hasAbout =
    currentLevel.livePreview?.hasAbout ||
    commitList.some(c => c.message.toLowerCase().includes('o nama') || c.message.toLowerCase().includes('saradnik')) ||
    currentLevel.id >= 10;

  // Check if "Meni" is unlocked (merged into main or on meni-sekcija branch)
  const hasMenu =
    currentLevel.livePreview?.hasMenu ||
    currentBranch === 'meni-sekcija' ||
    commitList.some(c => c.message.toLowerCase().includes('meni')) ||
    currentLevel.id >= 13;

  // Check if "Kontakt" is unlocked (merged or on kontakt-forma branch)
  const hasContact =
    currentLevel.livePreview?.hasContact ||
    currentBranch === 'kontakt-forma' ||
    commitList.some(c => c.message.toLowerCase().includes('kontakt')) ||
    currentLevel.id >= 14;

  // Check if button style is modified (red color from Lesson 5 of Level 2)
  const isButtonModified =
    repoState.workingDirectory.modified.includes('style.css') ||
    currentLevel.livePreview?.isStyleBroken === true;

  // Check if favicon exists
  const hasFavicon =
    currentLevel.livePreview?.hasFavicon ||
    repoState.workingDirectory.files.includes('favicon.ico') ||
    currentLevel.id >= 20;

  // Check version tag
  const tagVersion = repoState.tags ? Object.keys(repoState.tags)[0] : currentLevel.livePreview?.tag;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fdfaf6', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
      {/* Browser Chrome Toolbar */}
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
        <div style={{ display: 'flex', gap: 2 }}>
          <button className="xp-button" style={{ padding: '1px 5px', fontSize: 10 }}>◀</button>
          <button className="xp-button" style={{ padding: '1px 5px', fontSize: 10 }}>▶</button>
          <button className="xp-button" style={{ padding: '1px 5px', fontSize: 10 }}>🔄</button>
        </div>
        <span style={{ fontWeight: 'bold', color: '#666', fontSize: 10 }}>URL:</span>
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
          <span>{hasFavicon ? '☕' : '🌐'}</span>
          <span style={{ color: '#002e80', fontWeight: '500' }}>http://localhost:3000/kafic-luna/</span>
          {tagVersion && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 9,
                padding: '1px 5px',
                borderRadius: 3,
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontWeight: 'bold',
              }}
            >
              🏷️ {tagVersion}
            </span>
          )}
        </div>
      </div>

      {/* Website Live Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Cafe Header */}
        <header
          style={{
            background: 'linear-gradient(135deg, #3d2314 0%, #1e0e04 100%)',
            color: '#fdf6eb',
            padding: '16px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>☕</span>
            <h1 style={{ margin: 0, fontSize: 20, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.5px' }}>
              Kafić Luna
            </h1>
          </div>
          <p style={{ margin: '4px 0 10px 0', fontSize: 11, color: '#d4a373' }}>
            Vaše omiljeno mesto za autentičnu kafu i inspiraciju
          </p>

          {/* Navigation Bar */}
          <nav
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              borderTop: '1px solid rgba(212, 163, 115, 0.3)',
              paddingTop: 8,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <span
              onClick={() => setActiveTab('home')}
              style={{
                cursor: 'pointer',
                color: activeTab === 'home' ? '#fdf6eb' : '#d4a373',
                borderBottom: activeTab === 'home' ? '2px solid #d4a373' : 'none',
                paddingBottom: 2,
              }}
            >
              Početna
            </span>

            {hasAbout && (
              <span
                onClick={() => setActiveTab('about')}
                style={{
                  cursor: 'pointer',
                  color: activeTab === 'about' ? '#fdf6eb' : '#d4a373',
                  borderBottom: activeTab === 'about' ? '2px solid #d4a373' : 'none',
                  paddingBottom: 2,
                  animation: 'fadeIn 0.5s ease',
                }}
              >
                O nama ✨
              </span>
            )}

            {hasMenu && (
              <span
                onClick={() => setActiveTab('menu')}
                style={{
                  cursor: 'pointer',
                  color: activeTab === 'menu' ? '#fdf6eb' : '#d4a373',
                  borderBottom: activeTab === 'menu' ? '2px solid #d4a373' : 'none',
                  paddingBottom: 2,
                  animation: 'fadeIn 0.5s ease',
                }}
              >
                Meni 📋
              </span>
            )}

            {hasContact && (
              <span
                onClick={() => setActiveTab('contact')}
                style={{
                  cursor: 'pointer',
                  color: activeTab === 'contact' ? '#fdf6eb' : '#d4a373',
                  borderBottom: activeTab === 'contact' ? '2px solid #d4a373' : 'none',
                  paddingBottom: 2,
                  animation: 'fadeIn 0.5s ease',
                }}
              >
                Kontakt ✉️
              </span>
            )}
          </nav>
        </header>

        {/* Tab Contents */}
        <div style={{ padding: 16, flex: 1 }}>
          {/* Početna / Home */}
          {activeTab === 'home' && (
            <div>
              <div
                style={{
                  background: 'linear-gradient(to right, #f7efe5, #eedbc5)',
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 16,
                  border: '1px solid #e3ccb2',
                }}
              >
                <h2 style={{ margin: '0 0 6px 0', fontSize: 16, color: '#3d2314' }}>
                  Dobrodošli u Kafić Luna
                </h2>
                <p style={{ margin: 0, fontSize: 12, color: '#5a3d28', lineHeight: 1.5 }}>
                  U srcu grada, gde svaka šoljica espressa nosi priču o pažljivo biranim zrnima i ljubavi prema tradiciji.
                </p>
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => {
                      setOrderedItem('Espresso Luna');
                      setTimeout(() => setOrderedItem(null), 3000);
                    }}
                    style={{
                      backgroundColor: isButtonModified ? '#e63946' : '#d4a373',
                      color: isButtonModified ? '#ffffff' : '#2b1704',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 4,
                      fontWeight: 'bold',
                      fontSize: 11,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isButtonModified ? '⚠️ Test Boja Dugmeta' : 'Naruči Kafu Online'}
                  </button>
                  {isButtonModified && (
                    <span style={{ marginLeft: 8, fontSize: 10, color: '#b91c1c', fontStyle: 'italic' }}>
                      (style.css je izmenjen — vrati sa git restore style.css)
                    </span>
                  )}
                </div>
                {orderedItem && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#15803d', fontWeight: 'bold' }}>
                    ✅ Naručeno: {orderedItem}! Stiže za par minuta.
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div style={{ padding: 10, backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #eedbc5', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>☕</div>
                  <strong style={{ fontSize: 12, color: '#3d2314' }}>Artisan Kafa</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: 10.5, color: '#775841' }}>100% Arabica sveže pržena</p>
                </div>
                <div style={{ padding: 10, backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #eedbc5', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🥐</div>
                  <strong style={{ fontSize: 12, color: '#3d2314' }}>Domaća Peciva</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: 10.5, color: '#775841' }}>Topli kroasani svakog jutra</p>
                </div>
                <div style={{ padding: 10, backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #eedbc5', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🌿</div>
                  <strong style={{ fontSize: 12, color: '#3d2314' }}>Vibe Ambijent</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: 10.5, color: '#775841' }}>Idealan kutak za rad i učenje</p>
                </div>
              </div>
            </div>
          )}

          {/* O nama / About */}
          {activeTab === 'about' && (
            <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #eedbc5' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 15, color: '#3d2314' }}>📖 O Nama — Kafić Luna</h3>
              <p style={{ fontSize: 11.5, color: '#5a3d28', lineHeight: 1.6 }}>
                Kafić Luna nastao je kao mala porodična kafeterija sa misijom da spoji moderni vajb i vrhunski kvalitet pripreme kafe.
                Ovu sekciju je na udaljenom repozitorijumu pripremio tvoj tim (ili AI asistent), a ti si je uspešno povukao kroz komandu <code>git pull origin main</code>!
              </p>
            </div>
          )}

          {/* Meni / Menu */}
          {activeTab === 'menu' && (
            <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #eedbc5' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: 15, color: '#3d2314' }}>📋 Meni & Cenovnik</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Espresso Luna', price: '190 RSD', desc: 'Intenzivan, sa notama čokolade' },
                  { name: 'Cappuccino Crema', price: '240 RSD', desc: 'Baršunasta mlečna pena' },
                  { name: 'Flat White', price: '280 RSD', desc: 'Dvostruki ristretto i svilenkasto mleko' },
                  { name: 'Čokoladni Croissant', price: '220 RSD', desc: 'Puterasto francusko testo' },
                ].map(item => (
                  <div
                    key={item.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 8px',
                      backgroundColor: '#fdfaf6',
                      borderRadius: 4,
                      borderLeft: '3px solid #d4a373',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 12, color: '#3d2314' }}>{item.name}</strong>
                      <div style={{ fontSize: 10, color: '#775841' }}>{item.desc}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 'bold', color: '#854d0e' }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kontakt / Contact */}
          {activeTab === 'contact' && (
            <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #eedbc5' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: 15, color: '#3d2314' }}>✉️ Kontaktirajte Kafić Luna</h3>
              <div style={{ fontSize: 11, color: '#5a3d28', marginBottom: 10 }}>
                📍 Knez Mihailova 12, Beograd | 📞 011/555-333 | ✉️ kontakt@kafic-luna.rs
              </div>
              <form onSubmit={e => { e.preventDefault(); alert("Hvala! Vaša poruka je poslata Kafiću Luna."); }}>
                <input
                  type="text"
                  placeholder="Vaše ime"
                  style={{ width: '100%', padding: '4px 8px', marginBottom: 6, fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 3 }}
                />
                <textarea
                  placeholder="Vaša poruka ili rezervacija stola..."
                  rows={2}
                  style={{ width: '100%', padding: '4px 8px', marginBottom: 6, fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 3 }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#3d2314',
                    color: '#ffffff',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Pošalji poruku
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Cafe Footer */}
        <footer
          style={{
            backgroundColor: '#3d2314',
            color: '#d4a373',
            textAlign: 'center',
            padding: '8px 12px',
            fontSize: 10,
            marginTop: 'auto',
          }}
        >
          © 2026 Kafić Luna — Učimo Git kroz realan projekat. {tagVersion && `| Verzija: ${tagVersion}`}
        </footer>
      </div>
    </div>
  );
};
