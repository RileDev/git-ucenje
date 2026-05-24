import { type RepoState } from './gitEngine';

export interface Level {
  id: number;
  title: string;
  category: string;
  description: string;
  hint: string;
  initialState: RepoState;
  validate: (state: RepoState) => boolean;
  expectedCommands: string[];
}

export const levels: Level[] = [
  {
    id: 1,
    title: "Prvi koraci: Inicijalizacija i prvi commit",
    category: "Osnove",
    description: `### Dobrodošli u svet Git-a!
Git je distribuirani sistem za kontrolu verzija (DVCS) koji je 2005. godine stvorio Linus Torvalds za potrebe razvoja Linux jezgra.

U Git-u, projekat se prati unutar **repozitorijuma**. Repozitorijum je zapravo skriveni direktorijum pod nazivom \`.git\` u korenu vašeg projekta koji sadrži sve metapodatke, objekte i istoriju promena.

Glavne operacije koje ćemo savladati u ovom nivou su:
*   \`git init\` - Kreira novi prazan lokalni repozitorijum (pravi \`.git\` folder).
*   \`git add <fajl>\` - Dodaje fajl u pripremnu zonu (indeks ili staging area).
*   \`git commit -m "poruka"\` - Trajno beleži stanje iz pripremne zone u istoriju kao novu "vremensku kapsulu" (commit objekat).

**Tvoj zadatak:**
1. Inicijalizuj repozitorijum pomoću komande \`git init\`.
2. Primetićeš da se pojavio fajl \`readme.txt\`. Dodaj ga u pripremnu zonu pomoću \`git add readme.txt\`.
3. Napravi svoj prvi commit sa porukom po izboru koristeći \`git commit -m "Moj prvi commit"\`.`,
    hint: "Ukucaj redom:\n1. `git init`\n2. `git add readme.txt`\n3. `git commit -m \"Moj prvi commit\"`",
    initialState: {
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
    },
    validate: (state: RepoState) => {
      const commitIds = Object.keys(state.commits);
      return (
        commitIds.length > 0 &&
        state.head.type === 'branch' &&
        state.head.target === 'master' &&
        state.branches['master'] === commitIds[0]
      );
    },
    expectedCommands: ["git init", "git add", "git commit"]
  },
  {
    id: 2,
    title: "Pripremna zona i status repozitorijuma",
    category: "Osnove",
    description: `### Praćenje sadržaja i git status
Jedna od ključnih osobenosti Git-a je to što **on ne prati fajlove, već sadržaj**. Izmene se moraju eksplicitno dodati u pripremnu zonu (index) pre snimanja (commit-a).

Komanda \`git status\` je tvoj najbolji prijatelj. Ona prikazuje:
1.  Na kojoj se grani trenutno nalaziš.
2.  Koji fajlovi su izmenjeni ali još nisu pripremljeni (Changes not staged for commit).
3.  Koji fajlovi su novi i uopšte se ne prate (Untracked files).
4.  Koji fajlovi su pripremljeni i čeka se njihovo snimanje (Changes to be committed).

**Tvoj zadatak:**
U radnom direktorijumu se nalazi novi fajl \`glavna.py\`.
1.  Pogledaj status repozitorijuma sa \`git status\`.
2.  Pripremi fajl \`glavna.py\` za commit koristeći \`git add glavna.py\`.
3.  Snimi promene sa porukom "Dodat program" koristeći \`git commit -m "Dodat program"\`.`,
    hint: "Iskoristi `git status` da osmotriš fajlove, a zatim unesi:\n1. `git add glavna.py`\n2. `git commit -m \"Dodat program\"`",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' }
      },
      branches: { master: 'C0' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: ['glavna.py']
      },
      hasRemote: false
    },
    validate: (state: RepoState) => {
      const commitIds = Object.keys(state.commits);
      return (
        commitIds.length >= 2 &&
        state.branches['master'] !== 'C0' &&
        state.workingDirectory.files.includes('glavna.py')
      );
    },
    expectedCommands: ["git status", "git add", "git commit"]
  },
  {
    id: 3,
    title: "Poništavanje lokalnih promena",
    category: "Osnove",
    description: `### Šta kada pogrešimo?
Git nam pruža moćne mehanizme za ispravljanje grešaka pre nego što ih pošaljemo na server.

Dve osnovne komande za poništavanje su:
*   \`git checkout -- <fajl>\` - Odbacuje promene u radnom direktorijumu i vraća fajl u stanje iz poslednjeg commit-a ili pripremne zone (fajl se "prepisuje" čistom verzijom).
*   \`git reset HEAD <fajl>\` - Uklanja fajl iz pripremne zone (index-a), ali ostavlja same izmene u fajlu netaknutim u radnom direktorijumu.

**Tvoj zadatak:**
Izmenio si fajl \`readme.txt\` i shvatio da su te izmene pogrešne. Fajl se trenutno nalazi u pripremnoj zoni (staged).
1.  Poništi pripremu fajla tako što ćeš ga skinuti iz index-a pomoću \`git reset\`.
2.  Zatim potpuno odbaci sve promene nad tim fajlom u radnom direktorijumu pomoću \`git checkout -- readme.txt\` kako bi tvoje radno stablo ponovo bilo čisto!`,
    hint: "Ukucaj:\n1. `git reset` (ili `git reset HEAD readme.txt`)\n2. `git checkout -- readme.txt` za potpuno odbacivanje lokalnih izmena.",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' }
      },
      branches: { master: 'C0' },
      head: { type: 'branch', target: 'master' },
      index: { staged: ['readme.txt'], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      hasRemote: false
    },
    validate: (state: RepoState) => {
      return (
        state.index.staged.length === 0 &&
        state.workingDirectory.untracked.length === 0 &&
        state.workingDirectory.modified.length === 0
      );
    },
    expectedCommands: ["git reset", "git checkout"]
  },
  {
    id: 4,
    title: "Uvod u grananje: Kreiranje i kretanje",
    category: "Grananje",
    description: `### Grane kao alternativni tokovi razvoja
Grane (branches) su jedna od najmoćnijih Git mogućnosti. Za razliku od drugih sistema gde je grananje skupo i sporo jer kopira fajlove, **u Git-u je grana samo jednostavan 41-bajtni fajl koji sadrži SHA1 heš poslednjeg commit-a** na tom toku. Zato je kreiranje grana trenutno!

Komande za rad sa granama:
*   \`git branch <ime>\` - Kreira novu granu sa datim imenom koja pokazuje na trenutni commit.
*   \`git checkout <ime>\` (ili modernija alternativa \`git switch <ime>\`) - Pomera \`HEAD\` pokazivač na izabranu granu i ažurira fajlove u radnom direktorijumu.
*   \`git checkout -b <ime>\` - Brza prečica koja u jednom koraku kreira granu i prebacuje te na nju.

**Tvoj zadatak:**
1.  Kreiraj novu granu pod nazivom \`feature\` koristeći \`git branch feature\`.
2.  Prebaci se na tu novu granu pomoću \`git checkout feature\`.
3.  Napravi novi commit na toj grani sa porukom "Moj feature" pomoću \`git commit -m "Moj feature"\` (fajl je već pripremljen). Primeti kako se grana \`feature\` pomera napred, dok \`master\` ostaje na starom mestu!`,
    hint: "Ukucaj:\n1. `git branch feature` za kreiranje grane\n2. `git checkout feature` za prelazak\n3. `git commit -m \"Moj feature\"` da napraviš commit na toj grani.",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Prva stabilna verzija' }
      },
      branches: { master: 'C1' },
      head: { type: 'branch', target: 'master' },
      index: { staged: ['glavna.py'], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      hasRemote: false
    },
    validate: (state: RepoState) => {
      return (
        state.branches['feature'] !== undefined &&
        state.head.type === 'branch' &&
        state.head.target === 'feature' &&
        state.branches['feature'] !== 'C1' &&
        state.branches['master'] === 'C1'
      );
    },
    expectedCommands: ["git branch", "git checkout", "git commit"]
  },
  {
    id: 5,
    title: "Spajanje grana: Merge",
    category: "Grananje",
    description: `### Integracija promena sa git merge
Nakon što uspešno završimo rad na nekoj grani (npr. razvijemo novi feature), vreme je da te promene vratimo u glavnu granu (\`master\`). To radimo komandom \`git merge <ime_grane>\`.

Postoje dve glavne strategije spajanja:
1.  **Fast-Forward (brzo premotavanje):** Dešava se kada se vrh trenutne grane nalazi direktno iza grane koju spajamo (nema paralelnih promena). Git samo "premota" pokazivač trenutne grane na vrh ciljne grane.
2.  **3-Way Merge (spajanje u tri tačke):** Dešava se kada su obe grane napredovale paralelno. Git pronalazi njihovog zajedničkog pretka i kreira poseban **merge commit** koji spaja obe istorije i ima dva roditelja.

**Tvoj zadatak:**
Nalaziš se na grani \`master\` (na commit-u C1). Grana \`feature\` je otišla korak ispred na commit C2.
1.  Spoji granu \`feature\` u \`master\` granu. Budući da \`master\` nije napredovao, ovo će biti čist *Fast-Forward* merge!`,
    hint: "Nalaziš se na grani `master`. Samo ukucaj:\n`git merge feature`",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Prvi commit na masteru' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Završen feature rad' }
      },
      branches: { master: 'C1', feature: 'C2' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt', 'glavna.py'],
        modified: [],
        untracked: []
      },
      hasRemote: false
    },
    validate: (state: RepoState) => {
      return (
        state.branches['master'] === 'C2' &&
        state.head.type === 'branch' &&
        state.head.target === 'master'
      );
    },
    expectedCommands: ["git merge"]
  },
  {
    id: 6,
    title: "Linearna istorija: Rebase",
    category: "Grananje",
    description: `### Ponovno baziranje sa git rebase
Drugi i izuzetno popularan način za spajanje promena je **rebase**.
Dok \`merge\` pravi novi commit koji spaja grane i čuva vernu sliku nelinearnog razvoja, \`rebase\` uzima sve jedinstvene commit-e sa trenutne grane, privremeno ih sklanja, i zatim ih **ponovo primenjuje (kopira) jednog po jednog na vrh ciljne grane**.

**Rezultat:** Dobijamo savršeno čistu i linearnu istoriju projekta, kao da se nikada nismo ni granali!
*Zlatno pravilo rebase-a:* Nikada ne radite rebase na deljenim javnim granama koje su već poslate na server, jer to menja istoriju (pravi nove commit-e sa novim heševima)!

**Tvoj zadatak:**
Nalaziš se na grani \`feature\` (na commit-u C2). U međuvremenu, na grani \`master\` je napravljen novi commit C3.
1.  Odradi rebase trenutne grane \`feature\` na vrh grane \`master\` koristeći \`git rebase master\`.
2.  Pogledaj kako je tvoj commit C2 premešten (kopiran kao C2') na sam vrh nakon C3!`,
    hint: "Nalaziš se na grani `feature`. Samo ukucaj:\n`git rebase master`",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Zajednički koren' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Prvi commit' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Rad na feature grani' },
        C3: { id: 'C3', parentIds: ['C1'], message: 'Nezavisan commit na masteru' }
      },
      branches: { master: 'C3', feature: 'C2' },
      head: { type: 'branch', target: 'feature' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      hasRemote: false
    },
    validate: (state: RepoState) => {
      const activeCommit = state.branches['feature'];
      const commit = state.commits[activeCommit];
      return (
        commit &&
        commit.parentIds.includes('C3') &&
        state.head.type === 'branch' &&
        state.head.target === 'feature'
      );
    },
    expectedCommands: ["git rebase"]
  },
  {
    id: 7,
    title: "Odabir specifičnih izmena: Cherry-Pick",
    category: "Grananje",
    description: `### Biranje plodova sa git cherry-pick
Šta ako želiš da preuzmeš samo jedan specifičan commit sa neke druge grane (npr. hitan bugfix koji je kolega odradio), a ne želiš da povlačiš sve ostale promene i spajaš celu granu?

U tu svrhu koristimo **\`git cherry-pick <commit-id>\`**.
Ova komanda uzima promenu zabeleženu u tom konkretnom commit-u i kopira je direktno na vrh tvoje trenutne grane kao potpuno novi commit.

**Tvoj zadatak:**
Nalaziš se na grani \`master\` (na commit-u C1). Na grani \`bugfix\` se nalazi commit \`C2\` koji popravlja kritičan bag sa porukom "Popravljen bag".
1.  Cherry-pick-uj commit \`C2\` na svoju trenutnu granu \`master\` koristeći \`git cherry-pick C2\`.`,
    hint: "Nalaziš se na grani `master`. Ukucaj:\n`git cherry-pick C2`",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Rad na masteru' },
        C2: { id: 'C2', parentIds: ['C0'], message: 'Popravljen bag' }
      },
      branches: { master: 'C1', bugfix: 'C2' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      hasRemote: false
    },
    validate: (state: RepoState) => {
      const masterCommitId = state.branches['master'];
      const masterCommit = state.commits[masterCommitId];
      return (
        masterCommitId !== 'C1' &&
        masterCommit &&
        masterCommit.parentIds.includes('C1') &&
        masterCommit.message === 'Popravljen bag'
      );
    },
    expectedCommands: ["git cherry-pick"]
  },
  {
    id: 8,
    title: "Udaljeni repozitorijumi i kloniranje",
    category: "Remote",
    description: `### Rad u distribuiranom okruženju
Do sada smo radili isključivo na našem lokalnom računaru. Ali prava snaga Git-a leži u saradnji sa udaljenim serverima (npr. GitHub, GitLab).

Distribuirani model znači da **svaki član tima ima punu i kompletnu kopiju repozitorijuma lokalno**, uključujući kompletnu istoriju svih verzija.

Za preuzimanje celog postojećeg repozitorijuma sa servera na tvoj računar koristi se komanda **\`git clone <url>\`**. Ova komanda:
1.  Kreira novi direktorijum na tvom računaru.
2.  Preuzima kompletnu istoriju i sve grane sa servera.
3.  Kreira udaljene prateće grane (remote tracking branches) kao što je \`origin/master\` koje predstavljaju stanje na serveru u momentu kloniranja.

**Tvoj zadatak:**
1.  Kloniraj udaljeni repozitorijum pomoću komande \`git clone https://github.com/igord/git-kurs.git\`.`,
    hint: "Ukucaj tačno:\n`git clone https://github.com/igord/git-kurs.git`",
    initialState: {
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
    },
    validate: (state: RepoState) => {
      return state.hasRemote === true && state.branches['master'] !== undefined && state.remoteBranches !== undefined && state.remoteBranches['origin/master'] !== undefined;
    },
    expectedCommands: ["git clone"]
  },
  {
    id: 9,
    title: "Razmena promena: Fetch & Push",
    category: "Remote",
    description: `### Kako sinhronizujemo rad?
Kada radimo na projektu sa udaljenim serverom, imamo lokalne grane (npr. \`master\`) i udaljene prateće grane (npr. \`origin/master\`). Udaljene prateće grane služe kao obeleživači koji nam govore gde se nalazio server u trenutku poslednje komunikacije.

Za sinhronizaciju koristimo:
*   \`git fetch\` - Povezuje se sa serverom i preuzima sve nove commit-e koje mi nemamo. Pomera našu \`origin/master\` prateću granu na novo mesto. **Ova komanda ne spaja promene sa našim lokalnim radom!**
*   \`git push\` - Šalje naše nove lokalne commit-e na server i ažurira stanje na udaljenoj grani. Da bi push uspeo, naši lokalni commit-i moraju biti direktni potomci trenutnog stanja na serveru (istorija ne sme da se razilazi, inače moramo prvo odraditi pull).

**Tvoj zadatak:**
Nalaziš se u kloniranom repozitorijumu. Napravio si novi lokalni commit C2 na grani \`master\`. Server još uvek ne zna za njega (\`origin/master\` je na C1).
1.  Pošalji svoje lokalne promene na server koristeći \`git push\`. Primeti kako se nakon uspešnog slanja udaljena grana \`origin/master\` izjednačava sa tvojom lokalnom granom \`master\`!`,
    hint: "Samo ukucaj:\n`git push` da pošalješ promene na server.",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Zajednički commit' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Lokalne promene na masteru' }
      },
      branches: { master: 'C2' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      remoteCommits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit', isRemote: true },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Zajednički commit', isRemote: true }
      },
      remoteBranches: {
        'origin/master': 'C1'
      },
      hasRemote: true
    },
    validate: (state: RepoState) => {
      return (
        state.remoteBranches !== undefined &&
        state.remoteBranches['origin/master'] === 'C2' &&
        state.branches['master'] === 'C2'
      );
    },
    expectedCommands: ["git push"]
  },
  {
    id: 10,
    title: "Preuzimanje i spajanje: Git Pull",
    category: "Remote",
    description: `### Kompletna sinhronizacija sa git pull
Dok radimo na našem delu koda, kolege iz tima takođe pišu kod i šalju ga na server. Naša lokalna grana \`master\` vremenom zaostaje za stanjem na serveru.

Da bismo u jednom koraku preuzeli te nove promene i integrisali ih u naš radni kod, koristimo komandu **\`git pull\`**.

Pod kapuljačom, komanda \`git pull\` je zapravo prečica koja automatski izvršava dve komande uzastopno:
1.  **\`git fetch\`** - Preuzima nove commit-e i ažurira \`origin/master\`.
2.  **\`git merge origin/master\`** - Spaja te preuzete promene u našu trenutno aktivnu lokalnu granu.

**Tvoj zadatak:**
Nalaziš se na svojoj lokalnoj grani \`master\` (na commit-u C1). Na udaljenom serveru su se u međuvremenu pojavili novi commit-i od drugih kolega, a vrh servera (\`origin/master\`) je na commit-u C2.
1.  Preuzmi i integriši te promene u svoj lokalni master u jednom koraku pomoću komande \`git pull\`.`,
    hint: "Samo ukucaj:\n`git pull` da preuzmeš i automatski spojiš promene sa servera.",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Zajednički commit' }
      },
      branches: { master: 'C1' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      remoteCommits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit', isRemote: true },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Zajednički commit', isRemote: true },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Novi rad kolege sa servera', isRemote: true }
      },
      remoteBranches: {
        'origin/master': 'C2'
      },
      hasRemote: true
    },
    validate: (state: RepoState) => {
      return (
        state.branches['master'] === 'C2' &&
        state.head.type === 'branch' &&
        state.head.target === 'master'
      );
    },
    expectedCommands: ["git pull"]
  },
  {
    id: 11,
    title: "Privremeno sklanjanje izmena: Git Stash",
    category: "Srednji nivo",
    description: `### Privremeno sklanjanje izmena: Git Stash
Često se dešava da radite na nekom složenom zadatku i vaši fajlovi su u "polu-dovršenom" stanju, a onda morate hitno da se prebacite na drugu granu da popravite kritičan bag.
Git vam ne dozvoljava da promenite granu ako imate nepripremljene izmene koje bi mogle biti prebrisane.

Da ne biste morali da pravite besmislene "WIP" commit-e, koristite **\`git stash\`**.
Ova komanda uzima sve vaše trenutne lokalne izmene (i iz pripremne zone i iz radnog direktorijuma), sklanja ih na tajni interni "stek", i vraća vaše radno stablo u savršeno čisto stanje.

Kada završite hitan posao i vratite se nazad, ukucajte **\`git stash pop\`** da biste vratili te sačuvane promene nazad na svoje radno stablo i nastavili tačno tamo gde ste stali!

**Tvoj zadatak:**
1. Imate modifikovan fajl \`readme.txt\`. Sklonite izmene sa \`git stash\`.
2. Vratite izmene nazad na radno stablo sa \`git stash pop\`.`,
    hint: "Ukucaj redom:\n1. `git stash` da skloniš promene.\n2. `git stash pop` da ih vratiš na radno stablo.",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' }
      },
      branches: { master: 'C0' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: ['readme.txt'],
        untracked: []
      },
      hasRemote: false,
      stash: []
    },
    validate: (state: RepoState) => {
      return state.workingDirectory.modified.includes('readme.txt') && (!state.stash || state.stash.length === 0);
    },
    expectedCommands: ["git stash", "git stash pop"]
  },
  {
    id: 12,
    title: "Pregledanje izmena sa git diff",
    category: "Srednji nivo",
    description: `### Pregledanje izmena sa git diff
Kao dobar programer, pre nego što dodate fajlove u pripremnu zonu ili napravite commit, uvek treba detaljno da pregledate šta ste tačno promenili u kodu.

U tu svrhu koristimo komandu **\`git diff\`**:
*   \`git diff\` - Prikazuje razliku između vašeg trenutnog radnog direktorijuma i pripremne zone (staging area). Odlično da vidite šta još niste pripremili!
*   \`git diff --staged\` (ili \`git diff --cached\`) - Prikazuje razliku između pripremne zone i poslednjeg commit-a. Odlično da vidite šta će tačno ući u sledeći commit!

**Tvoj zadatak:**
1. Imate nepripremljene izmene u fajlu \`readme.txt\`. Pogledajte ih sa \`git diff\`.
2. Dodajte fajl u pripremnu zonu sa \`git add readme.txt\`.
3. Pogledajte pripremljene izmene sa \`git diff --staged\` (ili \`git diff --cached\`).`,
    hint: "Ukucaj redom:\n1. `git diff` da vidiš lokalne razlike.\n2. `git add readme.txt` da pripremiš fajl.\n3. `git diff --staged` da vidiš šta ide u commit.",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' }
      },
      branches: { master: 'C0' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: ['readme.txt'],
        untracked: []
      },
      hasRemote: false
    },
    validate: (state: RepoState) => {
      return state.index.staged.includes('readme.txt');
    },
    expectedCommands: ["git diff", "git add", "git diff --staged"]
  },
  {
    id: 13,
    title: "Označavanje važnih trenutaka sa git tag",
    category: "Srednji nivo",
    description: `### Označavanje važnih trenutaka sa git tag
U toku razvoja softvera, određeni commit-i predstavljaju prekretnice - kao što su zvanična izdanja (npr. verzija \`v1.0\`, \`v2.0\`).
Umesto da pamtimo komplikovane SHA1 hešove tih commit-ova, možemo im dodeliti lako čitljive oznake (tags).

Komanda **\`git tag <ime_taga>\`** kreira trajnu oznaku na commit-u na kome se trenutno nalazi \`HEAD\`.

**Tvoj zadatak:**
1. Označite trenutni commit verzijom \`v1.0\` koristeći komandu \`git tag v1.0\`.`,
    hint: "Samo ukucaj:\n`git tag v1.0`",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Spremno za produkciju' }
      },
      branches: { master: 'C1' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      hasRemote: false,
      tags: {}
    },
    validate: (state: RepoState) => {
      return state.tags !== undefined && state.tags['v1.0'] !== undefined;
    },
    expectedCommands: ["git tag"]
  },
  {
    id: 14,
    title: "Kada se grane sukobe: Merge Konflikt",
    category: "Konflikti i Saradnja",
    description: `### Kada se grane sukobe: Merge Konflikt
Kada spajate dve grane koje su menjale **istu liniju u istom fajlu**, Git ne može sam da odluči koja verzija je ispravna. U tom trenutku proces spajanja se zaustavlja i Git javlja **Merge Konflikt**.

Git tada upisuje specijalne konfliktne oznake direktno u konfliktne fajlove:
\`<<<<<<< HEAD\`
Tvoja izmena
\`=======\`
Izmena sa druge grane
\`>>>>>>> feature\`

Zadatak programera je da:
1. Otvori fajl i obriše konfliktne oznake, ostavljajući samo ispravan kod.
2. Pripremi rešen fajl sa \`git add <fajl>\`.
3. Dovrši spajanje sa \`git commit\`.

**Tvoj zadatak:**
Pokušali ste spajanje grane \`feature\` u \`master\` i dobili konflikt u fajlu \`glavna.py\`.
1. Razrešite konflikt tako što ćete pripremiti fajl \`glavna.py\` za commit koristeći \`git add glavna.py\`.
2. Dovršite merge commit sa porukom "Rešen konflikt" koristeći \`git commit -m "Rešen konflikt"\`.`,
    hint: "Ukucaj redom:\n1. `git add glavna.py` da označiš konflikt kao rešen.\n2. `git commit -m \"Rešen konflikt\"` da dovršiš spajanje.",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Zajednički predak' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Izmena na masteru' },
        C2: { id: 'C2', parentIds: ['C0'], message: 'Izmena na feature grani' }
      },
      branches: { master: 'C1', feature: 'C2' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['glavna.py'],
        modified: ['glavna.py'],
        untracked: []
      },
      hasRemote: false,
      mergeInProgress: 'C2'
    },
    validate: (state: RepoState) => {
      const commitIds = Object.keys(state.commits);
      const masterCommitId = state.branches['master'];
      const masterCommit = state.commits[masterCommitId];
      return (
        commitIds.length > 3 &&
        masterCommit &&
        masterCommit.parentIds.length >= 2 &&
        state.index.staged.length === 0
      );
    },
    expectedCommands: ["git add", "git commit"]
  },
  {
    id: 15,
    title: "Povezivanje grana sa serverom: Upstream",
    category: "Konflikti i Saradnja",
    description: `### Povezivanje grana sa serverom: Upstream
Kada kreirate novu lokalnu granu, ona nema direktnu vezu sa udaljenim serverom. Kada pokušate da uradite \`git push\` ili \`git pull\`, Git neće znati na koju granu na serveru treba da pošalje ili preuzme promene.

Da bismo povezali lokalnu granu sa udaljenom, koristimo opciju **\`-u\`** (ili \`--set-upstream-to\`):
\`git branch -u origin/master\` ili \`git push -u origin feature\`

Ovo stvara trajnu vezu, pa ubuduće možete samo kucati jednostavne komande \`git push\` i \`git pull\` bez ikakvih argumenata!

**Tvoj zadatak:**
1. Postavite upstream vezu za vašu trenutnu lokalnu granu \`master\` tako da prati udaljenu granu \`origin/master\` koristeći \`git branch -u origin/master\`.`,
    hint: "Samo ukucaj:\n`git branch -u origin/master` da povežeš granu sa serverom.",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' }
      },
      branches: { master: 'C0' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      remoteCommits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit', isRemote: true }
      },
      remoteBranches: {
        'origin/master': 'C0'
      },
      hasRemote: true
    },
    validate: () => {
      return true;
    },
    expectedCommands: ["git branch"]
  },
  {
    id: 16,
    title: "Uređivanje istorije: Interaktivni Rebase",
    category: "Konflikti i Saradnja",
    description: `### Uređivanje istorije: Interaktivni Rebase
Pre nego što pošaljete svoj kod celom timu na server, korisno je da "počistite" svoju istoriju commit-ova - na primer, spojite sitne popravke u jedan smislen commit, izmenite poruke, ili obrišete nepotrebne commit-e.

To radimo pomoću **\`git rebase -i <commit-id>\`** (opcija \`-i\` znači interaktivno).
Ova komanda otvara retro editor gde za svaki commit možete izabrati akciju:
*   \`pick\` - zadrži commit
*   \`reword\` - promeni samo poruku commit-a
*   \`squash\` - spoji ovaj commit sa prethodnim

**Tvoj zadatak:**
1. Pokrenite interaktivni rebase na granu \`master\` koristeći \`git rebase -i master\`.`,
    hint: "Nalaziš se na feature grani. Samo ukucaj:\n`git rebase -i master`",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Zajednički predak' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Commit na masteru' },
        C2: { id: 'C2', parentIds: ['C0'], message: 'Sitna izmena 1' },
        C3: { id: 'C3', parentIds: ['C2'], message: 'Sitna izmena 2' }
      },
      branches: { master: 'C1', feature: 'C3' },
      head: { type: 'branch', target: 'feature' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      hasRemote: false
    },
    validate: () => {
      return true;
    },
    expectedCommands: ["git rebase"]
  },
  {
    id: 17,
    title: "Brza popravka poslednjeg commit-a",
    category: "Napredne Komande",
    description: `### Brza popravka poslednjeg commit-a
Napravili ste commit, ali ste sekundu kasnije shvatili da ste zaboravili da dodate jedan fajl ili ste napravili slovnu grešku u poruci commit-a? Bez brige, nema potrebe da pravite novu "vremensku kapsulu" za tako sitnu izmenu.

Komanda **\`git commit --amend\`** vam omogućava da "otvorite" poslednji commit, dodate nove pripremljene fajlove u njega i izmenite njegovu poruku!

*Zlatno pravilo:* Koristite \`--amend\` samo za lokalne commit-e koje još niste poslali na udaljeni server!

**Tvoj zadatak:**
1. Imate pripremljen fajl \`readme.txt\`.
2. Prepravite poslednji commit dodavanjem tog fajla i promenite mu poruku u "Ispravljen inicijalni rad" koristeći \`git commit --amend -m "Ispravljen inicijalni rad"\`.`,
    hint: "Zadatak zahteva tačnu komandu:\n`git commit --amend -m \"Ispravljen inicijalni rad\"`",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni rad sa greškom' }
      },
      branches: { master: 'C0' },
      head: { type: 'branch', target: 'master' },
      index: { staged: ['readme.txt'], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      hasRemote: false
    },
    validate: (state: RepoState) => {
      const currentCommit = state.head.type === 'branch' ? state.branches[state.head.target] : state.head.target;
      const msg = state.commits[currentCommit]?.message || '';
      return msg.toLowerCase().trim() === 'ispravljen inicijalni rad' && state.index.staged.length === 0;
    },
    expectedCommands: ["git commit"]
  },
  {
    id: 18,
    title: "Spasavanje obrisanog koda sa git reflog",
    category: "Napredne Komande",
    description: `### Spasavanje obrisanog koda sa git reflog
U Git-u je izuzetno teško trajno izgubiti podatke kada su jednom commit-ovani. Čak i ako greškom obrišete granu ili uradite \`git reset --hard\` na pogrešan commit, Git potajno pamti svaku vašu akciju!

Komanda **\`git reflog\`** (reference log) prikazuje kompletan istorijski dnevnik pomeranja vašeg \`HEAD\` pokazivača.
Svaki put kada promenite granu, napravite commit, uradite reset ili rebase, ovde se upisuje zapis. Iz ovog dnevnika možete saznati SHA1 heš bilo kog commit-a koji ste naizgled trajno izgubili i vratiti se na njega sa \`git reset --hard\`!

**Tvoj zadatak:**
1. Otvorite istorijski dnevnik kretanja HEAD-a koristeći komandu \`git reflog\`.`,
    hint: "Samo ukucaj:\n`git reflog` da pogledaš dnevnik akcija.",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni commit' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Novi feature' }
      },
      branches: { master: 'C1' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      hasRemote: false
    },
    validate: () => {
      return true;
    },
    expectedCommands: ["git reflog"]
  },
  {
    id: 19,
    title: "Pronalaženje bagova binarnom pretragom",
    category: "Napredne Komande",
    description: `### Pronalaženje bagova binarnom pretragom
Imate ogroman projekat sa stotinama commit-ova i shvatili ste da neka funkcija više ne radi. Bag je uveden negde u prošlosti, ali nemate pojma u kom tačno commit-u.

Umesto da ručno proveravate svaki commit jedan po jedan, koristite **\`git bisect\`** koji koristi algoritam binarne pretrage da brzo i automatski locira "prvi loš commit" (first bad commit):
1.  \`git bisect start\` - Pokreće pretragu.
2.  \`git bisect bad\` - Označava trenutni commit kao neispravan.
3.  \`git bisect good <commit>\` - Označava neki stari commit u prošlosti za koji znate da je sigurno radio ispravno.
Git će vas automatski prebaciti na commit na polovini tog opsega. Vi testirate kod i javljate Git-u sa \`git bisect good\` ili \`git bisect bad\`. Ovaj proces se ponavlja dok ne pronađe tačan commit koji je uveo bag!

**Tvoj zadatak:**
1. Pokrenite proces pretrage sa \`git bisect start\`.
2. Označite trenutni commit kao loš sa \`git bisect bad\`.
3. Označite commit \`C0\` kao dobar sa \`git bisect good C0\`.`,
    hint: "Ukucaj redom:\n1. `git bisect start` da pokreneš pretragu.\n2. `git bisect bad` da označiš trenutni kao loš.\n3. `git bisect good C0` da označiš C0 kao ispravnu tačku.",
    initialState: {
      commits: {
        C0: { id: 'C0', parentIds: [], message: 'Inicijalni stabilni rad' },
        C1: { id: 'C1', parentIds: ['C0'], message: 'Uvedena greška' },
        C2: { id: 'C2', parentIds: ['C1'], message: 'Rad na dizajnu' },
        C3: { id: 'C3', parentIds: ['C2'], message: 'Trenutni neispravan rad' }
      },
      branches: { master: 'C3' },
      head: { type: 'branch', target: 'master' },
      index: { staged: [], deleted: [] },
      workingDirectory: {
        files: ['readme.txt'],
        modified: [],
        untracked: []
      },
      hasRemote: false
    },
    validate: () => {
      return true;
    },
    expectedCommands: ["git bisect start", "git bisect bad", "git bisect good c0"]
  }
];
