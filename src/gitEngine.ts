// Sekcije sajta koje commit dodaje. Live pregledač i pull ih prepoznaju po ovoj oznaci,
// a ne po tekstu poruke — student može sam da napiše bilo kakvu poruku.
export type SiteFeature = 'about' | 'menu' | 'contact';

export interface Commit {
  id: string;
  parentIds: string[];
  message: string;
  author?: string;
  date?: string;
  isRemote?: boolean;
  features?: SiteFeature[];
  // Sekcije čiji link u navigaciji ovaj commit kvari (npr. pogrešan href)
  breaks?: SiteFeature[];
  // Commit koji ovaj commit poništava (postavlja git revert)
  revertOf?: string;
}

export interface RepoState {
  isInitialized?: boolean;
  commits: { [id: string]: Commit };
  branches: { [name: string]: string }; // branch name -> commit id
  head: {
    type: 'branch' | 'commit';
    target: string; // branch name or commit id
  };
  index: {
    staged: string[];
    deleted: string[];
  };
  workingDirectory: {
    files: string[];
    modified: string[];
    untracked: string[];
    ignored?: string[];
  };
  fileContents?: { [filename: string]: string };
  gitignorePatterns?: string[];
  // Remote repository state
  remoteCommits?: { [id: string]: Commit };
  remoteBranches?: { [name: string]: string };
  hasRemote?: boolean;
  stash?: { staged: string[]; modified: string[]; untracked: string[]; fileContents?: { [f: string]: string } }[];
  tags?: { [name: string]: string };
  mergeInProgress?: { branch: string; commitId: string; conflictFile?: string };
  // Ime postavljeno komandom `git config user.name` — ima prednost nad imenom iz Control Panel-a
  configuredUserName?: string;
}

// Podrazumevani sadržaj fajlova sajta (koristi se kad lekcija ne definiše svoj fileContents)
export const DEFAULT_FILE_CONTENTS: { [filename: string]: string } = {
  'index.html': `<!DOCTYPE html>
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
    </nav>
  </header>
  <main>
    <section id="pocetna">
      <h2>Dobrodošli u Kafić Luna</h2>
      <p>Mesto gde se miris sveže mlevene kafe spaja sa prijatnom atmosferom.</p>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
  'style.css': `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fdfaf6;
  color: #3d2b1f;
  margin: 0;
  padding: 0;
}
header {
  background: linear-gradient(135deg, #4a2c11 0%, #2b1704 100%);
  color: #f5eedc;
  padding: 20px;
  text-align: center;
}
nav a {
  color: #d4a373;
  margin: 0 15px;
  text-decoration: none;
  font-weight: 600;
}
.btn-narucivanje {
  background-color: #d4a373;
  color: #2b1704;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}`,
  'script.js': `console.log("Kafić Luna sajt uspešno učitan!");
document.addEventListener("DOMContentLoaded", () => {
  console.log("Dobrodošli u Kafić Luna!");
});`
};

// Inicijalno prazno stanje za Kafić Luna
export const createEmptyState = (): RepoState => {
  return {
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
    fileContents: { ...DEFAULT_FILE_CONTENTS },
    hasRemote: false
  };
};

// Pomoćne funkcije za rad sa grafom
export const getCommitList = (commits: { [id: string]: Commit }): Commit[] => {
  return Object.values(commits);
};

// Pronalazi zajedničkog pretka dva commit-a
export const findCommonAncestor = (
  commits: { [id: string]: Commit },
  commitA: string,
  commitB: string
): string | null => {
  if (!commitA || !commitB) return null;
  
  const getAncestors = (id: string, visited = new Set<string>()): Set<string> => {
    if (!id || visited.has(id)) return visited;
    visited.add(id);
    const commit = commits[id];
    if (commit) {
      commit.parentIds.forEach(pId => getAncestors(pId, visited));
    }
    return visited;
  };

  const ancestorsA = getAncestors(commitA);
  
  const queue = [commitB];
  const visitedB = new Set<string>();
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (ancestorsA.has(currentId)) {
      return currentId;
    }
    visitedB.add(currentId);
    const commit = commits[currentId];
    if (commit) {
      commit.parentIds.forEach(pId => {
        if (!visitedB.has(pId)) {
          queue.push(pId);
        }
      });
    }
  }
  
  return null;
};

// Generiše novi ID za commit (C1, C2, C3...)
export const generateNextCommitId = (commits: { [id: string]: Commit }): string => {
  let index = 1;
  while (commits[`C${index}`]) {
    index++;
  }
  return `C${index}`;
};

// Dobijanje trenutnog commit ID-ja na osnovu HEAD-a
export const getCurrentCommitId = (state: RepoState): string => {
  if (state.head.type === 'branch') {
    return state.branches[state.head.target] || '';
  }
  return state.head.target;
};

// Svi commit-ovi dostupni iz datog commit-a (uključujući i njega samog)
export const getAncestorIds = (commits: { [id: string]: Commit }, startId: string): Set<string> => {
  const visited = new Set<string>();
  const stack = startId ? [startId] : [];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    commits[id]?.parentIds.forEach(pId => stack.push(pId));
  }
  return visited;
};

// Commit-ovi iz trenutne istorije čije izmene i dalje važe: dostupni iz HEAD-a i nisu poništeni
// revert-om (revert revert-a ponovo vraća originalne izmene).
export const getActiveCommitIds = (state: RepoState): Set<string> => {
  const reachable = [...getAncestorIds(state.commits, getCurrentCommitId(state))];
  const memo = new Map<string, boolean>();
  const isActive = (id: string): boolean => {
    const known = memo.get(id);
    if (known !== undefined) return known;
    memo.set(id, true); // guard against revert cycles
    const reverted = reachable.some(r => state.commits[r]?.revertOf === id && isActive(r));
    memo.set(id, !reverted);
    return !reverted;
  };
  return new Set(reachable.filter(isActive));
};

export const hasConflictMarkers = (content: string | undefined): boolean =>
  Boolean(content && (content.includes('<<<<<<<') || content.includes('>>>>>>>')));

// Sve podržane git podkomande, za predlaganje ispravke kad student pogreši u kucanju
const KNOWN_SUBCOMMANDS = [
  'config', 'init', 'status', 'add', 'commit', 'log', 'diff', 'branch', 'switch', 'checkout',
  'merge', 'restore', 'reset', 'revert', 'stash', 'tag', 'push', 'pull', 'help'
];

// Levenshtein-ova distanca — koristi se samo za predlog ispravke tipfelera, nikad za
// otkrivanje tačnog rešenja lekcije.
const levenshteinDistance = (a: string, b: string): number => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)]);
  for (let j = 1; j < cols; j++) d[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[rows - 1][cols - 1];
};

// Predlaže najbližu poznatu podkomandu ako je student verovatno samo pogrešno otkucao ime —
// ne otkriva ništa o tome KOJU komandu lekcija traži, samo ispravlja tipfeler u onome što je
// student već sâm pokušao da otkuca.
export const suggestSubcommand = (typed: string): string | null => {
  if (!typed) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const known of KNOWN_SUBCOMMANDS) {
    const dist = levenshteinDistance(typed, known);
    if (dist < bestDist) { bestDist = dist; best = known; }
  }
  const maxAllowedDistance = typed.length <= 3 ? 1 : 2;
  return bestDist > 0 && bestDist <= maxAllowedDistance ? best : null;
};

// Sadržaj fajla, uz podrazumevani sadržaj sajta ako ga lekcija nije definisala
export const getFileContent = (state: RepoState, filename: string): string | undefined => {
  if (state.fileContents?.[filename] !== undefined) return state.fileContents[filename];
  return state.workingDirectory.files.includes(filename) ? DEFAULT_FILE_CONTENTS[filename] : undefined;
};

const CONFLICT_INDEX_HTML = `<!DOCTYPE html>
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
<<<<<<< HEAD
      <a href="#meni">Meni</a>
=======
      <a href="#kontakt">Kontakt</a>
>>>>>>> kontakt-forma
    </nav>
  </header>
</body>
</html>`;

// Helper to check if file matches gitignore patterns
export const isFileIgnored = (filename: string, patterns: string[] = []): boolean => {
  return patterns.some(p => {
    const cleanPattern = p.trim().replace(/\/$/, '');
    return filename === cleanPattern || filename.startsWith(cleanPattern + '/') || filename === p.trim();
  });
};

// Helper to format email and author signature from system username
export const formatAuthorEmail = (name: string): string => {
  if (!name) return 'luka@kafic-luna.rs';
  const cleanName = name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  
  return `${cleanName || 'luka'}@kafic-luna.rs`;
};

export const formatAuthorSignature = (name: string): string => {
  const cleanName = name?.trim() || 'Luka';
  const email = formatAuthorEmail(cleanName);
  return `${cleanName} <${email}>`;
};

// Izvršavanje git komande nad stanjem i vraćanje novog stanja i ispisa terminala
export const executeGitCommand = (
  state: RepoState,
  commandLine: string,
  currentUserName: string = 'Luka'
): { newState: RepoState; output: string; error: boolean } => {
  const userSignature = formatAuthorSignature(state.configuredUserName || currentUserName);
  const trimmed = commandLine.trim();
  if (!trimmed) {
    return { newState: state, output: '', error: false };
  }

  // Handle linux / unix commands like 'ls', 'pwd', 'cat', 'touch', 'clear' gracefully
  if (trimmed === 'clear') {
    return { newState: state, output: '', error: false };
  }
  if (trimmed === 'ls' || trimmed === 'ls -la' || trimmed === 'dir') {
    const files = state.workingDirectory.files.slice();
    if (state.isInitialized || Object.keys(state.commits).length > 0) {
      files.unshift('.git');
    }
    return {
      newState: state,
      output: `kafic-luna/\n${files.map(f => `  ${f.endsWith('/') ? '📁' : '📄'} ${f}`).join('\n')}`,
      error: false
    };
  }
  if (trimmed.startsWith('cat ')) {
    const targetFile = trimmed.replace(/^cat\s+/, '').trim();
    const content = getFileContent(state, targetFile);
    if (content !== undefined) {
      return { newState: state, output: content, error: false };
    }
    return { newState: state, output: `cat: ${targetFile}: Nema takvog fajla ili direktorijuma`, error: true };
  }
  if (trimmed.startsWith('echo ')) {
    const isAppend = trimmed.includes('>>');
    const isOverwrite = !isAppend && trimmed.includes('>');
    if (isAppend || isOverwrite) {
      const parts = trimmed.split(isAppend ? '>>' : '>');
      const rawText = parts[0].replace(/^echo\s+/, '').trim().replace(/^["']|["']$/g, '');
      const targetFile = parts[1].trim().replace(/^["']|["']$/g, '');

      let updatedContent = state.fileContents?.[targetFile] || '';
      if (isAppend) {
        updatedContent = updatedContent ? `${updatedContent.trimEnd()}\n${rawText}\n` : `${rawText}\n`;
      } else {
        updatedContent = `${rawText}\n`;
      }

      let updatedPatterns = state.gitignorePatterns ? [...state.gitignorePatterns] : [];
      let updatedUntracked = [...state.workingDirectory.untracked];
      let updatedIgnored = state.workingDirectory.ignored ? [...state.workingDirectory.ignored] : [];

      if (targetFile === '.gitignore') {
        const newLines = updatedContent.split('\n').map(l => l.trim()).filter(Boolean);
        updatedPatterns = Array.from(new Set([...updatedPatterns, ...newLines]));
        updatedUntracked = state.workingDirectory.untracked.filter(f => !isFileIgnored(f, updatedPatterns));
        updatedIgnored = state.workingDirectory.files.filter(f => isFileIgnored(f, updatedPatterns));
      }

      const newState: RepoState = {
        ...state,
        fileContents: {
          ...state.fileContents,
          [targetFile]: updatedContent
        },
        gitignorePatterns: targetFile === '.gitignore' ? updatedPatterns : state.gitignorePatterns,
        workingDirectory: {
          ...state.workingDirectory,
          files: Array.from(new Set([...state.workingDirectory.files, targetFile])),
          untracked: updatedUntracked,
          ignored: updatedIgnored
        }
      };

      return {
        newState,
        output: `Upisano '${rawText}' u ${targetFile}.`,
        error: false
      };
    }
  }

  // Parsiranje argumenata
  const parts = trimmed.split(/\s+/);
  if (parts[0] !== 'git') {
    const looksLikeGitTypo = levenshteinDistance(parts[0].toLowerCase(), 'git') === 1;
    return {
      newState: state,
      output: looksLikeGitTypo
        ? `Komanda '${parts[0]}' nije prepoznata. Da li ste mislili na 'git'?`
        : `Komanda '${parts[0]}' nije prepoznata. U ovoj aplikaciji vežbamo Git komande koje počinju sa 'git'.`,
      error: true
    };
  }

  const subCmd = parts[1];
  if (!subCmd) {
    return {
      newState: state,
      output: `Korišćenje: git <komanda> [argumenti]\nUkucajte 'git help' za spisak komandi.`,
      error: true
    };
  }

  const isInitialized = state.isInitialized === true || Object.keys(state.commits).length > 0 || state.head.target !== '' || state.branches['main'] !== undefined || state.branches['master'] !== undefined;

  if (!isInitialized && !['init', 'clone', 'help', 'config'].includes(subCmd)) {
    return {
      newState: state,
      output: `fatal: nije git repozitorijum (ili bilo koji od roditeljskih direktorijuma): .git\nInicijalizujte repozitorijum pomoću komande 'git init'.`,
      error: true
    };
  }

  switch (subCmd) {
    case 'config': {
      const isUserName = parts.includes('user.name');
      if (!isUserName) {
        return {
          newState: state,
          output: `U ovoj aplikaciji je podržano samo: git config user.name "Tvoje Ime"`,
          error: true
        };
      }
      const afterFlag = trimmed.slice(trimmed.indexOf('user.name') + 'user.name'.length).trim();
      const quoted = afterFlag.match(/^"([^"]*)"|^'([^']*)'/);
      const name = (quoted ? (quoted[1] ?? quoted[2]) : afterFlag).trim();
      if (!name) {
        return {
          newState: state,
          output: `Korišćenje: git config user.name "Tvoje Ime"`,
          error: true
        };
      }
      return {
        newState: { ...state, configuredUserName: name },
        output: `Git identitet podešen: buduci commit-ovi će biti potpisani kao "${name}".`,
        error: false
      };
    }

    case 'help': {
      return {
        newState: state,
        output: `Podržane Git komande u projektu "Kafić Luna":
  config user.name "Ime"  Podešava ime kojim se potpisuju tvoji commit-ovi
  init                  Inicijalizuje novi prazan repozitorijum na grani 'main'
  status                Prikazuje stanje radnog stabla i pripremne zone (staging area)
  add <fajl> / add .    Dodaje fajlove u pripremnu zonu (staging area)
  commit -m "poruka"    Snima pripremljene promene u istoriju
  commit --amend        Ispravlja poslednji commit i ažurira poruku / fajlove
  log                   Ispisuje hronološku listu commit-ova
  log --oneline --graph --all  Prikazuje sažetu ASCII grafičku istoriju svih grana
  diff                  Prikazuje razlike u fajlovima (ili diff između grana: git diff g1..g2)
  branch <ime>          Prikazuje ili kreira novu granu
  switch <grana>        Prebacuje se na drugu granu (git switch -c <ime> kreira i prebacuje)
  checkout <grana>      Prebacuje granu ili fajl (git checkout -b <ime>)
  merge <grana>         Spaja navedenu granu u trenutnu granu
  restore <fajl>        Odbacuje nesačuvane lokalne promene u radnom direktorijumu
  reset <fajl>          Uklanja fajl iz pripremne zone (staging)
  revert <commit>       Pravi nov commit koji poništava prethodne izmene
  stash / stash pop     Privremeno sklanja nesačuvane izmene na stranu i vraća ih
  tag <ime>             Obeležava commit oznakom (npr. v1.0)
  push origin main      Šalje lokalne commit-ove na udaljeni repozitorijum
  pull origin main      Preuzima i spaja najnovije izmene sa udaljenog repozitorijuma`,
        error: false
      };
    }

    case 'init': {
      if (isInitialized) {
        return {
          newState: state,
          output: `Reinicijalizovan postojeći Git repozitorijum u /kafic-luna/.git/`,
          error: false
        };
      }

      const initialFiles = state.workingDirectory.files.length > 0
        ? state.workingDirectory.files
        : ['index.html', 'style.css', 'script.js'];

      const newState: RepoState = {
        ...state,
        isInitialized: true,
        commits: {},
        branches: { main: '' },
        head: { type: 'branch', target: 'main' },
        workingDirectory: {
          files: initialFiles,
          modified: [],
          untracked: [...initialFiles],
          ignored: []
        }
      };

      return {
        newState,
        output: `Inicijalizovan prazan Git repozitorijum u /kafic-luna/.git/\nKreirana primarna grana 'main'.`,
        error: false
      };
    }

    case 'status': {
      const currentBranch = state.head.type === 'branch' ? state.head.target : null;
      let out = '';
      if (currentBranch) {
        out += `Na grani ${currentBranch}\n`;
      } else {
        out += `U stanju 'detached HEAD' na commit-u ${state.head.target}\n`;
      }

      const patterns = state.gitignorePatterns || [];
      // Kao u pravom Git-u: .gitignore ne sakriva fajlove koji su već dodati u staging zonu
      const staged = state.index.staged;
      const modified = state.workingDirectory.modified.filter(f => !isFileIgnored(f, patterns));
      const untracked = state.workingDirectory.untracked.filter(f => !isFileIgnored(f, patterns));

      if (state.mergeInProgress) {
        out += `U toku je spajanje (merge) grane '${state.mergeInProgress.branch}'.\n`;
        if (state.mergeInProgress.conflictFile) {
          out += `  (popravite konflikte i pokrenite "git commit")\n`;
          out += `  (koristite "git merge --abort" da biste prekinuli spajanje)\n\n`;
          out += `Nerešeni konflikti:\n  (koristite "git add <fajl>..." da označite rešenje)\n`;
          out += `\tobostrano izmenjeno:   ${state.mergeInProgress.conflictFile}\n\n`;
        }
      }

      if (staged.length === 0 && modified.length === 0 && untracked.length === 0 && !state.mergeInProgress) {
        out += `Nema promena za commit (radni direktorijum je čist)`;
      } else {
        if (staged.length > 0) {
          out += `Promene pripremljene za commit (Changes to be committed):\n  (koristite "git reset HEAD <fajl>..." da biste uklonili iz pripremne zone)\n\n`;
          staged.forEach(f => {
            out += `\tzeleno:   novi/izmenjen fajl: ${f}\n`;
          });
          out += `\n`;
        }
        if (modified.length > 0) {
          out += `Izmene koje nisu pripremljene za commit (Changes not staged for commit):\n  (koristite "git add <fajl>..." da pripremite)\n  (koristite "git restore <fajl>..." da odbacite izmene u radnom direktorijumu)\n\n`;
          modified.forEach(f => {
            out += `\tžuto:     izmenjeno:   ${f}\n`;
          });
          out += `\n`;
        }
        if (untracked.length > 0) {
          out += `Nepraćeni fajlovi (Untracked files):\n  (koristite "git add <fajl>..." da biste ih uključili u ono što će biti commit-ovano)\n\n`;
          untracked.forEach(f => {
            out += `\tcrveno:   ${f}\n`;
          });
          out += `\n`;
        }
      }

      return { newState: state, output: out.trimEnd(), error: false };
    }

    case 'add': {
      const target = parts.slice(2).join(' ').trim();
      if (!target) {
        return {
          newState: state,
          output: `fatal: ništa nije navedeno, ništa dodato.\nMožda ste hteli da kažete 'git add .'?`,
          error: true
        };
      }

      const patterns = state.gitignorePatterns || [];
      const newStaged = new Set(state.index.staged);
      const newUntracked = [...state.workingDirectory.untracked];
      const newModified = [...state.workingDirectory.modified];
      const filesAdded: string[] = [];
      const conflictFile = state.mergeInProgress?.conflictFile;
      const unresolvedConflictError = (file: string) => ({
        newState: state,
        output: `error: '${file}' još sadrži konfliktne markere (<<<<<<<, =======, >>>>>>>).\nPrvo razreši konflikt: u Folderu Projekta otvori ${file} i klikni 'Razreši konflikt' (ili 'Uredi'), pa ponovo pokreni git add.\n(Pravi Git bi ovo dozvolio, ali bi u istoriju ušao pokvaren kod.)`,
        error: true
      });

      if (target === '.' || target === '-A' || target === '--all') {
        const eligibleUntracked = newUntracked.filter(f => !isFileIgnored(f, patterns));
        const eligibleModified = newModified.filter(f => !isFileIgnored(f, patterns));

        if (conflictFile && eligibleModified.includes(conflictFile) && hasConflictMarkers(getFileContent(state, conflictFile))) {
          return unresolvedConflictError(conflictFile);
        }

        eligibleUntracked.forEach(f => {
          newStaged.add(f);
          filesAdded.push(f);
        });
        eligibleModified.forEach(f => {
          newStaged.add(f);
          filesAdded.push(f);
        });

        const remainingUntracked = newUntracked.filter(f => isFileIgnored(f, patterns));
        const remainingModified = newModified.filter(f => isFileIgnored(f, patterns));

        const newState: RepoState = {
          ...state,
          index: { ...state.index, staged: Array.from(newStaged) },
          workingDirectory: {
            ...state.workingDirectory,
            untracked: remainingUntracked,
            modified: remainingModified
          },
          mergeInProgress: state.mergeInProgress && conflictFile && eligibleModified.includes(conflictFile)
            ? { ...state.mergeInProgress, conflictFile: undefined }
            : state.mergeInProgress
        };

        return {
          newState,
          output: filesAdded.length > 0
            ? `Dodato ${filesAdded.length} fajlova u staging zonu:\n${filesAdded.map(f => `  + ${f}`).join('\n')}`
            : `Nema novih izmena za dodavanje.`,
          error: false
        };
      }

      const fileToAdd = target.replace(/^["']|["']$/g, '');
      const isUntracked = newUntracked.includes(fileToAdd);
      const isModified = newModified.includes(fileToAdd);
      const isKnownFile = state.workingDirectory.files.includes(fileToAdd) || fileToAdd === '.gitignore' || fileToAdd === 'favicon.ico' || fileToAdd === 'test-fajl.txt';

      if (!isUntracked && !isModified && !isKnownFile) {
        return {
          newState: state,
          output: `fatal: putanja '${fileToAdd}' se ne poklapa ni sa jednim fajlom.`,
          error: true
        };
      }

      if (isFileIgnored(fileToAdd, patterns) && !newStaged.has(fileToAdd)) {
        return {
          newState: state,
          output: `Sledeće putanje su ignorisane jednim od vaših .gitignore fajlova:\n${fileToAdd}\nKoristite -f ako zaista želite da ih dodate.`,
          error: true
        };
      }

      if (fileToAdd === conflictFile && hasConflictMarkers(getFileContent(state, fileToAdd))) {
        return unresolvedConflictError(fileToAdd);
      }

      newStaged.add(fileToAdd);
      const updatedUntracked = newUntracked.filter(f => f !== fileToAdd);
      const updatedModified = newModified.filter(f => f !== fileToAdd);

      const allFiles = Array.from(new Set([...state.workingDirectory.files, fileToAdd]));

      // Adding the (resolved) conflict file marks the conflict as resolved
      let newMerge = state.mergeInProgress;
      if (newMerge && fileToAdd === newMerge.conflictFile) {
        newMerge = { ...newMerge, conflictFile: undefined };
      }

      const newState: RepoState = {
        ...state,
        index: { ...state.index, staged: Array.from(newStaged) },
        workingDirectory: {
          ...state.workingDirectory,
          files: allFiles,
          untracked: updatedUntracked,
          modified: updatedModified
        },
        mergeInProgress: newMerge
      };

      return {
        newState,
        output: `Fajl '${fileToAdd}' je dodat u staging zonu (spreman za commit).`,
        error: false
      };
    }

    case 'commit': {
      const isAmend = parts.includes('--amend');
      let msg = '';
      const mIdx = parts.indexOf('-m');
      if (mIdx !== -1 && parts[mIdx + 1]) {
        // Text after the standalone `-m` flag (not a `-m` inside another word or flag)
        const afterFlag = trimmed.slice(trimmed.search(/(^|\s)-m(\s|$)/)).replace(/^\s*-m\s+/, '');
        // Matching quote pairs, so `-m "Dodaj 'meni'"` keeps the inner apostrophes
        const quoted = afterFlag.match(/^"([^"]*)"|^'([^']*)'/);
        msg = (quoted
          ? (quoted[1] ?? quoted[2])
          : afterFlag.split(/\s+--?[A-Za-z]/)[0].replace(/^["']|["']$/g, '')
        ).trim();
      }

      const currentBranch = state.head.type === 'branch' ? state.head.target : 'main';
      const currentCommitId = state.branches[currentBranch] || (state.head.type === 'commit' ? state.head.target : '');

      if (isAmend) {
        if (!currentCommitId || !state.commits[currentCommitId]) {
          return {
            newState: state,
            output: `fatal: nema commit-a za prepravku (amend).`,
            error: true
          };
        }

        const oldCommit = state.commits[currentCommitId];
        const finalMsg = msg || oldCommit.message;
        const amendedCommit: Commit = {
          ...oldCommit,
          message: finalMsg
        };

        const newState: RepoState = {
          ...state,
          commits: {
            ...state.commits,
            [currentCommitId]: amendedCommit
          },
          index: { staged: [], deleted: [] }
        };

        return {
          newState,
          output: `[${currentBranch} ${currentCommitId}] (amend) ${finalMsg}\n  Ažuriran poslednji commit i pripremljene izmene.`,
          error: false
        };
      }

      if (state.mergeInProgress?.conflictFile) {
        return {
          newState: state,
          output: `error: Commit nije moguć jer imate nerešene konflikte.\n\tobostrano izmenjeno:   ${state.mergeInProgress.conflictFile}\nRazreši konflikt, pa pokreni "git add ${state.mergeInProgress.conflictFile}" i tek onda "git commit".`,
          error: true
        };
      }

      if (state.index.staged.length === 0 && !state.mergeInProgress) {
        return {
          newState: state,
          output: `Nema promena u staging zoni za commit (koristite "git add" pre komande commit).`,
          error: true
        };
      }

      // If completing a merge conflict
      if (state.mergeInProgress) {
        const mergeBranch = state.mergeInProgress.branch;
        const mergeCommitId = state.mergeInProgress.commitId;
        const newCommitId = generateNextCommitId(state.commits);
        const commitMsg = msg || `Merge grane '${mergeBranch}' u ${currentBranch}`;

        const newCommit: Commit = {
          id: newCommitId,
          parentIds: currentCommitId ? [currentCommitId, mergeCommitId] : [mergeCommitId],
          message: commitMsg,
          author: userSignature,
          date: new Date().toLocaleDateString('sr-RS')
        };

        const updatedCommits = { ...state.commits, [newCommitId]: newCommit };
        const updatedBranches = { ...state.branches, [currentBranch]: newCommitId };

        const newState: RepoState = {
          ...state,
          commits: updatedCommits,
          branches: updatedBranches,
          index: { staged: [], deleted: [] },
          mergeInProgress: undefined
        };

        return {
          newState,
          output: `[${currentBranch} ${newCommitId}] ${commitMsg}\n  Uspešno spajanje završeno (Merge commit sa 2 roditelja).`,
          error: false
        };
      }

      if (!msg) {
        return {
          newState: state,
          output: `Prekinut commit zbog prazne poruke.\nSvaki commit mora imati poruku — dodaj je opcijom -m, npr: git commit -m "Opis izmene"`,
          error: true
        };
      }

      const newCommitId = generateNextCommitId(state.commits);
      const parentIds = currentCommitId ? [currentCommitId] : [];

      const newCommit: Commit = {
        id: newCommitId,
        parentIds,
        message: msg,
        author: userSignature,
        date: new Date().toLocaleDateString('sr-RS')
      };

      const updatedCommits = { ...state.commits, [newCommitId]: newCommit };
      const updatedBranches = { ...state.branches, [currentBranch]: newCommitId };

      const newState: RepoState = {
        ...state,
        commits: updatedCommits,
        branches: updatedBranches,
        index: { staged: [], deleted: [] }
      };

      return {
        newState,
        output: `[${currentBranch}${parentIds.length === 0 ? ' (root-commit)' : ''} ${newCommitId}] ${msg}\n  ${state.index.staged.length} fajlova sačuvano u istoriju.`,
        error: false
      };
    }

    case 'log': {
      const commitList = getCommitList(state.commits);
      if (commitList.length === 0) {
        return {
          newState: state,
          output: `fatal: trenutna grana nema nijedan commit.`,
          error: true
        };
      }

      const isOneLine = parts.includes('--oneline');
      const isGraph = parts.includes('--graph');
      const isAll = parts.includes('--all');

      if (isOneLine || isGraph || isAll) {
        let out = '';
        const reversed = [...commitList].reverse();
        reversed.forEach((c) => {
          const pointingBranches = Object.keys(state.branches).filter(b => state.branches[b] === c.id);
          if (state.remoteBranches) {
            Object.keys(state.remoteBranches).forEach(rb => {
              if (state.remoteBranches![rb] === c.id) pointingBranches.push(rb);
            });
          }
          if (state.tags) {
            Object.keys(state.tags).forEach(t => {
              if (state.tags![t] === c.id) pointingBranches.push(`tag: ${t}`);
            });
          }

          const branchPill = pointingBranches.length > 0 ? ` (${pointingBranches.join(', ')})` : '';
          const graphPrefix = isGraph ? (c.parentIds.length > 1 ? '*   |\\  ' : '* | ') : '';
          out += `${graphPrefix}${c.id} ${c.message}${branchPill}\n`;
        });
        return { newState: state, output: out.trimEnd(), error: false };
      }

      const resolveDisplayAuthor = (author?: string): string => {
        if (!author || author === 'Luka' || author.startsWith('Luka ') || author.includes('luka@kafic-luna.rs')) {
          return userSignature;
        }
        if (author === 'Iva' || author.startsWith('Iva ') || author.includes('iva@kafic-luna.rs')) {
          return 'Iva <iva@kafic-luna.rs>';
        }
        return author;
      };

      let out = '';
      const reversed = [...commitList].reverse();
      reversed.forEach((c, idx) => {
        out += `commit ${c.id}7a3f89e21b04c99a8e0f6d\n`;
        out += `Author: ${resolveDisplayAuthor(c.author)}\n`;
        out += `Date:   ${c.date || 'Danas, 17:00:00'}\n\n`;
        out += `    ${c.message}\n`;
        if (idx < reversed.length - 1) out += `\n`;
      });

      return { newState: state, output: out, error: false };
    }

    case 'diff': {
      const rest = parts.slice(2).join(' ');
      
      // Branch diff like 'git diff main..kontakt-forma'
      if (rest.includes('..')) {
        const [b1, b2] = rest.split('..').map(s => s.trim());
        return {
          newState: state,
          output: `diff --git a/index.html b/index.html
--- a/index.html (${b1})
+++ b/index.html (${b2})
@@ -9,4 +9,6 @@
+      <a href="#kontakt">Kontakt</a>
+  <section id="kontakt">
+    <h2>Kontaktirajte Kafić Luna</h2>
+    <p>Adresa: Knez Mihailova 12, Beograd</p>
+  </section>`,
          error: false
        };
      }

      // Diff for untracked files explains why output is empty
      const staged = state.index.staged;
      const modified = state.workingDirectory.modified;
      const untracked = state.workingDirectory.untracked;

      if (untracked.length > 0 && modified.length === 0 && staged.length === 0) {
        return {
          newState: state,
          output: `(Prazan ispis)\n\nℹ️ Objašnjenje: 'git diff' poredi samo fajlove koje Git već prati (tracked).\nFajlovi u kafic-luna/ (index.html, style.css, script.js) su trenutno 'Untracked' (nepraćeni), pa ih git diff ne prikazuje dok se ne dodaju u staging zonu pomoću 'git add'.`,
          error: false
        };
      }

      if (modified.includes('style.css')) {
        return {
          newState: state,
          output: `diff --git a/style.css b/style.css
--- a/style.css
+++ b/style.css
@@ -21,3 +21,3 @@
-.btn-narucivanje {
-  background-color: #d4a373;
+.btn-narucivanje {
+  background-color: #e63946; /* eksperimentalna crvena boja */`,
          error: false
        };
      }

      if (modified.length > 0) {
        return {
          newState: state,
          output: modified.map(f => `diff --git a/${f} b/${f}\n--- a/${f}\n+++ b/${f}\n@@ -1,5 +1,6 @@\n+ // Nesačuvane izmene u ${f}`).join('\n\n'),
          error: false
        };
      }

      return { newState: state, output: ``, error: false };
    }

    case 'branch': {
      const vFlag = parts.includes('-v');
      const bArgs = parts.slice(2).filter(p => !p.startsWith('-'));

      if (bArgs.length === 0) {
        let out = '';
        Object.keys(state.branches).forEach(bName => {
          const isCurrent = state.head.type === 'branch' && state.head.target === bName;
          const prefix = isCurrent ? '* ' : '  ';
          const cId = state.branches[bName] || '';
          const cMsg = cId && state.commits[cId] ? state.commits[cId].message : '';
          out += `${prefix}${bName}${vFlag ? `\t${cId} ${cMsg}` : ''}\n`;
        });
        return { newState: state, output: out.trimEnd(), error: false };
      }

      const isDelete = parts.includes('-d') || parts.includes('-D') || parts.includes('--delete');
      const isRename = parts.includes('-m') || parts.includes('-M');
      const currentBranchName = state.head.type === 'branch' ? state.head.target : null;

      if (isDelete) {
        const toDelete = bArgs[0];
        if (state.branches[toDelete] === undefined) {
          return { newState: state, output: `error: grana '${toDelete}' nije pronađena.`, error: true };
        }
        if (toDelete === currentBranchName) {
          return {
            newState: state,
            output: `error: ne možete obrisati granu '${toDelete}' na kojoj se trenutno nalazite.\nPrvo pređite na drugu granu (npr. git switch main).`,
            error: true
          };
        }
        const remainingBranches = { ...state.branches };
        delete remainingBranches[toDelete];
        return {
          newState: { ...state, branches: remainingBranches },
          output: `Obrisana grana ${toDelete} (bila je ${state.branches[toDelete] || 'prazna'}).`,
          error: false
        };
      }

      if (isRename) {
        const [oldName, newName] = bArgs.length >= 2 ? bArgs : [currentBranchName, bArgs[0]];
        if (!oldName || state.branches[oldName] === undefined) {
          return { newState: state, output: `error: grana '${oldName ?? 'HEAD'}' nije pronađena.`, error: true };
        }
        if (oldName === newName) {
          return { newState: state, output: `Grana '${newName}' već ima to ime.`, error: false };
        }
        const renamedBranches = { ...state.branches, [newName]: state.branches[oldName] };
        delete renamedBranches[oldName];
        return {
          newState: {
            ...state,
            branches: renamedBranches,
            head: currentBranchName === oldName ? { type: 'branch', target: newName } : state.head
          },
          output: `Grana '${oldName}' je preimenovana u '${newName}'.`,
          error: false
        };
      }

      const branchName = bArgs[0];
      const currentCommitId = getCurrentCommitId(state);

      if (state.branches[branchName] !== undefined) {
        return {
          newState: state,
          output: `fatal: grana sa imenom '${branchName}' već postoji.`,
          error: true
        };
      }

      const newState: RepoState = {
        ...state,
        branches: {
          ...state.branches,
          [branchName]: currentCommitId
        }
      };

      return {
        newState,
        output: `Kreirana nova grana '${branchName}' na commit-u ${currentCommitId || 'HEAD'}.`,
        error: false
      };
    }

    case 'switch':
    case 'checkout': {
      const isCreateAndSwitch = parts.includes('-c') || parts.includes('-b');
      const cleanArgs = parts.slice(2).filter(p => !p.startsWith('-'));
      const targetName = cleanArgs[0];

      if (!targetName) {
        return {
          newState: state,
          output: `fatal: morate navesti ime grane.`,
          error: true
        };
      }

      // Check if restoring a file via 'git checkout -- <file>'
      if (parts.includes('--') || state.workingDirectory.files.includes(targetName)) {
        const fileToRestore = parts.includes('--') ? parts[parts.indexOf('--') + 1] : targetName;
        const updatedModified = state.workingDirectory.modified.filter(f => f !== fileToRestore);
        const newState: RepoState = {
          ...state,
          workingDirectory: { ...state.workingDirectory, modified: updatedModified }
        };
        return {
          newState,
          output: `Fajl '${fileToRestore}' je vraćen u stanje iz poslednjeg commit-a.`,
          error: false
        };
      }

      const currentCommitId = getCurrentCommitId(state);

      if (isCreateAndSwitch) {
        if (state.branches[targetName] !== undefined) {
          return {
            newState: state,
            output: `fatal: grana sa imenom '${targetName}' već postoji.\nDa pređeš na nju, koristi: git switch ${targetName}`,
            error: true
          };
        }
        const newState: RepoState = {
          ...state,
          branches: {
            ...state.branches,
            [targetName]: currentCommitId
          },
          head: { type: 'branch', target: targetName }
        };
        return {
          newState,
          output: `Prebačeno na novu granu '${targetName}'.`,
          error: false
        };
      }

      if (state.branches[targetName] !== undefined) {
        const newState: RepoState = {
          ...state,
          head: { type: 'branch', target: targetName }
        };
        return {
          newState,
          output: `Prebačeno na granu '${targetName}'.`,
          error: false
        };
      }

      if (state.commits[targetName]) {
        const newState: RepoState = {
          ...state,
          head: { type: 'commit', target: targetName }
        };
        return {
          newState,
          output: `U stanju 'detached HEAD' na commit-u ${targetName}.`,
          error: false
        };
      }

      return {
        newState: state,
        output: `error: putanja ili grana '${targetName}' ne postoji.`,
        error: true
      };
    }

    case 'merge': {
      const targetBranch = parts[2];
      if (!targetBranch) {
        return {
          newState: state,
          output: `fatal: morate navesti granu za spajanje (merge).`,
          error: true
        };
      }

      if (state.mergeInProgress) {
        return {
          newState: state,
          output: `fatal: Spajanje grane '${state.mergeInProgress.branch}' je već u toku.\nZavrši ga (git add + git commit) ili ga prekini pre novog spajanja.`,
          error: true
        };
      }

      const currentBranch = state.head.type === 'branch' ? state.head.target : 'main';
      const targetCommitId = state.branches[targetBranch];

      if (!targetCommitId) {
        return {
          newState: state,
          output: `merge: ${targetBranch} - grana nije pronađena.`,
          error: true
        };
      }

      const currentCommitId = state.branches[currentBranch];

      // Nothing to merge: same branch, or target is already part of the current history
      if (targetBranch === currentBranch || getAncestorIds(state.commits, currentCommitId).has(targetCommitId)) {
        return {
          newState: state,
          output: `Već je ažurno (Already up to date).`,
          error: false
        };
      }

      // Fast-forward: current branch hasn't moved since the target branched off
      if (!currentCommitId || getAncestorIds(state.commits, targetCommitId).has(currentCommitId)) {
        const newState: RepoState = {
          ...state,
          branches: {
            ...state.branches,
            [currentBranch]: targetCommitId
          }
        };
        return {
          newState,
          output: `Ažuriranje ${currentCommitId || '(prazno)'}..${targetCommitId}\nFast-forward spajanje uspešno!\n index.html | 15 +++++++++++++++\n style.css  | 10 ++++++++++\n 2 fajla izmenjena, 25 linija dodato(+)`,
          error: false
        };
      }

      // Diverged histories: Iva's 'kontakt-forma' edits the same nav line -> conflict
      if (targetBranch === 'kontakt-forma') {
        const newState: RepoState = {
          ...state,
          mergeInProgress: {
            branch: targetBranch,
            commitId: targetCommitId,
            conflictFile: 'index.html'
          },
          workingDirectory: {
            ...state.workingDirectory,
            modified: Array.from(new Set([...state.workingDirectory.modified, 'index.html']))
          },
          fileContents: {
            ...state.fileContents,
            'index.html': CONFLICT_INDEX_HTML
          }
        };

        return {
          newState,
          output: `Automatsko spajanje nije uspelo; popravite konflikte i potom commit-ujte rezultat.\nCONFLICT (content): Merge conflict in index.html`,
          error: false
        };
      }

      // Generic merge commit
      const newCommitId = generateNextCommitId(state.commits);
      const mergeCommit: Commit = {
        id: newCommitId,
        parentIds: [currentCommitId, targetCommitId],
        message: `Merge grane '${targetBranch}' u ${currentBranch}`,
        author: userSignature,
        date: new Date().toLocaleDateString('sr-RS')
      };

      const newState: RepoState = {
        ...state,
        commits: { ...state.commits, [newCommitId]: mergeCommit },
        branches: { ...state.branches, [currentBranch]: newCommitId }
      };

      return {
        newState,
        output: `Merge grane '${targetBranch}' uspešno izvršen (commit ${newCommitId}).`,
        error: false
      };
    }

    case 'restore':
    case 'reset': {
      // Uklanja fajlove iz staging zone. Bez ijednog commit-a fajl ponovo postaje nepraćen (untracked).
      const unstage = (files: string[]): RepoState => {
        const toUnstage = files.filter(f => state.index.staged.includes(f));
        const hasCommits = Object.keys(state.commits).length > 0;
        return {
          ...state,
          index: { ...state.index, staged: state.index.staged.filter(f => !toUnstage.includes(f)) },
          workingDirectory: {
            ...state.workingDirectory,
            modified: hasCommits
              ? Array.from(new Set([...state.workingDirectory.modified, ...toUnstage]))
              : state.workingDirectory.modified,
            untracked: hasCommits
              ? state.workingDirectory.untracked
              : Array.from(new Set([...state.workingDirectory.untracked, ...toUnstage]))
          }
        };
      };

      if (subCmd === 'restore') {
        const isStaged = parts.includes('--staged') || parts.includes('-S');
        const targetFile = parts.slice(2).filter(p => !p.startsWith('-'))[0];
        if (!targetFile) {
          return {
            newState: state,
            output: `fatal: morate navesti fajl za restore.`,
            error: true
          };
        }

        if (isStaged) {
          if (!state.index.staged.includes(targetFile)) {
            return { newState: state, output: `Fajl '${targetFile}' nije u staging zoni — nema šta da se ukloni.`, error: false };
          }
          return {
            newState: unstage([targetFile]),
            output: `Fajl '${targetFile}' je uklonjen iz staging zone (izmene su ostale na disku).`,
            error: false
          };
        }

        if (!state.workingDirectory.modified.includes(targetFile)) {
          return {
            newState: state,
            output: state.workingDirectory.files.includes(targetFile)
              ? `Fajl '${targetFile}' nema nesačuvanih izmena — nema šta da se vrati.`
              : `error: putanja '${targetFile}' se ne poklapa ni sa jednim fajlom poznatim Git-u.`,
            error: !state.workingDirectory.files.includes(targetFile)
          };
        }

        const newState: RepoState = {
          ...state,
          workingDirectory: {
            ...state.workingDirectory,
            modified: state.workingDirectory.modified.filter(f => f !== targetFile)
          }
        };

        return {
          newState,
          output: `Fajl '${targetFile}' je vraćen u čisto stanje iz poslednjeg commit-a (odbačene lokalne izmene).`,
          error: false
        };
      }

      const isHard = parts.includes('--hard');
      const targetArg = parts.slice(2).filter(p => !p.startsWith('-') && p !== 'HEAD')[0] || '';

      if (targetArg) {
        if (!state.index.staged.includes(targetArg)) {
          return {
            newState: state,
            output: `Fajl '${targetArg}' nije u staging zoni — nema šta da se resetuje.`,
            error: false
          };
        }
        return {
          newState: unstage([targetArg]),
          output: `Nepripremljene izmene nakon resetovanja (Unstaged):\nM\t${targetArg}`,
          error: false
        };
      }

      if (isHard) {
        const currentCommitId = getCurrentCommitId(state);
        // Kao u pravom Git-u: --hard odbacuje izmene praćenih fajlova, ali ne dira nepraćene
        const newState: RepoState = {
          ...state,
          index: { staged: [], deleted: [] },
          workingDirectory: {
            ...state.workingDirectory,
            modified: []
          }
        };
        return {
          newState,
          output: `HEAD je sada na ${currentCommitId} (tvrdi reset radnog stabla).`,
          error: false
        };
      }

      return {
        newState: unstage([...state.index.staged]),
        output: `Uklonjene pripremljene izmene iz staging zone (Unstaged all).`,
        error: false
      };
    }

    case 'revert': {
      const targetCommitArg = parts[2];
      if (!targetCommitArg) {
        return {
          newState: state,
          output: `fatal: morate navesti commit koji želite da poništite (npr. git revert HEAD).`,
          error: true
        };
      }
      const currentBranch = state.head.type === 'branch' ? state.head.target : 'main';
      const currentCommitId = state.branches[currentBranch];

      const commitToRevertId = targetCommitArg === 'HEAD' ? currentCommitId : targetCommitArg;
      const targetCommit = state.commits[commitToRevertId];

      if (!targetCommit) {
        return {
          newState: state,
          output: `fatal: commit '${targetCommitArg}' nije pronađen za revert.`,
          error: true
        };
      }

      const newCommitId = generateNextCommitId(state.commits);
      const revertCommit: Commit = {
        id: newCommitId,
        parentIds: currentCommitId ? [currentCommitId] : [],
        message: `Revert "${targetCommit.message}"`,
        author: userSignature,
        date: new Date().toLocaleDateString('sr-RS'),
        revertOf: commitToRevertId
      };

      const newState: RepoState = {
        ...state,
        commits: { ...state.commits, [newCommitId]: revertCommit },
        branches: { ...state.branches, [currentBranch]: newCommitId }
      };

      return {
        newState,
        output: `[${currentBranch} ${newCommitId}] Revert "${targetCommit.message}"\n Poništene izmene iz commit-a ${commitToRevertId}.`,
        error: false
      };
    }

    case 'stash': {
      const subAction = parts[2] || 'push';
      const stashList = state.stash || [];

      if (subAction === 'list') {
        return {
          newState: state,
          output: stashList.map((entry, i) =>
            `stash@{${i}}: WIP na ${state.head.target}: ${[...entry.staged, ...entry.modified].join(', ')}`
          ).join('\n'),
          error: false
        };
      }

      if (subAction === 'pop' || subAction === 'apply' || subAction === 'drop') {
        if (stashList.length === 0) {
          return {
            newState: state,
            output: `Nema sačuvanih izmena na stash steku (stash je prazan).`,
            error: true
          };
        }

        const [top, ...remainingStash] = stashList;

        if (subAction === 'drop') {
          return {
            newState: { ...state, stash: remainingStash },
            output: `Obrisan stash@{0} (izmene su trajno odbačene).`,
            error: false
          };
        }

        const newState: RepoState = {
          ...state,
          stash: subAction === 'pop' ? remainingStash : stashList,
          index: {
            ...state.index,
            staged: Array.from(new Set([...state.index.staged, ...top.staged]))
          },
          workingDirectory: {
            ...state.workingDirectory,
            modified: Array.from(new Set([...state.workingDirectory.modified, ...top.modified])),
            untracked: Array.from(new Set([...state.workingDirectory.untracked, ...top.untracked]))
          }
        };

        return {
          newState,
          output: `Na grani ${state.head.target}\nIzmene vraćene sa stash steka:\n${[...top.staged, ...top.modified].map(f => `  izmenjeno: ${f}`).join('\n')}` +
            (subAction === 'apply' ? `\n(stash@{0} je i dalje sačuvan — obriši ga sa git stash drop)` : ''),
          error: false
        };
      }

      if (subAction !== 'push' && subAction !== 'save') {
        return {
          newState: state,
          output: `error: nepoznata stash komanda '${subAction}'. Podržano: git stash, git stash list, git stash pop, git stash apply, git stash drop.`,
          error: true
        };
      }

      const modifiedToStash = [...state.workingDirectory.modified];
      const stagedToStash = [...state.index.staged];

      if (modifiedToStash.length === 0 && stagedToStash.length === 0) {
        return {
          newState: state,
          output: `Nema lokalnih izmena za čuvanje (radni direktorijum je čist).`,
          error: false
        };
      }

      // Kao u pravom Git-u, git stash (bez -u) ne sklanja nepraćene fajlove
      const newStashEntry = {
        staged: stagedToStash,
        modified: modifiedToStash,
        untracked: []
      };

      const newState: RepoState = {
        ...state,
        stash: [newStashEntry, ...stashList],
        index: { staged: [], deleted: [] },
        workingDirectory: {
          ...state.workingDirectory,
          modified: []
        }
      };

      return {
        newState,
        output: `Sačuvano radno stablo i stanje index-a u WIP stash@{0}: ${[...stagedToStash, ...modifiedToStash].join(', ')}`,
        error: false
      };
    }

    case 'tag': {
      const tagName = parts[2];
      if (!tagName) {
        let out = '';
        if (state.tags) {
          Object.keys(state.tags).forEach(t => {
            out += `${t}\n`;
          });
        }
        return { newState: state, output: out.trimEnd() || 'Nema kreiranih tagova.', error: false };
      }

      const currentCommitId = getCurrentCommitId(state);
      if (!currentCommitId) {
        return {
          newState: state,
          output: `fatal: ne možete kreirati tag bez postojećeg commit-a.`,
          error: true
        };
      }

      const newState: RepoState = {
        ...state,
        tags: {
          ...(state.tags || {}),
          [tagName]: currentCommitId
        }
      };

      return {
        newState,
        output: `Kreiran tag '${tagName}' na commit-u ${currentCommitId}.`,
        error: false
      };
    }

    case 'push': {
      const remote = parts[2] || 'origin';
      const branch = parts[3] || (state.head.type === 'branch' ? state.head.target : 'main');

      const currentCommitId = state.branches[branch] || getCurrentCommitId(state);
      if (!currentCommitId) {
        return {
          newState: state,
          output: `fatal: nema commit-a za slanje na server.`,
          error: true
        };
      }

      const remoteBranches = {
        ...(state.remoteBranches || {}),
        [`${remote}/${branch}`]: currentCommitId
      };

      const newState: RepoState = {
        ...state,
        hasRemote: true,
        remoteBranches
      };

      return {
        newState,
        output: `Objekti uspešno poslati na ${remote}/${branch} (${currentCommitId} -> ${currentCommitId})\nGrana '${branch}' je sinhronizovana sa '${remote}/${branch}'.`,
        error: false
      };
    }

    case 'pull': {
      const remote = parts[2] || 'origin';
      const branch = parts[3] || (state.head.type === 'branch' ? state.head.target : 'main');

      // Check current commit
      const currentCommitId = state.branches[branch] || '';
      // The simulated remote only adds the "O nama" section; once it's in local history there's nothing to pull
      const alreadyPulled = [...getAncestorIds(state.commits, currentCommitId)]
        .some(id => state.commits[id]?.features?.includes('about'));
      if (alreadyPulled) {
        return {
          newState: state,
          output: `Sa ${remote}/${branch}: Već je ažurno (Already up to date).`,
          error: false
        };
      }

      // Create new commit representing pulled changes
      const newCommitId = generateNextCommitId(state.commits);
      const pulledCommit: Commit = {
        id: newCommitId,
        parentIds: currentCommitId ? [currentCommitId] : [],
        message: 'Dodaj "O nama" sekciju na Kafić Luna sajt (od saradnika)',
        author: 'Iva <iva@kafic-luna.rs>',
        features: ['about'],
        date: new Date().toLocaleDateString('sr-RS')
      };

      const updatedCommits = { ...state.commits, [newCommitId]: pulledCommit };
      const updatedBranches = { ...state.branches, [branch]: newCommitId };
      const updatedRemoteBranches = { ...(state.remoteBranches || {}), [`${remote}/${branch}`]: newCommitId };

      const newState: RepoState = {
        ...state,
        hasRemote: true,
        commits: updatedCommits,
        branches: updatedBranches,
        remoteBranches: updatedRemoteBranches
      };

      return {
        newState,
        output: `Ažuriranje ${currentCommitId || 'C1'}..${newCommitId}\nFast-forward spajanje sa ${remote}/${branch}\n index.html | 8 ++++++++\n 1 fajl izmenjen, 8 linija dodato(+)`,
        error: false
      };
    }

    default: {
      const suggestion = suggestSubcommand(subCmd);
      return {
        newState: state,
        output: suggestion
          ? `git: '${subCmd}' nije git komanda. Da li ste mislili na 'git ${suggestion}'?`
          : `git: '${subCmd}' nije git komanda. Pogledajte 'git help'.`,
        error: true
      };
    }
  }
};
