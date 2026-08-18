import { type RepoState } from './gitEngine';

export interface Level {
  id: number;
  levelNumber: 1 | 2 | 3;
  lessonNumber: number | string;
  title: string;
  category: string;
  isReadingOnly?: boolean;
  story: string;
  whyItMatters: string;
  task: string;
  hint1: string;
  hint2: string;
  expectedResult: string;
  quickOverview: string;
  description: string;
  initialState: RepoState;
  validate: (state: RepoState, commandsRun?: string[]) => boolean;
  expectedCommands: string[];
  livePreview?: {
    hasAbout?: boolean;
    hasMenu?: boolean;
    hasContact?: boolean;
    isStyleBroken?: boolean;
    isConflict?: boolean;
    hasFavicon?: boolean;
    tag?: string;
  };
}

export const levels: Level[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // NIVO 1: OSNOVE — KAFIC LUNA (10 LEKCIJA)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 1,
    levelNumber: 1,
    lessonNumber: 0,
    title: "Lekcija 0: Šta je Git i zašto ga koristimo",
    category: "Nivo 1: Osnove",
    isReadingOnly: true,
    story: "Zamisli da pišeš esej u Word-u i svaki put kad napraviš veću izmenu, snimiš kopiju kao esej_final.docx, pa esej_final2.docx, pa esej_STVARNO_final.docx. Radi — ali je haotično, i ne znaš tačno šta se promenilo između verzija.",
    whyItMatters: "Git rešava taj problem za kod. To je sistem koji pamti svaku sačuvanu verziju tvog projekta — ne kao gomilu foldera, već kao urednu istoriju snimaka (zovu se commit-ovi), sa jasnim opisom šta je promenjeno i kada. U vibecoding-u posebno: kad AI napiše/izmeni gomilu koda za tebe, Git ti daje 'undo dugme' i način da vidiš tačno šta se promenilo pre nego što to prihvatiš.",
    task: "Pročitaj uvodno objašnjenje i upoznaj se sa radnim prozorima na radnoj površini. Kada si spreman/na, klikni na dugme 'Sledeći nivo' ispod!",
    hint1: "Ovo je konceptualna lekcija za čitanje. Nema kucanja komandi u terminalu.",
    hint2: "Klikni na dugme 'Sledeći nivo 🔓' ispod ovog uputstva da pređeš na Lekciju 1.",
    expectedResult: "Upoznavanje sa 4 radna prozora: Lekcija, Git Graf, Folder Projekta i Terminal.",
    quickOverview: "Git — distribuirani sistem za kontrolu verzija koji čuva istoriju projekta.",
    description: `### Dobrodošli u projekat "Kafić Luna"!

Zamisli da pišeš esej u Word-u i svaki put kad napraviš veću izmenu, snimiš kopiju kao \`esej_final.docx\`, pa \`esej_final2.docx\`, pa \`esej_STVARNO_final.docx\`. Radi — ali je haotično, i ne znaš tačno šta se promenilo između verzija.

**Git** rešava taj problem za kod. To je sistem koji pamti *svaku* sačuvanu verziju tvog projekta — ne kao gomilu foldera, već kao urednu istoriju snimaka (zovu se **commit-ovi**), sa jasnim opisom šta je promenjeno i kada.

Napravio ga je 2005. Linus Torvalds, tvorac Linux-a, jer mu je trebao alat koji hiljade programera može da koristi *istovremeno* na istom projektu bez haosa.

**Zašto je bitan tebi, danas:**
*   Možeš da eksperimentišeš slobodno — ako nešto pokvariš, uvek se vraćaš na verziju koja je radila.
*   Ako radiš sa timom (ili AI asistentom), Git ti tačno pokazuje ko je šta i kada promenio.
*   U **vibecoding-u** posebno: kad AI napiše/izmeni gomilu koda za tebe, Git ti daje "undo dugme" i način da vidiš tačno šta se promenilo pre nego što to prihvatiš.

**Tri zone u kojima tvoj kod "putuje":**
<div class="xp-flow-container">
  <div class="xp-flow-step">
    <span class="xp-flow-icon">📁</span>
    <strong>Radni direktorijum</strong>
    <small>(fajlovi na disku)</small>
  </div>
  <div class="xp-flow-arrow">➔</div>
  <div class="xp-flow-step">
    <span class="xp-flow-icon">⏳</span>
    <strong>Staging zona (index)</strong>
    <small>("spremno za commit")</small>
  </div>
  <div class="xp-flow-arrow">➔</div>
  <div class="xp-flow-step">
    <span class="xp-flow-icon">💾</span>
    <strong>Repozitorijum</strong>
    <small>(istorija commit-ova)</small>
  </div>
</div>

Kroz ceo ovaj nivo pratićeš radne prozore na radnoj površini:
*   **Dokument Lekcije** — uputstvo i cilj
*   **Projekat: kafic-luna** — pravi fajlovi tvog sajta sa statusima
*   **Terminal** — gde kucaš Git komande
*   **Vizuelni Git Graf** — grafički prikaz istorije commit-ova
*   **Live Web Pregledač** — sajt Kafić Luna uživo!`,
    initialState: {
      isInitialized: false,
      commits: {},
      branches: {},
      head: { type: 'branch', target: '' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js'],
        modified: [],
        untracked: ['index.html', 'style.css', 'script.js'],
        ignored: []
      },
      hasRemote: false
    },
    validate: () => true,
    expectedCommands: [],
    livePreview: { hasAbout: false, hasMenu: false, hasContact: false }
  },
  {
    id: 2,
    levelNumber: 1,
    lessonNumber: 1,
    title: "Lekcija 1: git init",
    category: "Nivo 1: Osnove",
    story: "Otvaraš `kafic-luna/` folder prvi put. Unutra su `index.html`, `style.css` i `script.js` — sajt već postoji, ali ne postoji nikakva Git istorija. Nema `.git` foldera, nema commit-ova, ništa se ne prati.",
    whyItMatters: "Bez ovog koraka, Git ne 'vidi' tvoj projekat uopšte — sve ostale komande iz ovog nivoa jednostavno neće raditi. Ovo je korak koji radiš tačno jednom, na samom početku života jednog projekta.",
    task: "Pokreni Git praćenje za ovaj folder, tako da Git počne da beleži šta se u njemu dešava.",
    hint1: "Kako bi na engleskom nazvao/la radnju kojom nešto tek započinješ, inicijalizuješ?",
    hint2: "git init",
    expectedResult: "U Projekat prozoru pojavljuje se skriveni .git folder. Vizuelni Git Graf menja poruku iz 'Repozitorijum nije inicijalizovan' u prazan graf na grani main. Terminal ispisuje potvrdu da je prazan repozitorijum kreiran.",
    quickOverview: "git init — pretvara trenutni folder u Git repozitorijum.",
    description: `### Priča
Otvaraš \`kafic-luna/\` folder prvi put. Unutra su \`index.html\`, \`style.css\` i \`script.js\` — sajt već postoji, ali ne postoji nikakva Git istorija. Nema \`.git\` foldera, nema commit-ova, ništa se ne prati.

### Zašto je ovo bitno
Bez ovog koraka, Git ne "vidi" tvoj projekat uopšte — sve ostale komande iz ovog nivoa jednostavno neće raditi. Ovo je korak koji radiš **tačno jednom**, na samom početku života jednog projekta.`,
    initialState: {
      isInitialized: false,
      commits: {},
      branches: {},
      head: { type: 'branch', target: '' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js'],
        modified: [],
        untracked: ['index.html', 'style.css', 'script.js'],
        ignored: []
      },
      hasRemote: false
    },
    validate: (state: RepoState) => {
      return state.isInitialized === true || state.branches['main'] !== undefined || state.head.target === 'main';
    },
    expectedCommands: ["git init"],
    livePreview: { hasAbout: false, hasMenu: false, hasContact: false }
  },
  {
    id: 3,
    levelNumber: 1,
    lessonNumber: 2,
    title: "Lekcija 2: git status",
    category: "Nivo 1: Osnove",
    story: "Repozitorijum postoji, ali `index.html`, `style.css` i `script.js` su i dalje tu, potpuno nepromenjeni. Pitanje je: da li ih Git uopšte 'vidi'?",
    whyItMatters: "git status je komanda koju ćeš kucati najčešće od svih — pre svakog sledećeg koraka, dobra je navika proveriti šta se tačno dešava u projektu, umesto da nagađaš.",
    task: "Proveri kako Git trenutno vidi tvoj projekat — koje fajlove je primetio, i u kom su stanju.",
    hint1: "Koja komanda ti daje 'stanje' ili 'status' projekta, bez da bilo šta menja?",
    hint2: "git status",
    expectedResult: "Terminal prikazuje sva tri fajla pod Untracked files (crvenom bojom) — Git ih vidi na disku, ali ih još ne prati.",
    quickOverview: "git status — prikazuje stanje radnog direktorijuma i staging zone.",
    description: `### Priča
Repozitorijum postoji, ali \`index.html\`, \`style.css\` i \`script.js\` su i dalje tu, potpuno nepromenjeni. Pitanje je: da li ih Git uopšte "vidi"?

### Zašto je ovo bitno
\`git status\` je komanda koju ćeš kucati **najčešće od svih** — pre svakog sledećeg koraka, dobra je navika proveriti šta se tačno dešava u projektu, umesto da nagađaš.`,
    initialState: {
      isInitialized: true,
      commits: {},
      branches: { main: '' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js'],
        modified: [],
        untracked: ['index.html', 'style.css', 'script.js'],
        ignored: []
      },
      hasRemote: false
    },
    validate: (_state: RepoState, commandsRun = []) => {
      return commandsRun.some(c => c.toLowerCase().includes('status'));
    },
    expectedCommands: ["git status"],
    livePreview: { hasAbout: false, hasMenu: false, hasContact: false }
  },
  {
    id: 4,
    levelNumber: 1,
    lessonNumber: 3,
    title: "Lekcija 3: .gitignore",
    category: "Nivo 1: Osnove",
    story: "Dok si radio/la na sajtu, primetio/la si da je neko već napravio .gitignore u koji je stavio node_modules/ i .DS_Store. Međutim, zaboravljeno je ono najbitnije: secrets.txt koji sadrži tajni API ključ i nikada ne sme da dospe u Git istoriju!",
    whyItMatters: ".gitignore je živi fajl koji stalno dopunjujemo novim pravilima. Kada god dodamo konfiguracione fajlove sa lozinkama ili tokenima (npr. secrets.txt, .env), moramo ih upisati u .gitignore pre nego što napravimo commit.",
    task: "1. Otvori .gitignore fajl u File Exploreru (klikom na ikonicu .gitignore).\n2. Klikni na dugme 'Uredi', dopiši 'secrets.txt' u novom redu i klikni 'Sačuvaj'.\n3. Pokreni 'git status' u terminalu i potvrdi da je secrets.txt uspešno sakriven!",
    hint1: "Klikni na .gitignore u prozoru 'Projekat: kafic-luna'. Pritisni 'Uredi', u novom redu dopiši secrets.txt i klikni 'Sačuvaj'.",
    hint2: "U File Exploreru klikni na .gitignore -> 'Uredi' -> dopiši secrets.txt -> 'Sačuvaj'. Zatim u terminalu pokreni 'git status'.",
    expectedResult: "git status više ne prikazuje secrets.txt pod Untracked files — Git ga sada trajno ignoriše.",
    quickOverview: ".gitignore — fajl sa listom putanja/obrazaca koje Git treba da ignoriše.",
    description: `### Priča
Dok si radio/la na sajtu, primetio/la si da je neko već napravio \`.gitignore\` u koji je stavio \`node_modules/\` i \`.DS_Store\`.

Međutim, zaboravljeno je ono najbitnije: **\`secrets.txt\`** koji sadrži privatni API ključ i nikada ne sme da dospe u Git istoriju!

### Zašto je ovo bitno
\`.gitignore\` je živi fajl koji stalno dopunjujemo. Ako zaboraviš da sakriješ fajlove sa lozinkama i API ključevima, oni ostaju trajno zabeleženi u istoriji commit-ova čak i ako ih kasnije obrišeš.`,
    initialState: {
      isInitialized: true,
      commits: {},
      branches: { main: '' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore', 'node_modules', 'secrets.txt', '.DS_Store'],
        modified: [],
        untracked: ['index.html', 'style.css', 'script.js', 'secrets.txt'],
        ignored: ['node_modules', '.DS_Store']
      },
      fileContents: {
        '.gitignore': "node_modules/\n.DS_Store\n",
        'secrets.txt': "EMAIL_API_KEY=\"sk_live_kaficluna_9823471029834\"\nSMTP_PASSWORD=\"super_secret_cafe_pass\"\n"
      },
      gitignorePatterns: ['node_modules/', '.DS_Store'],
      hasRemote: false
    },
    validate: (state: RepoState, commandsRun = []) => {
      const hasSecrets =
        state.gitignorePatterns?.some(p => p.includes('secrets.txt')) ||
        state.fileContents?.['.gitignore']?.includes('secrets.txt');
      const hasRanStatus = commandsRun.some(c => c.toLowerCase().includes('status'));
      return Boolean(hasSecrets && hasRanStatus);
    },
    expectedCommands: ["git status"],
    livePreview: { hasAbout: false, hasMenu: false, hasContact: false }
  },
  {
    id: 5,
    levelNumber: 1,
    lessonNumber: 4,
    title: "Lekcija 4: git diff",
    category: "Nivo 1: Osnove",
    story: "Radoznao/la si — želiš da vidiš tačno šta se promenilo u projektu pre nego što bilo šta uradiš. Pokrećeš git diff na index.html, style.css i script.js, koji su i dalje netaknuti od pre.",
    whyItMatters: "git diff ti pokazuje tačne linije koje su dodate ili obrisane pre nego što ih trajno sačuvaš. Posebno u vibecoding-u kad AI asistent izmeni kod, diff ti daje priliku da vidiš tačno šta se menja.",
    task: "Pokreni komandu koja poredi trenutno stanje fajlova sa onim što je Git poslednje zapamtio, i obrati pažnju na rezultat.",
    hint1: "Koja komanda pokazuje 'razliku' između radnog direktorijuma i onoga što Git trenutno prati?",
    hint2: "git diff",
    expectedResult: "Terminal ispisuje prazan rezultat — jer git diff poredi samo fajlove koje Git već prati (tracked). Pošto još ništa nije dodato, nema šta da uporedi.",
    quickOverview: "git diff — prikazuje razlike u fajlovima koje Git već prati, a koje još nisu dodate u staging zonu.",
    description: `### Priča
Radoznao/la si — želiš da vidiš tačno šta se promenilo u projektu pre nego što bilo šta uradiš. Pokrećeš \`git diff\` na \`index.html\`, \`style.css\` i \`script.js\`, koji su i dalje netaknuti od pre.

### Zašto je ovo bitno
\`git diff\` ti pokazuje **tačne linije** koje su dodate ili obrisane, pre nego što ih trajno sačuvaš. U vibecoding-u — kad AI asistent izmeni gomilu koda za tebe, \`diff\` ti daje priliku da vidiš tačno šta se menja red po red.`,
    initialState: {
      isInitialized: true,
      commits: {},
      branches: { main: '' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: ['index.html', 'style.css', 'script.js', '.gitignore'],
        ignored: ['node_modules/', 'secrets.txt', '.DS_Store']
      },
      gitignorePatterns: ['node_modules/', 'secrets.txt', '.DS_Store'],
      hasRemote: false
    },
    validate: (_state: RepoState, commandsRun = []) => {
      return commandsRun.some(c => c.toLowerCase().includes('diff'));
    },
    expectedCommands: ["git diff"],
    livePreview: { hasAbout: false, hasMenu: false, hasContact: false }
  },
  {
    id: 6,
    levelNumber: 1,
    lessonNumber: 5,
    title: "Lekcija 5: git add .",
    category: "Nivo 1: Osnove",
    story: "Sad znaš zašto je diff bio prazan — Git još ništa ne prati. Vreme je da mu kažeš: 'prati ove fajlove, spremni su za sledeći commit.'",
    whyItMatters: "Staging zona (index) je Git-ova 'čekaonica' — mesto gde biraš tačno šta ide u sledeći commit. Tačka (.) znači 'sve izmene u ovom folderu i podfolderima'.",
    task: "Pripremi sve trenutne fajlove projekta odjednom za sledeći commit.",
    hint1: "Koja komanda 'dodaje' fajlove u staging zonu? A šta bi mogla da znači tačka (.) umesto imena fajla?",
    hint2: "git add .",
    expectedResult: "git status sada prikazuje fajlove pod Changes to be committed (zelenom bojom) umesto crvene. Fajlovi su staged u Folderu Projekta.",
    quickOverview: "git add . — dodaje sve izmene iz radnog direktorijuma u staging zonu.",
    description: `### Priča
Sad znaš zašto je diff bio prazan — Git još ništa ne prati. Vreme je da mu kažeš: "prati ove fajlove, spremni su za sledeći commit."

### Zašto je ovo bitno
Staging zona (index) je Git-ova "čekaonica" — mesto gde biraš *tačno* šta ide u sledeći commit, umesto da svaka sitna izmena na disku odmah postane deo trajne istorije. Tačka (\`.\`) znači "sve izmene u ovom folderu".`,
    initialState: {
      isInitialized: true,
      commits: {},
      branches: { main: '' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: ['index.html', 'style.css', 'script.js', '.gitignore'],
        ignored: ['node_modules/', 'secrets.txt', '.DS_Store']
      },
      gitignorePatterns: ['node_modules/', 'secrets.txt', '.DS_Store'],
      hasRemote: false
    },
    validate: (state: RepoState) => {
      return state.index.staged.length >= 3;
    },
    expectedCommands: ["git add"],
    livePreview: { hasAbout: false, hasMenu: false, hasContact: false }
  },
  {
    id: 7,
    levelNumber: 1,
    lessonNumber: 6,
    title: "Lekcija 6: git commit -m \"poruka\"",
    category: "Nivo 1: Osnove",
    story: "Fajlovi čekaju u staging zoni. Sledeći korak je da to stanje trajno sačuvaš kao prvi zvanični snimak projekta Kafić Luna.",
    whyItMatters: "Commit je 'vremenska kapsula' — tačka u istoriji na koju se uvek možeš vratiti. Poruka uz commit (-m) je beleška budućem tebi o tome šta i zašto je promenjeno.",
    task: "Sačuvaj trenutno pripremljene izmene kao prvi commit u istoriji projekta, sa porukom koja opisuje šta je urađeno.",
    hint1: "Koja komanda 'zapečati' staged izmene u istoriju? Kojom opcijom prilažeš tekstualnu poruku uz nju?",
    hint2: "git commit -m \"Dodaj početnu strukturu Kafić Luna sajta\"",
    expectedResult: "Vizuelni Git Graf dobija svoj prvi čvor — tvoj prvi commit sa porukom i hešom. Radni direktorijum je čist.",
    quickOverview: "git commit -m \"poruka\" — trajno snima staged izmene uz opisnu poruku.",
    description: `### Priča
Fajlovi čekaju u staging zoni. Sledeći korak je da to stanje trajno sačuvaš kao prvi zvanični snimak projekta Kafić Luna.

### Zašto je ovo bitno
Commit je "vremenska kapsula" — tačka u istoriji na koju se uvek možeš vratiti. Poruka uz commit (\`-m\`) nije formalnost: to je beleška o tome šta je urađeno.`,
    initialState: {
      isInitialized: true,
      commits: {},
      branches: { main: '' },
      head: { type: 'branch', target: 'main' },
      index: { staged: ['index.html', 'style.css', 'script.js', '.gitignore'], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: [],
        ignored: ['node_modules/', 'secrets.txt', '.DS_Store']
      },
      gitignorePatterns: ['node_modules/', 'secrets.txt', '.DS_Store'],
      hasRemote: false
    },
    validate: (state: RepoState) => {
      const commitIds = Object.keys(state.commits);
      return commitIds.length >= 1 && state.branches['main'] === commitIds[0];
    },
    expectedCommands: ["git commit"],
    livePreview: { hasAbout: false, hasMenu: false, hasContact: false }
  },
  {
    id: 8,
    levelNumber: 1,
    lessonNumber: 7,
    title: "Lekcija 7: git log",
    category: "Nivo 1: Osnove",
    story: "Vratio/la si se posle pauze i hoćeš da se podsetiš šta je tačno urađeno do sad na projektu.",
    whyItMatters: "Graf prozor daje ti vizuelni pregled, ali git log je verzija koju dobijaš direktno u terminalu, svuda — čak i kad radiš na udaljenom serveru bez grafičkog alata.",
    task: "Pronađi način da u terminalu vidiš listu svih commit-ova napravljenih do sad, sa detaljima o svakom.",
    hint1: "Koja komanda ti daje 'dnevnik' odnosno hronološku listu commit-ova?",
    hint2: "git log",
    expectedResult: "Terminal ispisuje commit: pun heš, autora, datum i poruku.",
    quickOverview: "git log — ispisuje istoriju commit-ova (heš, autor, datum, poruka).",
    description: `### Priča
Vratio/la si se posle pauze i hoćeš da se podsetiš šta je tačno urađeno do sad na projektu.

### Zašto je ovo bitno
Graf prozor daje ti vizuelni pregled, ali \`git log\` je verzija koju dobijaš direktno u terminalu, svuda — čak i kad radiš na tuđem računaru ili serveru.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Dodaj početnu strukturu Kafić Luna sajta', author: 'Luka <luka@kafic-luna.rs>', date: 'Danas' }
      },
      branches: { main: 'C1' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: [],
        ignored: ['node_modules/', 'secrets.txt', '.DS_Store']
      },
      gitignorePatterns: ['node_modules/', 'secrets.txt', '.DS_Store'],
      hasRemote: false
    },
    validate: (_state: RepoState, commandsRun = []) => {
      return commandsRun.some(c => c.toLowerCase().includes('log'));
    },
    expectedCommands: ["git log"],
    livePreview: { hasAbout: false, hasMenu: false, hasContact: false }
  },
  {
    id: 9,
    levelNumber: 1,
    lessonNumber: 8,
    title: "Lekcija 8: git push origin main",
    category: "Nivo 1: Osnove",
    story: "Tvoj prvi commit trenutno postoji samo na tvom računaru. Ako disk otkaže sutra, sve nestaje. Vreme je da napraviš rezervnu kopiju istorije na udaljenom repozitorijumu ('origin') — tvom Kafić Luna 'oblaku'.",
    whyItMatters: "push je ono što ti omogućava saradnju — bez njega, tvoje izmene ostaju zaključane na tvom računaru. Povezuje lokalni rad sa timom i sa GitHub-om.",
    task: "Pošalji svoju lokalnu istoriju commit-ova na udaljeni repozitorijum origin, na granu main.",
    hint1: "Koja komanda 'gura' (push) commit-ove ka udaljenom repozitorijumu?",
    hint2: "git push origin main",
    expectedResult: "Vizuelni Git Graf dobija oznaku origin/main pored tvog poslednjeg commit-a — lokalna i udaljena istorija su sinhronizovane.",
    quickOverview: "git push origin main — šalje lokalne commit-ove na udaljenu granu main repozitorijuma origin.",
    description: `### Priča
Tvoj prvi commit trenutno postoji samo na tvom računaru. Ako disk otkaže sutra, sve nestaje. Vreme je da napraviš rezervnu kopiju istorije na udaljenom repozitorijumu ("origin") — tvom Kafić Luna "oblaku".

### Zašto je ovo bitno
\`push\` je ono što ti omogućava saradnju — bez njega, tvoje izmene ostaju zaključane na tvom računaru.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Dodaj početnu strukturu Kafić Luna sajta', author: 'Luka <luka@kafic-luna.rs>', date: 'Danas' }
      },
      branches: { main: 'C1' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: []
      },
      hasRemote: false
    },
    validate: (state: RepoState) => {
      return state.remoteBranches !== undefined && state.remoteBranches['origin/main'] === 'C1';
    },
    expectedCommands: ["git push"],
    livePreview: { hasAbout: false, hasMenu: false, hasContact: false }
  },
  {
    id: 10,
    levelNumber: 1,
    lessonNumber: 9,
    title: "Lekcija 9: git pull origin main",
    category: "Nivo 1: Osnove",
    story: "Dok si bio/la odsutan/na, tvoj AI asistent (ili koleginica Iva) je direktno na udaljenom repozitorijumu dodao/la sekciju 'O nama' na sajt Kafić Luna. Tvoja lokalna kopija to još ne zna.",
    whyItMatters: "Rad retko ide u jednom smeru — timovi i AI alati stalno dodaju izmene na zajednički repozitorijum. pull je način da tvoj lokalni projekat ostane ažuran.",
    task: "Preuzmi najnovije izmene sa origin repozitorijuma, sa grane main, u svoj lokalni projekat.",
    hint1: "Koja komanda 'povlači' (pull) nove promene sa udaljenog repozitorijuma, na isti način na koji push šalje tvoje?",
    hint2: "git pull origin main",
    expectedResult: "Projekat prozor i Live Web Pregledač pokazuju ažuriran index.html sa novom sekcijom 'O nama'. Git Graf dobija novi commit koji je stigao spolja.",
    quickOverview: "git pull origin main — preuzima i spaja izmene sa udaljene grane main u tvoju lokalnu granu.",
    description: `### Priča
Dok si bio/la odsutan/na, tvoj AI asistent (ili kolega) je direktno na udaljenom repozitorijumu dodao/la sekciju "O nama" na sajt Kafić Luna. Tvoja lokalna kopija to još ne zna.

### Zašto je ovo bitno
Rad retko ide u jednom smeru — timovi i AI alati stalno dodaju izmene na zajednički repozitorijum. \`pull\` je način da tvoj lokalni projekat ostane ažuran.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Dodaj početnu strukturu Kafić Luna sajta', author: 'Luka <luka@kafic-luna.rs>', date: 'Danas' }
      },
      branches: { main: 'C1' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: []
      },
      remoteBranches: {
        'origin/main': 'C1'
      },
      hasRemote: true
    },
    validate: (state: RepoState) => {
      const commitIds = Object.keys(state.commits);
      return commitIds.length >= 2 && state.branches['main'] !== 'C1';
    },
    expectedCommands: ["git pull"],
    livePreview: { hasAbout: true, hasMenu: false, hasContact: false }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NIVO 2: SREDNJI NIVO — KAFIC LUNA (12 LEKCIJA)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 11,
    levelNumber: 2,
    lessonNumber: 0,
    title: "Lekcija 0: Zašto grananje menja sve",
    category: "Nivo 2: Srednji nivo",
    isReadingOnly: true,
    story: "Do sad si radio/la direktno na main grani — svaki commit ide pravo u stabilnu verziju. Čim se pojavi koleginica Iva ili AI asistent, direktan rad na main postaje rizičan.",
    whyItMatters: "Grana (branch) je paralelna kopija projekta — svoj mali 'šta ako' svet u kom možeš da eksperimentišeš, a main ostaje netaknut sve dok ne odlučiš da spojiš rad.",
    task: "Pročitaj koncept grananja i klikni na dugme 'Sledeći nivo' ispod da započneš rad na granama.",
    hint1: "Ovo je uvodna lekcija o grananju i timskom radu sa Ivom.",
    hint2: "Klikni na dugme 'Sledeći nivo 🔓' ispod.",
    expectedResult: "Upoznavanje sa radom na paralelnim granama.",
    quickOverview: "Grana (branch) — izolovan tok razvoja koji štiti stabilnu main verziju.",
    description: `### Zašto grananje menja sve

Do sad si radio/la direktno na \`main\` grani — svaki commit ide pravo u "zvaničnu", stabilnu verziju sajta. To je u redu dok si sam/a, ali čim se pojavi još neko (ili AI asistent koji generiše kod dok ti radiš nešto drugo), direktan rad na \`main\` postaje rizičan.

**Grana (branch)** je paralelna kopija projekta — svoj mali "šta ako" svet u kom možeš da eksperimentišeš, praviš commit-ove, čak i pogrešiš, a \`main\` ostaje netaknut sve dok ti sam/a ne odlučiš da svoj rad spojiš nazad.

Od ove lekcije, na projektu Kafić Luna radiš sa **Ivom**, koleginicom koja radi paralelno na sopstvenim granama. Njen rad će ti kasnije doneti i prvi pravi konflikt.

<div class="xp-code-box" style="text-align: center; padding: 10px; font-family: monospace; font-size: 11.5px; color: #1e3a8a;">
  <div><strong>main:</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;●───●───●───●───●───●</div>
  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\\ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</div>
  <div><strong style="color: #059669;">tvoja grana:</strong> &nbsp;&nbsp;&nbsp;&nbsp;●───●───●───●</div>
</div>

Kreni na sledeću lekciju.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Dodaj početnu strukturu Kafić Luna sajta', author: 'Luka', date: 'Danas' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Dodaj "O nama" sekciju', author: 'Iva', date: 'Danas' }
      },
      branches: { main: 'C2' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: []
      },
      hasRemote: true
    },
    validate: () => true,
    expectedCommands: [],
    livePreview: { hasAbout: true, hasMenu: false, hasContact: false }
  },
  {
    id: 12,
    levelNumber: 2,
    lessonNumber: 1,
    title: "Lekcija 1: git branch i git switch -c",
    category: "Nivo 2: Srednji nivo",
    story: "Želiš da dodaš novu sekciju 'Meni' na sajt, ali ne želiš da nedovršen rad ide direktno na main, koji je trenutno živ i stabilan.",
    whyItMatters: "Ovo je navika profesionalaca za svaku novu funkcionalnost: nova grana = izolovan prostor za rad bez rizika.",
    task: "Napravi novu granu za rad na sekciji menija, i odmah se prebaci na nju — u jednom potezu.",
    hint1: "git branch pravi granu, a git switch prebacuje. Koja opcija ih kombinuje u jednu komandu?",
    hint2: "git switch -c meni-sekcija",
    expectedResult: "Vizuelni Git Graf prikazuje novu granu meni-sekcija. Terminal prompt pokazuje da si na meni-sekcija.",
    quickOverview: "git switch -c <ime> — pravi novu granu i odmah se prebacuje na nju.",
    description: `### Priča
Želiš da dodaš novu sekciju "Meni" na sajt, ali ne želiš da nedovršen rad ide direktno na \`main\`, koji je trenutno živ i stabilan.

### Zašto je ovo bitno
Nova grana = izolovan prostor za rad, bez rizika da pokvariš ono što već radi.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Dodaj početnu strukturu Kafić Luna sajta' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Dodaj "O nama" sekciju' }
      },
      branches: { main: 'C2' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: []
      },
      hasRemote: true
    },
    validate: (state: RepoState) => {
      return (
        state.branches['meni-sekcija'] !== undefined &&
        state.head.type === 'branch' &&
        state.head.target === 'meni-sekcija'
      );
    },
    expectedCommands: ["git switch", "git branch", "git checkout"],
    livePreview: { hasAbout: true, hasMenu: false, hasContact: false }
  },
  {
    id: 13,
    levelNumber: 2,
    lessonNumber: 2,
    title: "Lekcija 2: git merge",
    category: "Nivo 2: Srednji nivo",
    story: "Na grani meni-sekcija si dodao/la meni i commit-ovao/la. Sad je sekcija spremna i želiš je vratiti u main.",
    whyItMatters: "Grananje bez spajanja je beskorisno — svaki uspešan rad se vraća u glavnu liniju. Pošto se main nije menjao, ovo je fast-forward merge.",
    task: "Vrati se na main granu (git switch main), pa spoji svoj završeni rad sa grane meni-sekcija u nju.",
    hint1: "Koja komanda spaja navedenu granu u granu na kojoj se trenutno nalaziš?",
    hint2: "git switch main pa git merge meni-sekcija",
    expectedResult: "index.html i Live Browser na main grani sada sadrže Meni sekciju! Git Graf pokazuje da su main i meni-sekcija na istoj tački.",
    quickOverview: "git merge <grana> — spaja navedenu granu u trenutnu granu.",
    description: `### Priča
Na grani \`meni-sekcija\` si dodao/la HTML/CSS za meni i već si to commit-ovao/la. Sad je sekcija spremna i želiš je vratiti u \`main\`.

### Zašto je ovo bitno
Pošto se \`main\` nije menjao dok si ti radio/la, ovo će biti najjednostavniji **fast-forward** merge — Git samo pomera pokazivač \`main\` grane napred.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Dodaj početnu strukturu Kafić Luna sajta' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Dodaj "O nama" sekciju' },
        C3: { id: 'C3', parentIds: ['C2'], message: 'Dodaj Meni sekciju i cenovnik kafe', author: 'Luka' }
      },
      branches: { main: 'C2', 'meni-sekcija': 'C3' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: []
      },
      hasRemote: true
    },
    validate: (state: RepoState) => {
      return (
        state.branches['main'] === 'C3' &&
        state.head.type === 'branch' &&
        state.head.target === 'main'
      );
    },
    expectedCommands: ["git merge"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: false }
  },
  {
    id: 14,
    levelNumber: 2,
    lessonNumber: 3,
    title: "Lekcija 3: Merge konflikt",
    category: "Nivo 2: Srednji nivo",
    story: "Dok si ti radio/la na meniju, Iva je nezavisno radila na svojoj grani kontakt-forma — i menjala je isti red u navigaciji index.html da doda link ka kontakt formi. Sad spajanje izaziva pravi sukob!",
    whyItMatters: "Konflikti nisu greška — normalan su deo timskog rada čim dvoje ljudi nezavisno promene isti red istog fajla. Iskusni developeri mirno rešavaju konflikte.",
    task: "Pokušaj da spojiš kontakt-forma granu u main. Git će javiti konflikt u index.html — razreši ga (zadrži oba linka), dodaj index.html i završi commit.",
    hint1: "Git ostavlja markere <<<<<<<, =======, >>>>>>>. Možeš u Folderu Projekta kliknuti na 'Razreši konflikt' ili pripremiti sa git add index.html pa git commit.",
    hint2: "git merge kontakt-forma -> git add index.html -> git commit -m \"Spoji kontakt formu i meni\"",
    expectedResult: "Terminal javlja CONFLICT u index.html. Nakon rešavanja, Git Graf prikazuje pravi spajajući merge commit sa dve linije koje se stapaju.",
    quickOverview: "Konflikt: uredi sporni deo između <<<<<<< i >>>>>>>, pa git add + git commit.",
    description: `### Priča
Dok si ti radio/la na meniju, Iva je nezavisno radila na svojoj grani \`kontakt-forma\` — i menjala je **isti red** u navigaciji \`index.html\` da doda link ka kontakt formi. Spajanje izaziva sukob!

### Zašto je ovo bitno
Konflikti se dešavaju čim dvoje ljudi (ili ti i AI asistent) nezavisno promene isti deo fajla.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Početna struktura' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'O nama sekcija' },
        C3: { id: 'C3', parentIds: ['C2'], message: 'Dodat meni', author: 'Luka' },
        C4: { id: 'C4', parentIds: ['C2'], message: 'Dodata kontakt forma', author: 'Iva' }
      },
      branches: { main: 'C3', 'kontakt-forma': 'C4' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: []
      },
      hasRemote: true
    },
    validate: (state: RepoState) => {
      const mainCommitId = state.branches['main'];
      const mainCommit = state.commits[mainCommitId];
      return (
        mainCommit &&
        mainCommit.parentIds.length >= 2 &&
        !state.mergeInProgress
      );
    },
    expectedCommands: ["git merge", "git add", "git commit"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true }
  },
  {
    id: 15,
    levelNumber: 2,
    lessonNumber: 4,
    title: "Lekcija 4: git log --oneline --graph --all",
    category: "Nivo 2: Srednji nivo",
    story: "Projekat sad ima nekoliko grana i jedan pravi merge iza sebe. Iz čistog terminala hoćeš da vidiš celu tu priču.",
    whyItMatters: "Grafički prikaz u terminalu je nezamenljiv na pravom serveru ili tuđem računaru bez GUI alata.",
    task: "Pronađi način da u terminalu vidiš sažetu, grafičku istoriju svih grana odjednom.",
    hint1: "Znaš git log. Dodaj mu opcije za jedan red, graf i sve grane.",
    hint2: "git log --oneline --graph --all",
    expectedResult: "Terminal ispisuje kompaktnu ASCII vizuelizaciju: grane, tačku spajanja i merge commit.",
    quickOverview: "git log --oneline --graph --all — sažeti, grafički prikaz istorije svih grana u terminalu.",
    description: `### Priča
Projekat sad ima nekoliko grana i jedan pravi merge iza sebe. Iz čistog terminala, bez otvaranja Grafa, hoćeš da vidiš celu tu priču.

### Zašto je ovo bitno
Kad radiš na pravom serveru bez GUI alata, ova kombinacija opcija ti daje grafički prikaz direktno u terminalu — kompaktno i sa svim granama vidljivim odjednom.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Početna struktura' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'O nama sekcija' },
        C3: { id: 'C3', parentIds: ['C2'], message: 'Dodat meni' },
        C4: { id: 'C4', parentIds: ['C2'], message: 'Dodata kontakt forma' },
        C5: { id: 'C5', parentIds: ['C3', 'C4'], message: 'Merge grane kontakt-forma u main' }
      },
      branches: { main: 'C5', 'meni-sekcija': 'C3', 'kontakt-forma': 'C4' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: []
      },
      hasRemote: true
    },
    validate: (_state: RepoState, commandsRun = []) => {
      return commandsRun.some(c => c.toLowerCase().includes('log') && (c.includes('--graph') || c.includes('--all') || c.includes('--oneline')));
    },
    expectedCommands: ["git log"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true }
  },
  {
    id: 16,
    levelNumber: 2,
    lessonNumber: 5,
    title: "Lekcija 5: git restore <fajl>",
    category: "Nivo 2: Srednji nivo",
    story: "Direktno na main probao/la si novu crvenu boju dugmeta u style.css. Ne sviđa ti se — želiš da fajl vratiš tačno onakav kakav je bio u poslednjem commit-u.",
    whyItMatters: "Ovo je najbezopasniji od undo alata — radi sa izmenama koje još nisi ni dodao (add) niti commit-ovao. Idealan za brze eksperimente koje želiš da baciš.",
    task: "Odbaci nesačuvanu izmenu u style.css i vrati fajl u stanje iz poslednjeg commit-a.",
    hint1: "Koja komanda 'vraća' (restore) fajl u prethodno sačuvano stanje?",
    hint2: "git restore style.css",
    expectedResult: "style.css i Live Web Pregledač se vraćaju na staru originalnu boju dugmeta. git status više ne prikazuje fajl kao izmenjen.",
    quickOverview: "git restore <fajl> — odbacuje nesačuvane izmene u radnom direktorijumu.",
    description: `### Priča
Direktno na \`main\` probao/la si novu boju dugmeta u \`style.css\`, samo da vidiš kako izgleda. Ne sviđa ti se — želiš da fajl vratiš tačno onakav kakav je bio u poslednjem commit-u, bez čuvanja ove izmene.

### Zašto je ovo bitno
Radi samo sa izmenama koje još nisi ni dodao (\`add\`) niti commit-ovao. Idealan za brze eksperimente koje želiš da baciš bez traga.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Početna struktura' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'O nama sekcija' },
        C3: { id: 'C3', parentIds: ['C2'], message: 'Meni i kontakt forma' }
      },
      branches: { main: 'C3' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: ['style.css'],
        untracked: []
      },
      hasRemote: true
    },
    validate: (state: RepoState) => {
      return !state.workingDirectory.modified.includes('style.css');
    },
    expectedCommands: ["git restore", "git checkout"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true, isStyleBroken: true }
  },
  {
    id: 17,
    levelNumber: 2,
    lessonNumber: 6,
    title: "Lekcija 6: git reset <fajl>",
    category: "Nivo 2: Srednji nivo",
    story: "Greškom si pokrenuo/la git add . i sad je i tvoj privatni test-fajl.txt u staging zoni, spreman za commit. Ne želiš da ga commit-uješ još.",
    whyItMatters: "add nije nepovratna radnja — reset te vraća korak unazad u staging procesu, bez brisanja bilo čega sa diska. Fajl ostaje na disku, samo izlazi iz staging zone.",
    task: "Izvuci taj fajl iz staging zone, tako da izmene ostanu na disku, ali više nije spreman za sledeći commit.",
    hint1: "Koja komanda 'resetuje' stanje fajla u staging zoni bez diranja sadržaja fajla?",
    hint2: "git reset test-fajl.txt (ili git reset)",
    expectedResult: "git status prikazuje fajl ponovo kao 'Changes not staged' umesto 'Changes to be committed'.",
    quickOverview: "git reset <fajl> — uklanja fajl iz staging zone, zadržava izmene na disku.",
    description: `### Priča
Radeći na sitnoj izmeni, greškom si pokrenuo/la \`git add .\` i sad je i tvoj privatni test fajl u staging zoni, spreman za sledeći commit. Ne želiš da ga commit-uješ još.

### Zašto je ovo bitno
\`add\` nije nepovratna radnja — ovo je komanda koja te vraća korak unazad u samom staging procesu, bez brisanja bilo čega sa diska.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Početna struktura' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Kafić Luna stabilna verzija' }
      },
      branches: { main: 'C2' },
      head: { type: 'branch', target: 'main' },
      index: { staged: ['test-fajl.txt'], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore', 'test-fajl.txt'],
        modified: ['test-fajl.txt'],
        untracked: []
      },
      hasRemote: true
    },
    validate: (state: RepoState) => {
      return !state.index.staged.includes('test-fajl.txt');
    },
    expectedCommands: ["git reset"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true }
  },
  {
    id: 18,
    levelNumber: 2,
    lessonNumber: 7,
    title: "Lekcija 7: git revert",
    category: "Nivo 2: Srednji nivo",
    story: "Poslednji commit na main (koji je već i push-ovan) pokvario je link ka Meni sekciji. Fajl je već objavljen — Iva ga je već povukla. Ne sme se brisati istorija.",
    whyItMatters: "Kad je kod deljen sa timom, brisanje istorije je opasno. revert rešava to bezbedno: pravi nov commit koji poništava efekte starog.",
    task: "Poništi efekte poslednjeg commit-a na način koji produžava istoriju novim commit-om.",
    hint1: "Koja komanda pravi novi commit koji radi 'suprotno' od određenog commit-a?",
    hint2: "git revert HEAD",
    expectedResult: "Vizuelni Git Graf dobija nov commit iznad problematičnog, jasno označen kao revert. index.html se vraća u ispravno stanje.",
    quickOverview: "git revert <commit> — pravi novi commit koji poništava izmene iz navedenog commit-a.",
    description: `### Priča
Poslednji commit na \`main\` (koji je već i push-ovan) pokvario je link ka "Meni" sekciji. Fajl je već objavljen — nije opcija da se pretvaraš da se commit nikad nije desio, jer je Iva već povukla tu verziju.

### Zašto je ovo bitno
Kad je nešto već deljeno sa timom, brisanje istorije je opasno. \`revert\` pravi **nov** commit koji poništava efekte starog, bezbedno.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Kafić Luna baza' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Pokvaren link ka meniju', author: 'Luka' }
      },
      branches: { main: 'C2' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: [],
        untracked: []
      },
      hasRemote: true
    },
    validate: (state: RepoState) => {
      const commitIds = Object.keys(state.commits);
      return commitIds.length >= 3 && state.branches['main'] !== 'C2';
    },
    expectedCommands: ["git revert"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true }
  },
  {
    id: 19,
    levelNumber: 2,
    lessonNumber: 8,
    title: "Lekcija 8: git stash i git stash pop",
    category: "Nivo 2: Srednji nivo",
    story: "Usred si menjanja script.js za novu logiku menija — nesačuvano. Odjednom, hitno moraš da pređeš na main da ispraviš bag. Git ne dozvoljava prebacivanje sa nepripremljenim izmenama.",
    whyItMatters: "stash privremeno sklanja radno stablo na stranu, tako da možeš promeniti granu, a potom vratiti izmene sa stash pop.",
    task: "Privremeno sačuvaj svoje nesačuvane izmene na stranu sa git stash, a potom ih vrati sa git stash pop.",
    hint1: "Koja komanda doslovno znači 'spremi na stranu' (stash), a koja ih vraća (pop)?",
    hint2: "1. git stash\n2. git stash pop",
    expectedResult: "git status prikazuje čist radni direktorijum nakon stash-a, a nakon stash pop izmene se vraćaju tačno tamo gde su bile.",
    quickOverview: "git stash — privremeno sklanja nesačuvane izmene. git stash pop — vraća ih nazad.",
    description: `### Priča
Usred si menjanja \`script.js\` za novu logiku menija — nesačuvano, nedovršeno. Odjednom, hitno moraš da pređeš na \`main\` da ispraviš bag koji je Iva prijavila.

### Zašto je ovo bitno
Umesto da praviš "smeće" commit samo da bi promenio/la granu, \`stash\` privremeno sklanja izmene na stranu.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Kafić Luna baza' }
      },
      branches: { main: 'C1' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore'],
        modified: ['script.js'],
        untracked: []
      },
      stash: [],
      hasRemote: true
    },
    validate: (state: RepoState, commandsRun = []) => {
      const hasStash = commandsRun.some(c => c.toLowerCase().includes('stash'));
      return hasStash && (!state.stash || state.stash.length === 0);
    },
    expectedCommands: ["git stash"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true }
  },
  {
    id: 20,
    levelNumber: 2,
    lessonNumber: 9,
    title: "Lekcija 9: git commit --amend",
    category: "Nivo 2: Srednji nivo",
    story: "Upravo si commit-ovao/la sa porukom 'fix bag' — nejasno, i primetio/la si da si zaboravio/la da dodaš favicon.ico, koji je trebalo da bude deo istog commit-a.",
    whyItMatters: "Za sitne tek napravljene greške ne mora se praviti nov commit. --amend ti omogućava da prepraviš poslednji commit kao da si ga od početka dobro napravio/la.",
    task: "Dodaj zaboravljeni fajl favicon.ico i ispravi poruku poslednjeg commit-a bez pravljenja novog.",
    hint1: "Dodaj favicon.ico pomoću git add, a zatim commit-uj uz opciju --amend.",
    hint2: "git add favicon.ico\ngit commit --amend -m \"Popravi link ka meniju i dodaj favicon\"",
    expectedResult: "Vizuelni Git Graf i dalje prikazuje isti broj commit-ova — poslednji je zamenjen ispravljenom verzijom. favicon.ico je postao deo commit-a i prikazuje se u Live Browseru!",
    quickOverview: "git commit --amend — menja sadržaj i/ili poruku poslednjeg commit-a.",
    description: `### Priča
Upravo si commit-ovao/la sa porukom \`"fix bag"\` — nejasno, i primetio/la si da si zaboravio/la da dodaš \`favicon.ico\`, koji je trebalo da bude deo istog commit-a.

### Zašto je ovo bitno
\`--amend\` ti omogućava da "prepraviš" **poslednji** commit kao da si ga od početka dobro napravio/la.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Kafić Luna baza' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'fix bag', author: 'Luka' }
      },
      branches: { main: 'C2' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore', 'favicon.ico'],
        modified: [],
        untracked: ['favicon.ico']
      },
      hasRemote: true
    },
    validate: (state: RepoState) => {
      const cId = state.branches['main'];
      const commit = state.commits[cId];
      return commit && commit.message.toLowerCase() !== 'fix bag' && !state.workingDirectory.untracked.includes('favicon.ico');
    },
    expectedCommands: ["git add", "git commit"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true, hasFavicon: true }
  },
  {
    id: 21,
    levelNumber: 2,
    lessonNumber: "Bonus A",
    title: "Bonus Lekcija A: git tag",
    category: "Nivo 2: Srednji nivo",
    story: "Kafić Luna sajt je stigao do svoje prve 'zvanične' verzije — želiš da obeležiš tačno taj commit kao v1.0, da ga lako pronađeš kasnije.",
    whyItMatters: "Tagovi služe kao trajne 'nalepnice' za verzije (releases) koje se lako pamte i referenciraju.",
    task: "Obeleži trenutni commit oznakom verzije v1.0.",
    hint1: "Koja komanda 'lepi nalepnicu' sa imenom na određeni commit?",
    hint2: "git tag v1.0",
    expectedResult: "Vizuelni Git Graf prikazuje oznaku 🏷️ v1.0 na poslednjem commit-u.",
    quickOverview: "git tag <ime> — obeležava trenutni commit prepoznatljivim imenom.",
    description: `### Priča
Kafić Luna sajt je stigao do svoje prve "zvanične" verzije — želiš da obeležiš tačno taj commit kao \`v1.0\`, da ga lako pronađeš kasnije.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Kafić Luna baza' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Popravi meni i dodaj favicon (Spremno za v1.0)' }
      },
      branches: { main: 'C2' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore', 'favicon.ico'],
        modified: [],
        untracked: []
      },
      tags: {},
      hasRemote: true
    },
    validate: (state: RepoState) => {
      return state.tags !== undefined && state.tags['v1.0'] !== undefined;
    },
    expectedCommands: ["git tag"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true, hasFavicon: true, tag: 'v1.0' }
  },
  {
    id: 22,
    levelNumber: 2,
    lessonNumber: "Bonus B",
    title: "Bonus Lekcija B: git diff grana1..grana2",
    category: "Nivo 2: Srednji nivo",
    story: "Pre nego što spojiš Ivinu novu granu, želiš unapred da vidiš sve razlike između nje i main, ne samo poslednju izmenu.",
    whyItMatters: "Poređenje grana ti omogućava pregled kompletnog koda pre merge-a ili code review-a.",
    task: "Uporedi dve grane direktno, bez da ijednu od njih menjaš ili spajaš.",
    hint1: "Znaš git diff za radni direktorijum — ista komanda radi i sa imenima dve grane razdvojene sa ..",
    hint2: "git diff main..kontakt-forma",
    expectedResult: "Terminal ispisuje sve linije koda koje se razlikuju između dve grane.",
    quickOverview: "git diff grana1..grana2 — prikazuje sve razlike između dve grane.",
    description: `### Priča
Pre nego što spojiš Ivinu novu granu, želiš unapred da vidiš *sve* razlike između nje i \`main\`, ne samo poslednju izmenu.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Kafić Luna baza' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Rad na main grani' },
        C3: { id: 'C3', parentIds: ['C1'], message: 'Rad na kontakt-forma grani' }
      },
      branches: { main: 'C2', 'kontakt-forma': 'C3' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore', 'favicon.ico'],
        modified: [],
        untracked: []
      },
      hasRemote: true
    },
    validate: (_state: RepoState, commandsRun = []) => {
      return commandsRun.some(c => c.toLowerCase().includes('diff'));
    },
    expectedCommands: ["git diff"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true, hasFavicon: true, tag: 'v1.0' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NIVO 3: NAPREDNI NIVO — GIT REMOTE NA GITHUB-U (VIDEO LEKCIJA)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 23,
    levelNumber: 3,
    lessonNumber: 0,
    title: "Nivo 3: Git Remote & GitHub (Video Lekcija)",
    category: "Nivo 3: Video lekcija",
    isReadingOnly: true,
    story: "Nivo 3 uvodi pravi GitHub — remote koji do sad nije bio stvaran postaje stvaran, uz clone, fork/PR radni tok i code review sa AI asistentima.",
    whyItMatters: "Ovaj nivo predstavlja video vodič kroz povezivanje na pravi GitHub, kreiranje repozitorijuma, SSH ključeve i timski rad. Nema zadataka niti hintova — možeš pogledati video ili preuzeti sertifikat!",
    task: "Pogledaj video lekciju za rad sa pravim GitHub repozitorijumom i vibecoding saradnju.",
    hint1: "Nivo 3 nema zadataka ni hintova. Namenjen je za video demonstraciju.",
    hint2: "Možeš pogledati video materijal ili kliknuti na 'Završi i preuzmi sertifikat'.",
    expectedResult: "Prikaz video plejera i vodiča za GitHub platformu.",
    quickOverview: "GitHub — platforma za deljenje koda, Pull Requests (PR), Fork, i saradnju na Git repozitorijumima.",
    description: `### Nivo 3: Git Remote na GitHub Platformi (Video Lekcija)

Dobrodošli u završni nivo kursa! U ovom nivou prelazimo sa simuliranog lokalnog okruženja na **pravi GitHub**.

**Teme koje se obrađuju u video lekciji:**
*   **Kreiranje repozitorijuma na GitHub-u** (Public vs Private, README, licenca)
*   **Autentifikacija** (SSH ključevi i Personal Access Tokens)
*   **Povezivanje lokalnog projekta:**
    \`\`\`bash
    git remote add origin https://github.com/korisnik/kafic-luna.git
    git branch -M main
    git push -u origin main
    \`\`\`
*   **Kloniranje tuđih projekata:** \`git clone <url>\`
*   **Pull Requests (PR) i Fork radni tok** — kako se doprinosi tuđem kodu
*   **Code Review i Vibecoding** — integracija AI alata u Git radni tok

*Napomena: Ovaj nivo je video formata bez automatskih zadataka. Možeš slobodno pogledati video klip i preuzeti svoj zvanični sertifikat.*`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Kafić Luna v1.0 produkcija' }
      },
      branches: { main: 'C1' },
      head: { type: 'branch', target: 'main' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['index.html', 'style.css', 'script.js', '.gitignore', 'favicon.ico'],
        modified: [],
        untracked: []
      },
      tags: { 'v1.0': 'C1' },
      hasRemote: true
    },
    validate: () => true,
    expectedCommands: [],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true, hasFavicon: true, tag: 'v1.0' }
  }
];
