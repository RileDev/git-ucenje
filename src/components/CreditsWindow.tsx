import React from 'react';

export const CreditsWindow: React.FC = () => (
  <div style={{ padding: 20, fontSize: 13, lineHeight: 1.6, height: '100%', overflowY: 'auto' }}>
    <h2 style={{ color: '#002e80', borderBottom: '2px solid #b0c9ea', paddingBottom: 4, marginBottom: 12 }}>
      O Autoru i Priznanja
    </h2>
    <p>
      <strong>Luna Git</strong> je interaktivna retro platforma za vizuelno i gejmifikovano učenje Git komandi, osmišljena u duhu legendarnog operativnog sistema <strong>Windows XP (Luna plava tema, Y2K stil)</strong>.
    </p>
    <p style={{ marginTop: 10 }}>
      📚 <strong>Edukativni materijal:</strong><br />
      Sav teorijski sadržaj, zadaci i metodologija učenja preuzeti su iz javnih predavanja i slajdova <strong>Prof. dr Igora Dejanovića</strong> sa Fakulteta tehničkih nauka u Novom Sadu (kurs Tehnički alati / Git).
      Sve zasluge za strukturu i kvalitet objašnjenja pripadaju profesoru Dejanoviću. Posetite izvorne materijale na:
      <a href="https://igordejanovic.net/courses/tech/git/" target="_blank" rel="noreferrer" style={{ color: '#245ddb', marginLeft: 5, textDecoration: 'underline' }}>igordejanovic.net/courses/tech/git/</a>
    </p>
    <p style={{ marginTop: 10 }}>
      💡 <strong>Inspiracija za vizuelni koncept:</strong><br />
      Zahvaljujemo se i fenomenalnom projektu <strong>Learn Git Branching</strong> (learngitbranching.js.org) koji je poslužio kao glavna inspiracija za učenje Git-a putem interaktivnog grafičkog stabla na komandnoj liniji.
    </p>
    <p style={{ marginTop: 10, fontSize: 11, color: '#666', fontStyle: 'italic' }}>
      Projekat je kreiran od strane
      <a href="https://github.com/RileDev" target="_blank" rel="noreferrer" style={{ color: '#245ddb', marginLeft: 5, textDecoration: 'underline' }}>github.com/RileDev</a> uz pomoc Antigravity alata.
    </p>
  </div>
);
