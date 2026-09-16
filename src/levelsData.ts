import { type RepoState, hasConflictMarkers } from './gitEngine';

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
    isConflict?: boolean;
    hasFavicon?: boolean;
    tag?: string;
  };
  // Reflection question shown after the lesson is solved — never gates progression, just checks understanding
  comprehensionCheck?: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
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
*   **Live Web Pregledač** — sajt Kafić Luna uživo!

💡 Usput, ako ikad zaboraviš neku komandu i ne želiš odmah da otvaraš Hint, ukucaj \`git help\` u terminalu — ispisaće ti spisak svih podržanih komandi u ovoj aplikaciji.`,
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
      // secrets.txt must not be staged or already committed — ignoring it afterwards doesn't undo that
      const secretsLeaked = state.index.staged.includes('secrets.txt') || Object.keys(state.commits).length > 0;
      return Boolean(hasSecrets && hasRanStatus && !secretsLeaked);
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
Commit je "vremenska kapsula" — tačka u istoriji na koju se uvek možeš vratiti. Poruka uz commit (\`-m\`) nije formalnost: to je beleška o tome šta je urađeno.

💡 Usput: svaki commit u sebi nosi i potpis autora. Pre prvog commit-a na pravom projektu, obično podesiš svoj identitet komandom \`git config user.name "Tvoje Ime"\` — probaj je slobodno, nije obavezna za ovu lekciju, ali ćeš je videti u pravim projektima.`,
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
    livePreview: { hasAbout: false, hasMenu: false, hasContact: false }
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
        C2: { id: 'C2', parentIds: ['C1'], message: 'Dodaj "O nama" sekciju', author: 'Iva', date: 'Danas', features: ['about'] }
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
    whyItMatters: "Ovo je navika profesionalaca za svaku novu funkcionalnost: nova grana = izolovan prostor za rad bez rizika. Flag '-c' dolazi od engleske reči 'create' (kreiraj) — omogućava ti da u jednom potezu napraviš granu i odmah pređeš na nju umesto kucanja dve odvojene komande (git branch pa git switch).",
    task: "Napravi novu granu za rad na sekciji menija (nazovi je **meni-sekcija**), i prebaci se na nju.",
    hint1: "Možeš prvo kreirati granu pa se prebaciti, ili iskoristiti flag -c (create) koji to radi u jednom potezu.",
    hint2: "1. U dva koraka:\ngit branch meni-sekcija\ngit switch meni-sekcija\n\n2. U jednom potezu (-c = create):\ngit switch -c meni-sekcija",
    expectedResult: "Vizuelni Git Graf prikazuje novu granu meni-sekcija. Terminal prompt pokazuje da si na meni-sekcija.",
    quickOverview: "git switch -c <ime> — kreira (-c = create) novu granu i odmah se prebacuje na nju.",
    description: `### Priča
Želiš da dodaš novu sekciju "Meni" na sajt, ali ne želiš da nedovršen rad ide direktno na \`main\`, koji je trenutno živ i stabilan.

### Zašto je ovo bitno
Nova grana = izolovan prostor za rad, bez rizika da pokvariš ono što već radi.`,
    initialState: {
      isInitialized: true,
      commits: {
        C1: { id: 'C1', parentIds: [], message: 'Dodaj početnu strukturu Kafić Luna sajta' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Dodaj "O nama" sekciju', features: ['about'] }
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
    expectedCommands: [],
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
    task: "Vrati se na main granu, pa spoji svoj završeni rad sa grane meni-sekcija u nju.",
    hint1: "Koja komanda spaja navedenu granu u granu na kojoj se trenutno nalaziš? (ukucaj 'git help' da prelistaš sve komande)",
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
        C2: { id: 'C2', parentIds: ['C1'], message: 'Dodaj "O nama" sekciju', features: ['about'] },
        C3: { id: 'C3', parentIds: ['C2'], message: 'Dodaj Meni sekciju i cenovnik kafe', author: 'Luka', features: ['menu'] }
      },
      branches: { main: 'C2', 'meni-sekcija': 'C3' },
      head: { type: 'branch', target: 'meni-sekcija' },
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
    livePreview: { hasAbout: true, hasMenu: false, hasContact: false }
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
    hint1: "Git ostavlja markere <<<<<<<, =======, >>>>>>>. U Folderu Projekta otvori index.html i klikni na 'Razreši konflikt' (ili ga uredi ručno). Rešen fajl zatim označi kao spreman za commit i sačuvaj spajanje.",
    hint2: "1. git merge kontakt-forma\n2. U Folderu Projekta otvori index.html i klikni 'Razreši konflikt'\n3. git add index.html\n4. git commit -m \"Spoji kontakt formu i meni\"",
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
        C2: { id: 'C2', parentIds: ['C1'], message: 'O nama sekcija', features: ['about'] },
        C3: { id: 'C3', parentIds: ['C2'], message: 'Dodat meni', author: 'Luka', features: ['menu'] },
        C4: { id: 'C4', parentIds: ['C2'], message: 'Dodata kontakt forma', author: 'Iva', features: ['contact'] }
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
      const mainCommit = state.commits[state.branches['main']];
      return Boolean(
        mainCommit &&
        mainCommit.parentIds.length >= 2 &&
        mainCommit.parentIds.includes(state.branches['kontakt-forma']) &&
        !state.mergeInProgress &&
        !hasConflictMarkers(state.fileContents?.['index.html'])
      );
    },
    expectedCommands: ["git merge", "git add", "git commit"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: false },
    comprehensionCheck: {
      question: "Commit koji si upravo napravio/la ima DVA roditelja (parentIds) umesto jednog. Zašto?",
      options: [
        "Zato što je to prvi commit u istoriji projekta.",
        "Zato što je to merge commit — spaja istoriju dve grane koje su se razišle (main i kontakt-forma) u jednu tačku.",
        "Zato što je fajl imao konflikt, pa Git čuva obe verzije zauvek.",
        "To je greška — svaki commit sme imati samo jednog roditelja.",
      ],
      answerIndex: 1,
      explanation: "Svaki 'obični' commit ima jednog roditelja (prethodni commit na toj grani). Merge commit je izuzetak — ima onoliko roditelja koliko grana spaja, ovde dve: poslednji commit sa main i poslednji commit sa kontakt-forma.",
    }
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
        C2: { id: 'C2', parentIds: ['C1'], message: 'O nama sekcija', features: ['about'] },
        C3: { id: 'C3', parentIds: ['C2'], message: 'Dodat meni', features: ['menu'] },
        C4: { id: 'C4', parentIds: ['C2'], message: 'Dodata kontakt forma', features: ['contact'] },
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
      return commandsRun.some(c =>
        c.startsWith('git log') && c.includes('--oneline') && c.includes('--graph') && c.includes('--all')
      );
    },
    expectedCommands: ["git log"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true },
    comprehensionCheck: {
      question: "U ispisu vidiš dve grane, meni-sekcija i kontakt-forma, kako se spajaju u jednu tačku (C5) na main grani. Šta se dešava sa meni-sekcija i kontakt-forma nakon merge-a?",
      options: [
        "Automatski se brišu, jer više nisu potrebne.",
        "I dalje postoje i i dalje pokazuju na svoje stare commit-ove (C3 i C4) — merge samo pomera main napred, grane ostaju gde su bile.",
        "Postaju iste kao main grana i menjaju ime u main.",
        "Prestaju da se pojavljuju u git log dok se ručno ne obrišu iz istorije.",
      ],
      answerIndex: 1,
      explanation: "Merge ne dira grane koje spaja — one i dalje pokazuju na svoj poslednji commit. Zato se u grafu i dalje vide meni-sekcija (C3) i kontakt-forma (C4), odvojeno od main (C5). Grana se briše samo eksplicitno, sa git branch -d.",
    }
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
        C2: { id: 'C2', parentIds: ['C1'], message: 'O nama sekcija', features: ['about'] },
        C3: { id: 'C3', parentIds: ['C2'], message: 'Meni i kontakt forma', features: ['menu', 'contact'] }
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
    validate: (state: RepoState, commandsRun = []) => {
      const usedRestore = commandsRun.some(c => c.startsWith('git restore') || c.startsWith('git checkout'));
      return usedRestore && !state.workingDirectory.modified.includes('style.css');
    },
    expectedCommands: [],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true }
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
        C2: { id: 'C2', parentIds: ['C1'], message: 'Pokvaren link ka meniju', author: 'Luka', breaks: ['menu'] }
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
      const mainCommit = state.commits[state.branches['main']];
      return mainCommit?.message === 'Revert "Pokvaren link ka meniju"';
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
      const restoredFromStash = commandsRun.some(c => c === 'git stash pop' || c === 'git stash apply');
      return (
        restoredFromStash &&
        (!state.stash || state.stash.length === 0) &&
        state.workingDirectory.modified.includes('script.js')
      );
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
    task: "Ovde ispravljaš DVE stvari u istom commit-u: 1) fajl koji nedostaje i 2) nejasnu poruku. Prvo pripremi favicon.ico kao i svaki drugi fajl, a zatim prepravi poslednji commit — u istom potezu mu daj i jasniju poruku.",
    hint1: "1. Prvi problem (nedostaje fajl): pripremi favicon.ico na isti način kao svaki drugi fajl.\n2. Drugi problem (nejasna poruka): commit ne pravi novi — prepravlja poslednji, opcijom koja doslovno znači 'ispravi/dopuni' (amend).",
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
      const commit = state.commits[state.branches['main']];
      return Boolean(
        commit &&
        Object.keys(state.commits).length === 2 && // amended, not a new commit
        commit.message.toLowerCase() !== 'fix bag' &&
        !state.workingDirectory.untracked.includes('favicon.ico') &&
        !state.index.staged.includes('favicon.ico')
      );
    },
    expectedCommands: ["git add", "git commit"],
    livePreview: { hasAbout: true, hasMenu: true, hasContact: true, hasFavicon: false }
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
      return commandsRun.some(c => c.startsWith('git diff') && c.includes('..') && c.includes('kontakt-forma'));
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

// ═══════════════════════════════════════════════════════════════════════════
// PORUKE KOJE JE STUDENT SAM NAPISAO
// ═══════════════════════════════════════════════════════════════════════════
// Isti commit se pojavljuje kroz više lekcija (npr. prvi commit iz Lekcije 6).
// Da predavač ne bi video jednu poruku u lekciji gde je student piše, a drugu,
// unapred zadatu, u sledećoj — poruka se pamti i ubacuje u kasnije lekcije.

export type UserMessageSlot = 'firstCommit' | 'contactMerge' | 'faviconAmend';
export type UserCommitMessages = Partial<Record<UserMessageSlot, string>>;

// Lekcija u kojoj student piše poruku -> kako u rešenom stanju pronaći taj commit
const USER_MESSAGE_CAPTURE: {
  [levelId: number]: { slot: UserMessageSlot; findCommitId: (state: RepoState) => string | undefined };
} = {
  // Nivo 1, Lekcija 6: git commit -m — prvi (root) commit
  7: { slot: 'firstCommit', findCommitId: state => Object.values(state.commits).find(c => c.parentIds.length === 0)?.id },
  // Nivo 2, Lekcija 3: merge commit koji spaja kontakt-forma
  14: {
    slot: 'contactMerge',
    findCommitId: state => Object.values(state.commits)
      .find(c => c.parentIds.length >= 2 && c.parentIds.includes(state.branches['kontakt-forma']))?.id,
  },
  // Nivo 2, Lekcija 9: commit ispravljen sa --amend (validacija garantuje da je to i dalje C2)
  20: { slot: 'faviconAmend', findCommitId: state => (state.commits['C2'] ? 'C2' : undefined) },
};

// Lekcija -> koji commit-ovi u njenom početnom stanju nose poruku studenta.
// Namerno se ne diraju commit-ovi čije poruke lekcija proverava (npr. C2 'fix bag', 'Pokvaren link ka meniju').
const USER_MESSAGE_COMMITS: { [levelId: number]: { [commitId: string]: UserMessageSlot } } = (() => {
  const map: { [levelId: number]: { [commitId: string]: UserMessageSlot } } = {};
  // Prvi commit projekta, od Lekcije 7 (git log) do Bonus lekcije B
  levels
    .filter(l => l.id > 7 && l.id <= 22 && l.initialState.commits['C1']?.parentIds.length === 0)
    .forEach(l => { map[l.id] = { C1: 'firstCommit' }; });
  map[15] = { ...map[15], C5: 'contactMerge' };  // Lekcija 2.4: merge commit iz Lekcije 2.3
  map[21] = { ...map[21], C2: 'faviconAmend' };  // Bonus A: commit ispravljen u Lekciji 2.9
  return map;
})();

// Početno stanje lekcije sa ubačenim porukama koje je student ranije napisao
export const getLevelInitialState = (level: Level, userMessages: UserCommitMessages): RepoState => {
  const state: RepoState = JSON.parse(JSON.stringify(level.initialState));
  Object.entries(USER_MESSAGE_COMMITS[level.id] ?? {}).forEach(([commitId, slot]) => {
    const message = userMessages[slot]?.trim();
    if (message && state.commits[commitId]) {
      state.commits[commitId].message = message;
    }
  });
  return state;
};

// Poruka koju treba zapamtiti iz (rešenog) stanja trenutne lekcije, ako je ima
export const captureUserCommitMessage = (
  level: Level,
  state: RepoState
): { slot: UserMessageSlot; message: string } | null => {
  const capture = USER_MESSAGE_CAPTURE[level.id];
  if (!capture) return null;
  const commitId = capture.findCommitId(state);
  const message = commitId ? state.commits[commitId]?.message.trim() : undefined;
  return message ? { slot: capture.slot, message } : null;
};

// Gitko opisuje preostale korake rečima, bez gotove komande — tačne komande su u Hint-ovima.
const GITKO_STEP_DESCRIPTIONS: { [command: string]: string } = {
  'git init': 'pokreneš Git praćenje foldera',
  'git status': 'proveriš stanje projekta',
  'git diff': 'pogledaš razlike u fajlovima',
  'git add': 'pripremiš izmene u staging zoni',
  'git commit': 'sačuvaš izmene u istoriji',
  'git log': 'pogledaš istoriju commit-ova',
  'git push': 'pošalješ commit-ove na udaljeni repozitorijum',
  'git pull': 'preuzmeš izmene sa udaljenog repozitorijuma',
  'git merge': 'spojiš granu',
  'git checkout': 'pređeš na drugu granu',
  'git switch': 'pređeš na drugu granu',
  'git reset': 'isprobaš komandu kojoj je posvećena ova lekcija (pogledaj naslov)',
  'git revert': 'poništiš commit novim commit-om',
  'git stash': 'skloniš izmene na stranu',
  'git tag': 'obeležiš commit oznakom',
};

export const describeMissingSteps = (commands: string[]): string =>
  commands
    .map(c => GITKO_STEP_DESCRIPTIONS[c.toLowerCase().trim()] ?? 'isprobaš komandu kojoj je posvećena ova lekcija (pogledaj naslov)')
    .join(', pa da ');

// Pametni asistent: ako student unese tačnu komandu ali sa pogrešnim imenom/argumentom ili redosledom,
// Gitko ga pohvali i prijateljski uputi na tačan naziv koji se traži u zadatku.
export const getGitkoSmartAdvice = (
  level: Level,
  cmd: string,
  prevState: RepoState,
  newState: RepoState
): string | null => {
  const cleanCmd = cmd.trim();
  const parts = cleanCmd.split(/\s+/);
  const gitCmd = parts[0]?.toLowerCase();
  const subCmd = parts[1]?.toLowerCase();
  const arg1 = parts[2];
  const arg2 = parts[3];

  if (gitCmd !== 'git') return null;

  // Nivo 1 Lekcija 1 (git init)
  if (level.id === 2) {
    if (subCmd !== 'init') {
      return `Dobar instinkt! 👏 Ali pre bilo koje druge Git radnje, ovaj folder prvo mora da postane Git repozitorijum. Kako bi na engleskom nazvao/la to „započinjanje“?`;
    }
  }

  // Nivo 1 Lekcija 2 (git status)
  if (level.id === 3) {
    if (subCmd !== 'status') {
      return `Super komanda! 👏 Ali pre dodavanja ili čuvanja, hajde prvo da pogledamo u kakvom je stanju projekat i koje fajlove Git vidi.`;
    }
  }

  // Nivo 1 Lekcija 3 (.gitignore)
  if (level.id === 4 || level.id === 5) {
    if (subCmd === 'commit' && prevState.index.staged.includes('secrets.txt')) {
      return `Ups! 🚨 secrets.txt je upravo trajno upisan u istoriju commit-ova — zato ga moramo ignorisati pre čuvanja. Klikni '🔄 Resetuj nivo' i probaj ponovo: prvo dopuni .gitignore, pa tek onda pripremi i sačuvaj izmene.`;
    }
    if (newState.index.staged.includes('secrets.txt')) {
      return `Pazi! ⚠️ secrets.txt je sada u staging zoni i ušao bi u sledeći commit. Prvo ga izvuci iz staging zone (fajl ostaje na disku), pa ga dopiši u .gitignore (File Explorer → .gitignore → 'Uredi').`;
    }
    if (subCmd === 'add' || subCmd === 'commit') {
      if (newState.workingDirectory.untracked.includes('secrets.txt')) {
        return `Pazi na tajne podatke! ⚠️ Pre nego što dodaš fajlove, prvo u File Exploreru otvori .gitignore, klikni 'Uredi', dopiši 'secrets.txt' i klikni 'Sačuvaj'.`;
      }
    }
    if (subCmd === 'status') {
      if (newState.workingDirectory.untracked.includes('secrets.txt')) {
        return `Još uvek vidimo secrets.txt pod Untracked files! 💡 Otvori .gitignore u File Exploreru, klikni 'Uredi', dopiši 'secrets.txt', klikni 'Sačuvaj' — pa ponovo proveri stanje projekta.`;
      }
    }
  }

  // Nivo 1 Lekcija 5 (git add .)
  if (level.id === 6) {
    if (subCmd === 'add') {
      if (arg1 && arg1 !== '.' && newState.index.staged.length < 3) {
        return `Super, dodao/la si ${arg1}! 👏 Za ovu lekciju želimo da pripremimo sve fajlove odjednom, u jednom koraku — umesto imena fajla postoji poseban znak koji znači „sve u ovom folderu“.`;
      }
    }
    if (subCmd === 'commit') {
      if (newState.index.staged.length === 0) {
        return `Staging zona je još prazna! 💡 Pre čuvanja, fajlove prvo treba pripremiti za commit.`;
      }
    }
  }

  // Nivo 1 Lekcija 8 (git push origin main)
  if (level.id === 9) {
    if (subCmd === 'push') {
      if (arg1 === 'origin' && arg2 && arg2 !== 'main') {
        return `Bravo za push! 👏 Samo proveri ime grane — u ovoj lekciji šaljemo na granu 'main'.`;
      }
      if (arg1 && arg1 !== 'origin') {
        return `Bravo za push! 👏 Proveri ime udaljenog repozitorijuma — u ovom projektu se zove 'origin', a grana je 'main'.`;
      }
    }
  }

  // Nivo 1 Lekcija 9 (git pull origin main)
  if (level.id === 10) {
    if (subCmd === 'pull') {
      if (arg1 === 'origin' && arg2 && arg2 !== 'main') {
        return `Bravo za pull! 👏 Samo proveri ime grane — u ovoj lekciji preuzimamo sa grane 'main'.`;
      }
      if (arg1 && arg1 !== 'origin') {
        return `Bravo za pull! 👏 Proveri ime udaljenog repozitorijuma — u ovom projektu se zove 'origin', a grana je 'main'.`;
      }
    }
  }

  // Nivo 2 Lekcija 1 (Grananje): traži se 'meni-sekcija'
  if (level.id === 12) {
    if (subCmd === 'switch' || subCmd === 'checkout' || subCmd === 'branch') {
      const cIdx = parts.indexOf('-c');
      const bIdx = parts.indexOf('-b');
      const targetBranch = cIdx !== -1 ? parts[cIdx + 1]
        : bIdx !== -1 ? parts[bIdx + 1]
          : (subCmd === 'branch' && arg1 && !arg1.startsWith('-')) ? arg1
            : (subCmd === 'switch' && arg1 && !arg1.startsWith('-')) ? arg1
              : null;

      if (targetBranch && targetBranch !== 'meni-sekcija' && targetBranch !== 'main') {
        return `Bravo, grana je napravljena! 👏 Ali za potrebe ove lekcije mora da se zove tačno 'meni-sekcija'. Napravi granu sa baš tim imenom.`;
      }

      if (newState.branches['meni-sekcija'] && newState.head.target !== 'meni-sekcija') {
        return `Odlično, grana 'meni-sekcija' postoji! 👏 Još samo da se prebaciš na nju — trenutno si i dalje na drugoj grani.`;
      }
    }
  }

  // Nivo 2 Lekcija 2 (Merge): traži se spajanje 'meni-sekcija' u 'main'
  if (level.id === 13) {
    if (subCmd === 'merge') {
      if (newState.head.target !== 'main') {
        return `Pazi na granu! 💡 Spajanje uvek ide u granu na kojoj se trenutno nalaziš. Prvo pređi na 'main', pa tek onda u nju spoji rad sa 'meni-sekcija'.`;
      }
      if (arg1 && arg1 !== 'meni-sekcija') {
        return `Tačna je komanda za spajanje! 👏 Ali u ovoj lekciji spajamo granu 'meni-sekcija' — proveri ime grane.`;
      }
    }
    if (subCmd === 'switch' && arg1 === 'main') {
      return `Super, sad si na main grani! 👏 Sledeći korak je da u nju spojiš završeni rad sa grane 'meni-sekcija'.`;
    }
  }

  // Nivo 2 Lekcija 3 (Merge konflikt): traži se spajanje 'kontakt-forma'
  if (level.id === 14) {
    if (subCmd === 'merge') {
      if (arg1 && arg1 !== 'kontakt-forma') {
        return `Tačna je komanda! 👏 Ali u ovoj lekciji spajamo Ivinu granu 'kontakt-forma' u main — proveri ime grane.`;
      }
    }
    if (newState.mergeInProgress && !newState.index.staged.includes('index.html')) {
      if (subCmd === 'commit') {
        return `Fajl sa konfliktom još nije označen kao rešen! 💡 Kad razrešiš konflikt u index.html, pripremi ga za commit, pa tek onda sačuvaj spajanje.`;
      }
    }
  }

  // Nivo 2 Lekcija 4 (git log --oneline --graph --all)
  if (level.id === 15) {
    if (subCmd === 'log') {
      const hasGraph = parts.includes('--graph');
      const hasAll = parts.includes('--all');
      const hasOneLine = parts.includes('--oneline');
      if (!hasGraph || !hasAll || !hasOneLine) {
        return `Dobar početak! 👏 Ali prikaz još nije potpun — tražimo istoriju sažetu u po jedan red, nacrtanu kao graf, i to za sve grane odjednom.`;
      }
    }
  }

  // Nivo 2 Lekcija 5 (git restore): traži se 'style.css'
  if (level.id === 16) {
    if ((subCmd === 'restore' || subCmd === 'checkout') && arg1 && arg1 !== 'style.css') {
      return `Dobra komanda! 👏 Ali eksperimentalna izmena je u 'style.css' — vrati baš taj fajl.`;
    }
  }

  // Nivo 2 Lekcija 6 (git reset): traži se 'test-fajl.txt'
  if (level.id === 17) {
    if (subCmd === 'reset' && arg1 && arg1 !== 'test-fajl.txt') {
      return `Tačna je komanda! 👏 Ali iz staging zone treba da izbaciš 'test-fajl.txt' — proveri ime fajla.`;
    }
  }

  // Nivo 2 Lekcija 7 (git revert): traži se HEAD ili commit
  if (level.id === 18) {
    if (subCmd === 'revert' && arg1) {
      return `Bravo za revert! 👏 Ali poništio/la si pogrešan commit — problem je napravio poslednji commit ('Pokvaren link ka meniju'). Klikni '🔄 Resetuj nivo' i poništi baš njega.`;
    }
  }

  // Nivo 2 Lekcija 8 (git stash): traži se stash pa stash pop
  if (level.id === 19) {
    if (subCmd === 'stash') {
      if (arg1 === 'apply' && newState.stash && newState.stash.length > 0) {
        return `Izmene su vraćene, ali njihova kopija je i dalje na stash steku! 💡 Očisti je — a sledeći put probaj način koji vraća izmene i briše kopiju u jednom koraku.`;
      } else if (arg1 === 'pop' || arg1 === 'drop') {
        // pop is valid; drop after apply finishes the task
      } else if (newState.stash && newState.stash.length > 0) {
        return `Odlično, izmene su privremeno sklonjene na stranu! 👏 Sada ih vrati nazad sa stash steka.`;
      }
    }
  }

  // Nivo 2 Lekcija 9 (git commit --amend): traži se favicon.ico
  if (level.id === 20) {
    if (subCmd === 'commit') {
      if (!parts.includes('--amend')) {
        return `Ne želimo novi commit, već da prepravimo postojeći! 💡 Klikni '🔄 Resetuj nivo', pripremi favicon.ico, pa commit-uj uz opciju koja prepravlja poslednji commit.`;
      }
      if (newState.workingDirectory.untracked.includes('favicon.ico')) {
        return `Zaboravljeni fajl favicon.ico još nije u staging zoni! 💡 Prvo ga pripremi za commit, pa tek onda prepravi poslednji commit.`;
      }
      if (newState.commits[newState.branches['main']]?.message.toLowerCase() === 'fix bag') {
        return `favicon.ico je sada deo commit-a! 👏 Ostalo je još da nejasnu poruku 'fix bag' zameniš jasnijom — ponovo prepravi poslednji commit, ovog puta sa novom porukom.`;
      }
    }
    if (subCmd === 'add' && newState.index.staged.includes('favicon.ico') && newState.commits['C2']?.message.toLowerCase() !== 'fix bag') {
      return `favicon.ico je u staging zoni! 💡 Poruku si već ispravio/la, ali fajl još nije ušao u commit — prepravi poslednji commit još jednom.`;
    }
  }

  // Nivo 2 Bonus A (git tag): traži se 'v1.0'
  if (level.id === 21) {
    if (subCmd === 'tag' && arg1 && arg1 !== 'v1.0') {
      return `Bravo za tag! 👏 Ali za potrebe ove lekcije oznaka mora da se zove tačno 'v1.0'.`;
    }
  }

  // Nivo 2 Bonus B (git diff grana1..grana2): traži se 'main..kontakt-forma'
  if (level.id === 22) {
    if (subCmd === 'diff' && !(arg1?.includes('..') && arg1.includes('kontakt-forma'))) {
      return `Dobar pokušaj! 👏 Ovde ne poredimo radni direktorijum, već dve grane — main i kontakt-forma. Seti se kako se dve grane navode jedna uz drugu.`;
    }
  }

  return null;
};

