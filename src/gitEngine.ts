export interface Commit {
  id: string;
  parentIds: string[];
  message: string;
  author?: string;
  date?: string;
  isRemote?: boolean;
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
}

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
    fileContents: {
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
    },
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

// Helper to check if file matches gitignore patterns
export const isFileIgnored = (filename: string, patterns: string[] = []): boolean => {
  return patterns.some(p => {
    const cleanPattern = p.trim().replace(/\/$/, '');
    return filename === cleanPattern || filename.startsWith(cleanPattern + '/') || filename === p.trim();
  });
};

// Izvršavanje git komande nad stanjem i vraćanje novog stanja i ispisa terminala
export const executeGitCommand = (
  state: RepoState,
  commandLine: string
): { newState: RepoState; output: string; error: boolean } => {
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
    const content = state.fileContents?.[targetFile];
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
    return {
      newState: state,
      output: `Komanda '${parts[0]}' nije prepoznata. U ovoj aplikaciji vežbamo Git komande koje počinju sa 'git'.`,
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

  if (!isInitialized && !['init', 'clone', 'help'].includes(subCmd)) {
    return {
      newState: state,
      output: `fatal: nije git repozitorijum (ili bilo koji od roditeljskih direktorijuma): .git\nInicijalizujte repozitorijum pomoću komande 'git init'.`,
      error: true
    };
  }

  switch (subCmd) {
    case 'help': {
      return {
        newState: state,
        output: `Podržane Git komande u projektu "Kafić Luna":
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
      const staged = state.index.staged.filter(f => !isFileIgnored(f, patterns));
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
      let filesAdded: string[] = [];

      if (target === '.' || target === '-A' || target === '--all') {
        const eligibleUntracked = newUntracked.filter(f => !isFileIgnored(f, patterns));
        const eligibleModified = newModified.filter(f => !isFileIgnored(f, patterns));

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
          }
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

      newStaged.add(fileToAdd);
      const updatedUntracked = newUntracked.filter(f => f !== fileToAdd);
      const updatedModified = newModified.filter(f => f !== fileToAdd);

      const allFiles = Array.from(new Set([...state.workingDirectory.files, fileToAdd]));

      // If resolving conflict in index.html
      let newMerge = state.mergeInProgress;
      if (newMerge && (fileToAdd === 'index.html' || fileToAdd === newMerge.conflictFile)) {
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
        const fullMsgPart = commandLine.substring(commandLine.indexOf('-m') + 2).trim();
        const match = fullMsgPart.match(/^["']([^"']*)["']/);
        msg = match ? match[1] : parts.slice(mIdx + 1).join(' ').replace(/^["']|["']$/g, '');
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
          author: 'Luka <luka@kafic-luna.rs>',
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
        msg = "Ažuriranje Kafić Luna projekta";
      }

      const newCommitId = generateNextCommitId(state.commits);
      const parentIds = currentCommitId ? [currentCommitId] : [];

      const newCommit: Commit = {
        id: newCommitId,
        parentIds,
        message: msg,
        author: 'Luka <luka@kafic-luna.rs>',
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
        output: `[${currentBranch} (root-commit) ${newCommitId}] ${msg}\n  ${state.index.staged.length} fajlova sačuvano u istoriju.`,
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

      let out = '';
      const reversed = [...commitList].reverse();
      reversed.forEach((c, idx) => {
        out += `commit ${c.id}7a3f89e21b04c99a8e0f6d\n`;
        out += `Author: ${c.author || 'Luka <luka@kafic-luna.rs>'}\n`;
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

      // Diff for untracked files is empty!
      const staged = state.index.staged;
      const modified = state.workingDirectory.modified;
      const untracked = state.workingDirectory.untracked;

      if (untracked.length > 0 && modified.length === 0 && staged.length === 0) {
        return {
          newState: state,
          output: ``, // Intentional empty diff for untracked files as explained in lesson!
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

      const branchName = bArgs[0];
      const currentCommitId = getCurrentCommitId(state);

      if (state.branches[branchName]) {
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

      // Fast-forward case
      if (targetBranch === 'meni-sekcija') {
        const newState: RepoState = {
          ...state,
          branches: {
            ...state.branches,
            [currentBranch]: targetCommitId
          }
        };
        return {
          newState,
          output: `Ažuriranje ${currentCommitId || 'C1'}..${targetCommitId}\nFast-forward spajanje uspešno!\n index.html | 15 +++++++++++++++\n style.css  | 10 ++++++++++\n 2 fajla izmenjena, 25 linija dodato(+)`,
          error: false
        };
      }

      // Conflict case for 'kontakt-forma'
      if (targetBranch === 'kontakt-forma') {
        const conflictContent = `<<<<<<< HEAD
      <a href="#meni">Meni</a>
=======
      <a href="#kontakt">Kontakt</a>
>>>>>>> kontakt-forma`;

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
            'index.html': conflictContent
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
        author: 'Luka <luka@kafic-luna.rs>',
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

    case 'restore': {
      const targetFile = parts[2];
      if (!targetFile) {
        return {
          newState: state,
          output: `fatal: morate navesti fajl za restore.`,
          error: true
        };
      }

      const updatedModified = state.workingDirectory.modified.filter(f => f !== targetFile);
      const newState: RepoState = {
        ...state,
        workingDirectory: {
          ...state.workingDirectory,
          modified: updatedModified
        }
      };

      return {
        newState,
        output: `Fajl '${targetFile}' je vraćen u čisto stanje iz poslednjeg commit-a (odbačene lokalne izmene).`,
        error: false
      };
    }

    case 'reset': {
      const isHard = parts.includes('--hard');
      const targetArg = parts.slice(2).filter(p => !p.startsWith('-'))[0] || '';

      if (targetArg && targetArg !== 'HEAD') {
        const fileToUnstage = targetArg.replace(/^HEAD\s+/, '').trim();
        const updatedStaged = state.index.staged.filter(f => f !== fileToUnstage);
        const updatedModified = Array.from(new Set([...state.workingDirectory.modified, fileToUnstage]));

        const newState: RepoState = {
          ...state,
          index: { ...state.index, staged: updatedStaged },
          workingDirectory: {
            ...state.workingDirectory,
            modified: updatedModified
          }
        };

        return {
          newState,
          output: `Nepripremljene izmene nakon resetovanja (Unstaged):\nM\t${fileToUnstage}`,
          error: false
        };
      }

      if (isHard) {
        const currentCommitId = getCurrentCommitId(state);
        const newState: RepoState = {
          ...state,
          index: { staged: [], deleted: [] },
          workingDirectory: {
            ...state.workingDirectory,
            modified: [],
            untracked: []
          }
        };
        return {
          newState,
          output: `HEAD je sada na ${currentCommitId} (tvrdi reset radnog stabla).`,
          error: false
        };
      }

      // Unstage all
      const unstagedFiles = [...state.index.staged];
      const newState: RepoState = {
        ...state,
        index: { staged: [], deleted: [] },
        workingDirectory: {
          ...state.workingDirectory,
          modified: Array.from(new Set([...state.workingDirectory.modified, ...unstagedFiles]))
        }
      };

      return {
        newState,
        output: `Uklonjene pripremljene izmene iz staging zone (Unstaged all).`,
        error: false
      };
    }

    case 'revert': {
      const targetCommitArg = parts[2] || 'HEAD';
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
        author: 'Luka <luka@kafic-luna.rs>',
        date: new Date().toLocaleDateString('sr-RS')
      };

      const newState: RepoState = {
        ...state,
        commits: { ...state.commits, [newCommitId]: revertCommit },
        branches: { ...state.branches, [currentBranch]: newCommitId }
      };

      return {
        newState,
        output: `[${currentBranch} ${newCommitId}] Revert "${targetCommit.message}"\n 1 fajl promenjen, ispravljen meni link.`,
        error: false
      };
    }

    case 'stash': {
      const subAction = parts[2];
      if (subAction === 'pop') {
        if (!state.stash || state.stash.length === 0) {
          return {
            newState: state,
            output: `Nema sačuvanih izmena na stash steku (stash je prazan).`,
            error: true
          };
        }

        const popped = state.stash[0];
        const remainingStash = state.stash.slice(1);

        const newState: RepoState = {
          ...state,
          stash: remainingStash,
          index: {
            ...state.index,
            staged: Array.from(new Set([...state.index.staged, ...popped.staged]))
          },
          workingDirectory: {
            ...state.workingDirectory,
            modified: Array.from(new Set([...state.workingDirectory.modified, ...popped.modified])),
            untracked: Array.from(new Set([...state.workingDirectory.untracked, ...popped.untracked]))
          }
        };

        return {
          newState,
          output: `Na grani ${state.head.target}\nIzmene vraćene sa stash steka:\n${popped.modified.map(f => `  izmenjeno: ${f}`).join('\n')}`,
          error: false
        };
      }

      // Default 'git stash'
      const modifiedToStash = [...state.workingDirectory.modified];
      const stagedToStash = [...state.index.staged];
      const untrackedToStash = [...state.workingDirectory.untracked];

      if (modifiedToStash.length === 0 && stagedToStash.length === 0) {
        return {
          newState: state,
          output: `Nema lokalnih izmena za čuvanje (radni direktorijum je čist).`,
          error: false
        };
      }

      const newStashEntry = {
        staged: stagedToStash,
        modified: modifiedToStash,
        untracked: untrackedToStash
      };

      const currentStashList = state.stash || [];

      const newState: RepoState = {
        ...state,
        stash: [newStashEntry, ...currentStashList],
        index: { staged: [], deleted: [] },
        workingDirectory: {
          ...state.workingDirectory,
          modified: [],
          untracked: []
        }
      };

      return {
        newState,
        output: `Sačuvano radno stablo i stanje index-a u WIP stash@{0}: Rad na skripti menija`,
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

      // Create new commit representing pulled changes
      const newCommitId = generateNextCommitId(state.commits);
      const pulledCommit: Commit = {
        id: newCommitId,
        parentIds: currentCommitId ? [currentCommitId] : [],
        message: 'Dodaj "O nama" sekciju na Kafić Luna sajt (od saradnika)',
        author: 'Iva <iva@kafic-luna.rs>',
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
      return {
        newState: state,
        output: `git: '${subCmd}' nije git komanda. Pogledajte 'git help'.`,
        error: true
      };
    }
  }
};
