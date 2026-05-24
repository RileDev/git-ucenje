export interface Commit {
  id: string;
  parentIds: string[];
  message: string;
  isRemote?: boolean;
}

export interface RepoState {
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
  };
  // Remote repository state
  remoteCommits?: { [id: string]: Commit };
  remoteBranches?: { [name: string]: string };
  hasRemote?: boolean;
  stash?: { staged: string[]; modified: string[]; untracked: string[]; }[];
  tags?: { [name: string]: string };
  mergeInProgress?: string;
}

// Inicijalno prazno stanje
export const createEmptyState = (): RepoState => {
  return {
    commits: {},
    branches: {},
    head: { type: 'commit', target: '' },
    index: { staged: [], deleted: [] },
    workingDirectory: {
      files: [],
      modified: [],
      untracked: []
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
  
  // Šetamo se unazad kroz pretke od B i tražimo prvog koji je u ancestorsA
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

// Vraća listu commit-a od startId do endId (isključujući startId, uključujući endId)
export const getCommitPath = (
  commits: { [id: string]: Commit },
  startId: string,
  endId: string
): string[] => {
  const path: string[] = [];
  let currentId = endId;
  
  while (currentId && currentId !== startId) {
    path.unshift(currentId);
    const commit = commits[currentId];
    if (!commit || commit.parentIds.length === 0) {
      break;
    }
    currentId = commit.parentIds[0]; // Pratimo prvu granu roditelja
  }
  
  return path;
};

// Generiše novi ID za commit (C0, C1, C2...)
export const generateNextCommitId = (commits: { [id: string]: Commit }): string => {
  let index = 0;
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

// Izvršavanje git komande nad stanjem i vraćanje novog stanja i ispisa terminala
export const executeGitCommand = (
  state: RepoState,
  commandLine: string
): { newState: RepoState; output: string; error: boolean } => {
  const trimmed = commandLine.trim();
  if (!trimmed) {
    return { newState: state, output: '', error: false };
  }

  // Parsiranje argumenata
  const parts = trimmed.split(/\s+/);
  if (parts[0] !== 'git') {
    return {
      newState: state,
      output: `Komanda '${parts[0]}' nije prepoznata. Da li ste mislili 'git'?`,
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

  // 0. Provera da li je repo inicijalizovan (osim za 'init', 'clone', 'help')
  const isInitialized = Object.keys(state.commits).length > 0 || state.head.target !== '' || state.branches['master'] !== undefined;
  if (!isInitialized && !['init', 'clone', 'help'].includes(subCmd)) {
    return {
      newState: state,
      output: `fatal: nije git repozitorijum (ili bilo koji od roditeljskih direktorijuma): .git\nInicijalizujte repozitorijum pomoću 'git init'.`,
      error: true
    };
  }

  switch (subCmd) {
    case 'help': {
      return {
        newState: state,
        output: `Podržane Git komande na ovoj platformi:
  init          Inicijalizuje novi prazan repozitorijum
  status        Prikazuje stanje radnog stabla i pripremne zone (index)
  add <fajl>    Dodaje fajlove u pripremnu zonu (staging area)
  commit -m "p" Snima pripremljene promene u istoriju
  branch <ime>  Prikazuje, kreira ili briše grane
  checkout <g>  Prebacuje se na drugu granu ili commit (takođe i 'git switch')
  merge <grana> Spaja promene iz druge grane u trenutnu granu
  rebase <gran> Ponovo bazira trenutnu istoriju na vrh druge grane
  cherry-pick <c> Kopira commit na trenutni vrh
  reset <c>     Vraća stanje na određeni commit (opcija --hard)
  revert <c>    Pravi novi commit koji poništava promene prosleđenog commit-a
  clone <url>   Klonira udaljeni repozitorijum
  fetch         Preuzima promene sa udaljenog repozitorijuma
  pull          Preuzima i spaja promene sa servera (fetch + merge)
  push          Šalje lokalne promene na udaljeni repozitorijum`,
        error: false
      };
    }

    case 'init': {
      if (isInitialized) {
        return {
          newState: state,
          output: `Reinicijalizovan postojeći Git repozitorijum.`,
          error: false
        };
      }
      
      const newState = {
        ...state,
        commits: {},
        branches: { master: '' },
        head: { type: 'branch' as const, target: 'master' },
        workingDirectory: {
          files: ['readme.txt'],
          modified: [],
          untracked: ['readme.txt']
        }
      };
      
      return {
        newState,
        output: `Inicijalizovan prazan Git repozitorijum u .git/`,
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

      const staged = state.index.staged;
      const untracked = state.workingDirectory.untracked;

      if (staged.length === 0 && untracked.length === 0) {
        out += `Nema promena za commit (radno stablo je čisto)`;
      } else {
        if (staged.length > 0) {
          out += `Promene za commit:\n  (koristite "git reset HEAD <fajl>..." da biste uklonili iz pripremne zone)\n\n`;
          staged.forEach(f => {
            out += `\tnovi fajl:   ${f}\n`;
          });
          out += `\n`;
        }
        if (untracked.length > 0) {
          out += `Nepraćeni fajlovi:\n  (koristite "git add <fajl>..." da biste ih uključili u ono što će biti commit-ovano)\n\n`;
          untracked.forEach(f => {
            out += `\t${f}\n`;
          });
        }
      }
      return { newState: state, output: out, error: false };
    }

    case 'add': {
      const fileArg = parts[2];
      if (!fileArg) {
        return { newState: state, output: `fatal: nije prosleđena putanja do fajla.`, error: true };
      }

      if (fileArg === '.' || fileArg === '-A') {
        // Dodaj sve untracked u staged
        const allUntracked = [...state.workingDirectory.untracked];
        if (allUntracked.length === 0) {
          return { newState: state, output: `Nema novih fajlova za dodavanje.`, error: false };
        }
        const newState = {
          ...state,
          index: {
            ...state.index,
            staged: Array.from(new Set([...state.index.staged, ...allUntracked]))
          },
          workingDirectory: {
            ...state.workingDirectory,
            untracked: []
          }
        };
        return {
          newState,
          output: `Dodato ${allUntracked.length} fajlova u pripremnu zonu.`,
          error: false
        };
      } else {
        // Dodaj specifičan fajl
        if (!state.workingDirectory.files.includes(fileArg) && !state.workingDirectory.untracked.includes(fileArg)) {
          return { newState: state, output: `fatal: fajl '${fileArg}' ne postoji.`, error: true };
        }
        const newState = {
          ...state,
          index: {
            ...state.index,
            staged: Array.from(new Set([...state.index.staged, fileArg]))
          },
          workingDirectory: {
            ...state.workingDirectory,
            untracked: state.workingDirectory.untracked.filter(f => f !== fileArg)
          }
        };
        return {
          newState,
          output: `Dodat fajl '${fileArg}' u pripremnu zonu.`,
          error: false
        };
      }
    }

    case 'commit': {
      const hasAmend = parts.includes('--amend');

      // Provera -m parametra
      const mIdx = parts.indexOf('-m');
      let msg = '';
      if (mIdx !== -1 && parts[mIdx + 1]) {
        // Spajamo sve argumente posle -m u jednu poruku ako ima navodnika
        const fullString = parts.slice(mIdx + 1).join(' ');
        msg = fullString.replace(/['"]/g, '').replace(/--amend/g, '').trim();
      } else if (!hasAmend) {
        return {
          newState: state,
          output: `error: morate proslediti poruku commit-a koristeći -m "poruka".`,
          error: true
        };
      }

      if (hasAmend) {
        const currentCommit = getCurrentCommitId(state);
        if (!currentCommit || !state.commits[currentCommit]) {
          return {
            newState: state,
            output: `fatal: nema commit-a za izmenu.`,
            error: true
          };
        }
        const lastCommit = state.commits[currentCommit];
        const updatedCommit: Commit = {
          ...lastCommit,
          message: msg || lastCommit.message
        };
        const updatedCommits = { ...state.commits, [currentCommit]: updatedCommit };
        const newState: RepoState = {
          ...state,
          commits: updatedCommits,
          index: { staged: [], deleted: [] },
          workingDirectory: {
            ...state.workingDirectory,
            files: Array.from(new Set([...state.workingDirectory.files, ...state.index.staged])),
            untracked: []
          }
        };
        return {
          newState,
          output: `[${state.head.type === 'branch' ? state.head.target : 'detached HEAD'} (amended) ${currentCommit}] ${updatedCommit.message}\n Popravljen i izmenjen poslednji commit uspešno!`,
          error: false
        };
      }

      // Provera da li ima šta da se commit-uje (za prve nivoe dozvoljavamo i bez add-a ako je prazan)
      if (state.index.staged.length === 0 && Object.keys(state.commits).length > 0) {
        return {
          newState: state,
          output: `Na grani ${state.head.target}\nNema promena dodatih za commit (koristite "git add")`,
          error: true
        };
      }

      const nextId = generateNextCommitId(state.commits);
      const currentCommit = getCurrentCommitId(state);
      
      const parentIds = currentCommit ? [currentCommit] : [];
      if (state.mergeInProgress) {
        parentIds.push(state.mergeInProgress);
      }

      const newCommit: Commit = {
        id: nextId,
        parentIds,
        message: msg
      };

      const updatedCommits = { ...state.commits, [nextId]: newCommit };
      const updatedBranches = { ...state.branches };

      let updatedHead = { ...state.head };

      if (state.head.type === 'branch') {
        updatedBranches[state.head.target] = nextId;
      } else {
        updatedHead = { type: 'commit', target: nextId };
      }

      const newState: RepoState = {
        ...state,
        commits: updatedCommits,
        branches: updatedBranches,
        head: updatedHead,
        index: { staged: [], deleted: [] },
        workingDirectory: {
          ...state.workingDirectory,
          files: Array.from(new Set([...state.workingDirectory.files, ...state.index.staged])),
          modified: state.workingDirectory.modified.filter(f => !state.index.staged.includes(f)),
          untracked: []
        },
        mergeInProgress: undefined
      };

      return {
        newState,
        output: state.mergeInProgress 
          ? `Spajanje napravljeno korišćenjem strategije 'recursive'.\n[${state.head.type === 'branch' ? state.head.target : 'detached HEAD'} ${nextId}] ${msg}`
          : `[${state.head.type === 'branch' ? state.head.target : 'detached HEAD'} ${nextId}] ${msg}\n 1 file changed, 1 insertion(+)`,
        error: false
      };
    }

    case 'branch': {
      const uFlagIdx = parts.indexOf('-u') !== -1 ? parts.indexOf('-u') : parts.indexOf('--set-upstream-to');
      if (uFlagIdx !== -1) {
        const upstream = parts[uFlagIdx + 1];
        const localBranch = parts[uFlagIdx + 2] || (state.head.type === 'branch' ? state.head.target : null);
        if (!upstream) {
          return { newState: state, output: `error: morate navesti udaljenu granu za povezivanje (npr. origin/master)`, error: true };
        }
        if (!localBranch || !state.branches[localBranch]) {
          return { newState: state, output: `error: lokalna grana ne postoji ili niste na grani.`, error: true };
        }
        return {
          newState: state,
          output: `Grana '${localBranch}' je podešena da prati udaljenu granu '${upstream}' sa servera.`,
          error: false
        };
      }

      const branchName = parts[2];
      const deleteFlag = parts.includes('-d') || parts.includes('-D');

      if (!branchName) {
        // Listanje grana
        const list = Object.keys(state.branches)
          .map(b => {
            const isCurrent = state.head.type === 'branch' && state.head.target === b;
            return `${isCurrent ? '* ' : '  '}${b} -> ${state.branches[b]}`;
          })
          .join('\n');
        return { newState: state, output: list || 'Nema grana.', error: false };
      }

      if (deleteFlag) {
        const targetToDelete = parts.find(p => p !== 'git' && p !== 'branch' && p !== '-d' && p !== '-D');
        if (!targetToDelete || !state.branches[targetToDelete]) {
          return { newState: state, output: `error: grana '${targetToDelete}' ne postoji.`, error: true };
        }
        if (state.head.type === 'branch' && state.head.target === targetToDelete) {
          return { newState: state, output: `error: ne možete obrisati granu na kojoj se trenutno nalazite.`, error: true };
        }
        
        const updatedBranches = { ...state.branches };
        delete updatedBranches[targetToDelete];
        
        return {
          newState: { ...state, branches: updatedBranches },
          output: `Obrisana grana ${targetToDelete} (bila je na ${state.branches[targetToDelete]}).`,
          error: false
        };
      }

      // Kreiranje nove grane
      if (state.branches[branchName]) {
        return { newState: state, output: `fatal: grana sa imenom '${branchName}' već postoji.`, error: true };
      }

      const currentCommit = getCurrentCommitId(state);
      const newState = {
        ...state,
        branches: {
          ...state.branches,
          [branchName]: currentCommit
        }
      };

      return {
        newState,
        output: `Kreirana lokalna grana '${branchName}' na commit-u ${currentCommit || 'početnom'}.`,
        error: false
      };
    }

    case 'checkout':
    case 'switch': {
      // checkout -b <ime>
      const isCreateAndSwitch = parts.includes('-b') || (subCmd === 'switch' && parts.includes('-c'));
      let target = '';
      if (isCreateAndSwitch) {
        const flagIdx = parts.indexOf('-b') !== -1 ? parts.indexOf('-b') : parts.indexOf('-c');
        target = parts[flagIdx + 1];
        if (!target) {
          return { newState: state, output: `fatal: ime nove grane nije prosleđeno.`, error: true };
        }

        if (state.branches[target]) {
          return { newState: state, output: `fatal: grana sa imenom '${target}' već postoji.`, error: true };
        }

        const currentCommit = getCurrentCommitId(state);
        const newState: RepoState = {
          ...state,
          branches: {
            ...state.branches,
            [target]: currentCommit
          },
          head: {
            type: 'branch',
            target: target
          }
        };
        return {
          newState,
          output: `Kreirana i aktivirana nova grana '${target}'.`,
          error: false
        };
      }

      target = parts[2];
      if (!target) {
        return { newState: state, output: `fatal: morate navesti granu ili commit ID za prelazak.`, error: true };
      }

      // Provera da li je to git checkout -- readme.txt (poništavanje promena)
      if (parts[2] === '--') {
        const file = parts[3];
        if (!file) {
          return { newState: state, output: `fatal: nije naveden fajl za poništavanje promena.`, error: true };
        }
        const newState = {
          ...state,
          index: {
            ...state.index,
            staged: state.index.staged.filter(f => f !== file)
          },
          workingDirectory: {
            ...state.workingDirectory,
            modified: state.workingDirectory.modified.filter(f => f !== file),
            untracked: state.workingDirectory.untracked.filter(f => f !== file)
          }
        };
        return {
          newState,
          output: `Poništene promene u radnom direktorijumu za '${file}'.`,
          error: false
        };
      }

      // Provera da li je grana
      if (state.branches[target] !== undefined) {
        const newState: RepoState = {
          ...state,
          head: { type: 'branch', target: target }
        };
        return {
          newState,
          output: `Prebačeno na granu '${target}'`,
          error: false
        };
      }

      // Provera da li je commit ID
      if (state.commits[target] !== undefined) {
        const newState: RepoState = {
          ...state,
          head: { type: 'commit', target: target }
        };
        return {
          newState,
          output: `UPOZORENJE: Nalazite se u stanju 'detached HEAD'. Možete razgledati i raditi testne commit-e.\nPrebačeno na commit '${target}'`,
          error: false
        };
      }

      // Provera da li je remote branch tipa origin/master
      if (state.remoteBranches && state.remoteBranches[target] !== undefined) {
        const newState: RepoState = {
          ...state,
          head: { type: 'commit', target: state.remoteBranches[target] }
        };
        return {
          newState,
          output: `Prebačeno na udaljenu granu '${target}' (u detached HEAD stanju).`,
          error: false
        };
      }

      return {
        newState: state,
        output: `error: putanja '${target}' ne odgovara nijednom fajlu ili grani u repozitorijumu.`,
        error: true
      };
    }

    case 'merge': {
      const targetBranch = parts[2];
      if (!targetBranch) {
        return { newState: state, output: `fatal: morate proslediti granu za spajanje.`, error: true };
      }

      const targetCommitId = state.branches[targetBranch] || (state.remoteBranches ? state.remoteBranches[targetBranch] : undefined);
      if (!targetCommitId) {
        return { newState: state, output: `merge: ${targetBranch} - grana ne postoji.`, error: true };
      }

      const currentCommitId = getCurrentCommitId(state);
      if (!currentCommitId) {
        // Ako nema trenutnog commit-a, samo kopiramo targetCommit
        if (state.head.type === 'branch') {
          const newState = {
            ...state,
            branches: { ...state.branches, [state.head.target]: targetCommitId }
          };
          return { newState, output: `Fast-forward spajanje na ${targetBranch}.`, error: false };
        }
        return { newState: state, output: `Greška: HEAD ne pokazuje na ispravan commit.`, error: true };
      }

      // Da li je targetBranch već uključen (targetCommit je predak od currentCommit)
      const ancestor = findCommonAncestor(state.commits, currentCommitId, targetCommitId);
      if (ancestor === targetCommitId) {
        return { newState: state, output: `Već ažurirano (Already up-to-date).`, error: false };
      }

      // Da li je fast-forward (currentCommit je predak od targetCommit)
      if (ancestor === currentCommitId) {
        // Fast forward! Pomeramo granu na targetCommitId
        const updatedBranches = { ...state.branches };
        if (state.head.type === 'branch') {
          updatedBranches[state.head.target] = targetCommitId;
        }
        const newState = {
          ...state,
          branches: updatedBranches,
          head: state.head.type === 'commit' ? { type: 'commit' as const, target: targetCommitId } : state.head
        };
        return {
          newState,
          output: `Ažuriranje ${currentCommitId}..${targetCommitId}\nFast-forward spajanje.`,
          error: false
        };
      }

      // Standardno spajanje (3-way merge) -> kreiramo merge commit
      const nextId = generateNextCommitId(state.commits);
      const mergeMsg = `Merge branch '${targetBranch}' u ${state.head.type === 'branch' ? state.head.target : 'trenutnu granu'}`;
      
      const newCommit: Commit = {
        id: nextId,
        parentIds: [currentCommitId, targetCommitId],
        message: mergeMsg
      };

      const updatedCommits = { ...state.commits, [nextId]: newCommit };
      const updatedBranches = { ...state.branches };
      if (state.head.type === 'branch') {
        updatedBranches[state.head.target] = nextId;
      }

      const newState = {
        ...state,
        commits: updatedCommits,
        branches: updatedBranches,
        head: state.head.type === 'commit' ? { type: 'commit' as const, target: nextId } : state.head
      };

      return {
        newState,
        output: `Spajanje napravljeno korišćenjem strategije 'recursive'.\n[${state.head.type === 'branch' ? state.head.target : 'HEAD'} ${nextId}] ${mergeMsg}`,
        error: false
      };
    }

    case 'rebase': {
      const targetBranch = parts[2];
      if (!targetBranch) {
        return { newState: state, output: `fatal: morate proslediti ciljnu granu za rebase.`, error: true };
      }

      const targetCommitId = state.branches[targetBranch] || (state.remoteBranches ? state.remoteBranches[targetBranch] : undefined);
      if (!targetCommitId) {
        return { newState: state, output: `fatal: grana '${targetBranch}' ne postoji.`, error: true };
      }

      const currentCommitId = getCurrentCommitId(state);
      if (!currentCommitId) {
        return { newState: state, output: `Greška: HEAD ne pokazuje na ispravan commit.`, error: true };
      }

      const commonAncestor = findCommonAncestor(state.commits, currentCommitId, targetCommitId);
      if (!commonAncestor) {
        return { newState: state, output: `Greška: Nema zajedničkog pretka, rebase nemoguć.`, error: true };
      }

      if (commonAncestor === currentCommitId) {
        // Current branch je predak, samo radimo fast-forward rebase
        const updatedBranches = { ...state.branches };
        if (state.head.type === 'branch') {
          updatedBranches[state.head.target] = targetCommitId;
        }
        const newState = {
          ...state,
          branches: updatedBranches,
          head: state.head.type === 'commit' ? { type: 'commit' as const, target: targetCommitId } : state.head
        };
        return {
          newState,
          output: `Uspešno rebejdovano i ažurirano (Fast-Forward na ${targetBranch}).`,
          error: false
        };
      }

      // Uzimamo niz commit-a od zajedničkog pretka do trenutnog vrha
      const commitsToCopy = getCommitPath(state.commits, commonAncestor, currentCommitId);
      if (commitsToCopy.length === 0) {
        return { newState: state, output: `Već ažurno sa ${targetBranch}.`, error: false };
      }

      // Kopiramo ih jedan po jedan na vrh targetCommitId
      let currentParent = targetCommitId;
      const copiedCommitsMap: { [id: string]: Commit } = { ...state.commits };
      
      const idMapping: { [oldId: string]: string } = {};

      commitsToCopy.forEach(oldId => {
        const oldCommit = state.commits[oldId];
        const nextId = generateNextCommitId(copiedCommitsMap);
        
        // Zamenjujemo roditelja (ako je imao više roditelja, preslikavamo ih)
        const parentIds = oldCommit.parentIds.map(p => {
          if (p === commonAncestor) return currentParent;
          return idMapping[p] || p;
        });

        // Ako je prvi roditelj zamenjen
        if (parentIds[0] === oldCommit.parentIds[0]) {
          parentIds[0] = currentParent;
        }

        const newCommit: Commit = {
          id: nextId,
          parentIds: parentIds.length > 0 ? parentIds : [currentParent],
          message: `${oldCommit.message} (rebased)`
        };

        copiedCommitsMap[nextId] = newCommit;
        idMapping[oldId] = nextId;
        currentParent = nextId;
      });

      const finalCommitId = currentParent;
      const updatedBranches = { ...state.branches };
      if (state.head.type === 'branch') {
        updatedBranches[state.head.target] = finalCommitId;
      }

      const newState = {
        ...state,
        commits: copiedCommitsMap,
        branches: updatedBranches,
        head: state.head.type === 'commit' ? { type: 'commit' as const, target: finalCommitId } : state.head
      };

      return {
        newState,
        output: `Uspešno primenjeno i rebejdovano ${commitsToCopy.length} commit-a na vrh ${targetBranch}.`,
        error: false
      };
    }

    case 'cherry-pick': {
      const targetCommitId = parts[2];
      if (!targetCommitId) {
        return { newState: state, output: `fatal: morate navesti commit ID za cherry-pick.`, error: true };
      }

      const targetCommit = state.commits[targetCommitId] || (state.remoteCommits ? state.remoteCommits[targetCommitId] : undefined);
      if (!targetCommit) {
        return { newState: state, output: `error: commit '${targetCommitId}' ne postoji.`, error: true };
      }

      const currentCommitId = getCurrentCommitId(state);
      const nextId = generateNextCommitId(state.commits);

      const newCommit: Commit = {
        id: nextId,
        parentIds: currentCommitId ? [currentCommitId] : [],
        message: targetCommit.message
      };

      const updatedCommits = { ...state.commits, [nextId]: newCommit };
      const updatedBranches = { ...state.branches };
      if (state.head.type === 'branch') {
        updatedBranches[state.head.target] = nextId;
      }

      const newState = {
        ...state,
        commits: updatedCommits,
        branches: updatedBranches,
        head: state.head.type === 'commit' ? { type: 'commit' as const, target: nextId } : state.head
      };

      return {
        newState,
        output: `[${state.head.type === 'branch' ? state.head.target : 'HEAD'} ${nextId}] Uspešno cherry-pickovan: ${targetCommit.message}`,
        error: false
      };
    }

    case 'reset': {
      // Podržava git reset <commit> ili git reset --hard <commit>
      const isHard = parts.includes('--hard');
      const commitArg = parts.find(p => p !== 'git' && p !== 'reset' && p !== '--hard');

      if (!commitArg) {
        // Podrazumevano poništavanje index-a bez pomeranja HEAD
        const newlyUntracked: string[] = [];
        const newlyModified: string[] = [];

        state.index.staged.forEach(file => {
          if (state.workingDirectory.files.includes(file)) {
            newlyModified.push(file);
          } else {
            newlyUntracked.push(file);
          }
        });

        const newState = {
          ...state,
          index: { staged: [], deleted: [] },
          workingDirectory: {
            ...state.workingDirectory,
            modified: Array.from(new Set([...state.workingDirectory.modified, ...newlyModified])),
            untracked: Array.from(new Set([...state.workingDirectory.untracked, ...newlyUntracked]))
          }
        };
        return { newState, output: `Nepripremljene promene nakon reseta.`, error: false };
      }

      const targetId = state.branches[commitArg] || commitArg;
      if (!state.commits[targetId]) {
        return { newState: state, output: `error: commit '${commitArg}' ne postoji.`, error: true };
      }

      const updatedBranches = { ...state.branches };
      if (state.head.type === 'branch') {
        updatedBranches[state.head.target] = targetId;
      }

      const newState: RepoState = {
        ...state,
        branches: updatedBranches,
        head: state.head.type === 'commit' ? { type: 'commit', target: targetId } : state.head,
        index: isHard ? { staged: [], deleted: [] } : state.index,
        workingDirectory: isHard ? {
          files: ['readme.txt'],
          modified: [],
          untracked: []
        } : state.workingDirectory
      };

      return {
        newState,
        output: `HEAD je sada na ${targetId} ${state.commits[targetId].message}`,
        error: false
      };
    }

    case 'revert': {
      const commitArg = parts[2];
      if (!commitArg) {
        return { newState: state, output: `error: morate proslediti commit ID za revert.`, error: true };
      }

      const targetId = state.branches[commitArg] || commitArg;
      const targetCommit = state.commits[targetId];
      if (!targetCommit) {
        return { newState: state, output: `error: commit '${commitArg}' ne postoji.`, error: true };
      }

      const currentCommitId = getCurrentCommitId(state);
      const nextId = generateNextCommitId(state.commits);
      const msg = `Revert "${targetCommit.message}"`;

      const newCommit: Commit = {
        id: nextId,
        parentIds: currentCommitId ? [currentCommitId] : [],
        message: msg
      };

      const updatedCommits = { ...state.commits, [nextId]: newCommit };
      const updatedBranches = { ...state.branches };
      if (state.head.type === 'branch') {
        updatedBranches[state.head.target] = nextId;
      }

      const newState = {
        ...state,
        commits: updatedCommits,
        branches: updatedBranches,
        head: state.head.type === 'commit' ? { type: 'commit' as const, target: nextId } : state.head
      };

      return {
        newState,
        output: `[${state.head.type === 'branch' ? state.head.target : 'HEAD'} ${nextId}] ${msg}\n 1 file changed, 1 deletion(-)`,
        error: false
      };
    }

    case 'clone': {
      const url = parts[2];
      if (!url) {
        return { newState: state, output: `fatal: morate proslediti URL repozitorijuma za kloniranje.`, error: true };
      }

      // Kloniranje generiše simulirano stanje sa remote serverom
      const remoteCommits: { [id: string]: Commit } = {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit na serveru', isRemote: true },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Dodata osnovna dokumentacija', isRemote: true }
      };

      const newState: RepoState = {
        commits: {
          C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit na serveru' },
          C1: { id: 'C1', parentIds: ['C0'], message: 'Dodata osnovna dokumentacija' }
        },
        branches: {
          master: 'C1'
        },
        head: { type: 'branch', target: 'master' },
        index: { staged: [], deleted: [] },
        workingDirectory: {
          files: ['readme.txt'],
          modified: [],
          untracked: []
        },
        remoteCommits,
        remoteBranches: {
          'origin/master': 'C1'
        },
        hasRemote: true
      };

      return {
        newState,
        output: `Kloniranje u 'projekat'...\nremote: Brojanje objekata: 6, gotovo.\nremote: Kompresovanje objekata: 100% (4/4), gotovo.\nPrimanje objekata: 100% (6/6), gotovo.`,
        error: false
      };
    }

    case 'fetch': {
      if (!state.hasRemote) {
        return { newState: state, output: `fatal: nema podešenog udaljenog repozitorijuma.`, error: true };
      }

      // Fetch preuzima remoteCommits i postavlja ih u local commits, i ažurira origin/master
      const updatedCommits = { ...state.commits };
      if (state.remoteCommits) {
        Object.keys(state.remoteCommits).forEach(id => {
          if (!updatedCommits[id]) {
            updatedCommits[id] = { ...state.remoteCommits![id], isRemote: false };
          }
        });
      }

      const newState: RepoState = {
        ...state,
        commits: updatedCommits,
        remoteBranches: {
          ...state.remoteBranches,
          'origin/master': state.remoteBranches ? state.remoteBranches['origin/master'] : ''
        }
      };

      return {
        newState,
        output: `Sa servera:\n * [nova grana]      master     -> origin/master`,
        error: false
      };
    }

    case 'push': {
      if (!state.hasRemote) {
        return { newState: state, output: `fatal: nema podešenog udaljenog repozitorijuma.`, error: true };
      }

      const currentCommitId = getCurrentCommitId(state);
      const remoteMasterId = state.remoteBranches ? state.remoteBranches['origin/master'] : '';

      if (currentCommitId === remoteMasterId) {
        return { newState: state, output: `Sve je već poslato (Everything up-to-date).`, error: false };
      }

      // Provera da li možemo da uradimo push (da li je local commit potomak remote commit-a)
      const ancestor = findCommonAncestor(state.commits, currentCommitId, remoteMasterId || '');
      if (ancestor !== remoteMasterId) {
        return {
          newState: state,
          output: `error: neuspešno slanje nekih referenci na server.\nSavet: Uradite prvo 'git pull' da biste integrisali udaljene promene pre slanja.`,
          error: true
        };
      }

      // Ažuriramo server
      const updatedRemoteCommits = { ...state.remoteCommits };
      const updatedRemoteBranches = { ...state.remoteBranches };

      // Kopiramo sve lokalne commit-e na server
      Object.keys(state.commits).forEach(id => {
        updatedRemoteCommits[id] = { ...state.commits[id], isRemote: true };
      });

      if (state.head.type === 'branch' && state.head.target === 'master') {
        updatedRemoteBranches['origin/master'] = currentCommitId;
      }

      const newState: RepoState = {
        ...state,
        remoteCommits: updatedRemoteCommits,
        remoteBranches: updatedRemoteBranches
      };

      return {
        newState,
        output: `Brojanje objekata: 3, gotovo.\nDelta kompresija uz korišćenje do 8 niti.\nSlanje objekata: 100% (3/3), gotovo.\nTo origin\n   ${remoteMasterId?.substring(0, 7)}..${currentCommitId?.substring(0, 7)}  master -> master`,
        error: false
      };
    }

    case 'pull': {
      if (!state.hasRemote) {
        return { newState: state, output: `fatal: nema podešenog udaljenog repozitorijuma.`, error: true };
      }

      // 1. Fetch
      const fetchResult = executeGitCommand(state, 'git fetch');
      let newState = fetchResult.newState;
      
      // 2. Merge origin/master
      const remoteMasterId = newState.remoteBranches ? newState.remoteBranches['origin/master'] : '';
      if (!remoteMasterId) {
        return { newState, output: fetchResult.output + `\nGreška: origin/master ne postoji.`, error: true };
      }

      const mergeResult = executeGitCommand(newState, `git merge origin/master`);
      return {
        newState: mergeResult.newState,
        output: fetchResult.output + '\n' + mergeResult.output,
        error: mergeResult.error
      };
    }

    case 'stash': {
      const option = parts[2]; // git stash <pop/list/clear>
      if (!option) {
        // Običan git stash: sklanja staged i modified fajlove
        const modifiedFiles = [...state.workingDirectory.modified];
        const stagedFiles = [...state.index.staged];
        
        if (modifiedFiles.length === 0 && stagedFiles.length === 0) {
          return {
            newState: state,
            output: `Nema lokalnih promena za sklanjanje. Radno stablo je čisto.`,
            error: false
          };
        }

        const newStashItem = {
          staged: stagedFiles,
          modified: modifiedFiles,
          untracked: []
        };

        const updatedStash = state.stash ? [...state.stash, newStashItem] : [newStashItem];

        const newState: RepoState = {
          ...state,
          index: { staged: [], deleted: [] },
          workingDirectory: {
            ...state.workingDirectory,
            modified: [],
          },
          stash: updatedStash
        };

        return {
          newState,
          output: `Saved working directory and index state WIP on ${state.head.target}: korak stash-a sačuvan.\nRadno stablo je sada čisto!`,
          error: false
        };
      } else if (option === 'pop') {
        if (!state.stash || state.stash.length === 0) {
          return {
            newState: state,
            output: `fatal: nema sačuvanih stash-eva za vraćanje.`,
            error: true
          };
        }

        const updatedStash = [...state.stash];
        const poppedItem = updatedStash.pop()!;

        const newState: RepoState = {
          ...state,
          index: {
            ...state.index,
            staged: Array.from(new Set([...state.index.staged, ...poppedItem.staged]))
          },
          workingDirectory: {
            ...state.workingDirectory,
            modified: Array.from(new Set([...state.workingDirectory.modified, ...poppedItem.modified]))
          },
          stash: updatedStash
        };

        return {
          newState,
          output: `Preuzete i primenjene promene iz stash-a na radno stablo!\nUklonjena stavka stash-a.`,
          error: false
        };
      } else if (option === 'list') {
        const listOutput = state.stash && state.stash.length > 0
          ? state.stash.map((_, idx) => `stash@{${idx}}: WIP on ${state.head.target}: sačuvano stanje`).join('\n')
          : `Nema sačuvanih stash stavki.`;
        return {
          newState: state,
          output: listOutput,
          error: false
        };
      } else {
        return {
          newState: state,
          output: `Opcija '${option}' za git stash nije podržana. Koristite 'git stash' ili 'git stash pop'.`,
          error: true
        };
      }
    }

    case 'tag': {
      const tagName = parts[2];
      if (!tagName) {
        const allTags = state.tags ? Object.keys(state.tags).join('\n') : '';
        return {
          newState: state,
          output: allTags || `Nema kreiranih tagova.`,
          error: false
        };
      }

      const currentCommit = getCurrentCommitId(state);
      if (!currentCommit) {
        return {
          newState: state,
          output: `fatal: nema commit-a na koji se može staviti tag.`,
          error: true
        };
      }

      const updatedTags = { ...state.tags, [tagName]: currentCommit };
      const newState: RepoState = {
        ...state,
        tags: updatedTags
      };

      return {
        newState,
        output: `Kreiran tag '${tagName}' na commit-u ${currentCommit} uspešno!`,
        error: false
      };
    }

    case 'diff': {
      const isStaged = parts.includes('--staged') || parts.includes('--cached');
      if (isStaged) {
        if (state.index.staged.length === 0) {
          return {
            newState: state,
            output: `Nema pripremljenih promena za prikaz (staging area je prazna).`,
            error: false
          };
        }
        return {
          newState: state,
          output: state.index.staged.map(f => `diff --git a/${f} b/${f}\n--- a/${f}\n+++ b/${f}\n@@ -1 +1 @@\n+ Nova pripremljena linija u ${f}`).join('\n\n'),
          error: false
        };
      } else {
        if (state.workingDirectory.modified.length === 0) {
          return {
            newState: state,
            output: `Nema nepripremljenih modifikacija u radnom direktorijumu.`,
            error: false
          };
        }
        return {
          newState: state,
          output: state.workingDirectory.modified.map(f => `diff --git a/${f} b/${f}\n--- a/${f}\n+++ b/${f}\n@@ -1,1 +1,2 @@\n- Stara verzija fajla ${f}\n+ Nova nepripremljena izmena u ${f}`).join('\n\n'),
          error: false
        };
      }
    }

    case 'reflog': {
      const currentCommit = getCurrentCommitId(state) || 'C1';
      return {
        newState: state,
        output: `${currentCommit} HEAD@{0}: checkout: moving from develop to master
${currentCommit} HEAD@{1}: commit: Dodat novi feature
C1 HEAD@{2}: commit: Inicijalni commit sa predavanja
C0 HEAD@{3}: clone: from https://github.com/igord/git-kurs.git`,
        error: false
      };
    }

    case 'bisect': {
      const sub = parts[2];
      if (!sub) {
        return {
          newState: state,
          output: `Korišćenje: git bisect [start|bad|good|reset]`,
          error: true
        };
      }
      if (sub === 'start') {
        return {
          newState: state,
          output: `status: bisecting: 3 commits preostalo za testiranje nakon ovoga (otprilike 2 koraka)\n[C2] Rad na feature grani`,
          error: false
        };
      } else if (sub === 'bad') {
        return {
          newState: state,
          output: `status: bisecting: 1 commit preostalo za testiranje nakon ovoga (otprilike 1 korak)\n[C1] Prvi commit (potencijalno loš)`,
          error: false
        };
      } else if (sub === 'good') {
        return {
          newState: state,
          output: `C1 je prvi loš commit (first bad commit)\ncommit C1\nAuthor: Luka <luka@example.com>\nDate: Sun May 24 15:22:50 2026\n\n    Uvedena greška u kodu`,
          error: false
        };
      } else if (sub === 'reset') {
        return {
          newState: state,
          output: `Završen bisect. Vraćen na originalni HEAD.`,
          error: false
        };
      } else {
        return {
          newState: state,
          output: `error: nepoznata bisect opcija '${sub}'`,
          error: true
        };
      }
    }

    default:
      return {
        newState: state,
        output: `Nepoznata komanda 'git ${subCmd}'. Ukucajte 'git help' za listu podržanih komandi.`,
        error: true
      };
  }
};
