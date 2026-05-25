# 🌿 Luna Git: Windows XP Interaktivna Platforma za Učenje Git-a

Dobrodošli na **Luna Git** — interaktivnu, zabavnu i potpuno lokalizovanu platformu za učenje Git komandi u nostalgičnom stilu **Windows XP (Luna plava tema, Y2K retro estetika)**.

Ovaj projekat je kreiran u potpunosti na **srpskom jeziku (isključivo latinica)** sa ciljem da studentima i početnicima olakša razumevanje sistema za kontrolu verzija kroz gejmifikaciju, vizuelni graf i praktično kucanje komandi u simulatoru terminala.

---

## 🎨 Ključne Karakteristike

*   **Retro Windows XP (Luna Blue) interfejs:** Autentični Bliss desktop, taskbar, start meni, zvučni efekti i drag-and-drop prozori.
*   **In-Memory Git Emulator:** Potpuni emulator koji simulira komande: `init`, `status`, `add`, `commit`, `branch`, `checkout`, `switch`, `merge`, `rebase`, `cherry-pick`, `reset`, `revert`, `clone`, `fetch`, `push`, `pull`.
*   **Interaktivni SVG Git Graf:** Vizuelni prikaz stabla sa granama i `HEAD` pokazivačem koji se iscrtava u realnom vremenu uz prelepe zakrivljene konektore.
*   **Gejmifikovanih 19 nivoa:** Od osnovne inicijalizacije do naprednih operacija kao što su interaktivni rebase, reflog i git bisect.
*   **Web Audio API Zvučni efekti:** Real-time sinteza legendarnog XP Startup akorda, Error zujanja i Tada uspeh zvuka.
*   **Easter Egg:** Plavi ekran smrti (BSOD) dostupan u Start meniju!
*   **Solitaire kaskada čestitka:** Klasična WinXP Solitaire čestitka za uspešan završetak svih 19 nivoa!
*   **Local-first:** Progres se automatski čuva u vašem pretraživaču (`localStorage`).

---

## 📚 Struktura Nivoa (Edukativna Staza)

1.  **Nivo 1: Prvi koraci** — Inicijalizacija i prvi commit (`git init`, `git add`, `git commit`).
2.  **Nivo 2: Pripremna zona** — Status repozitorijuma i praćenje izmena (`git status`, `git add`).
3.  **Nivo 3: Poništavanje promena** — Poništavanje lokalnih promena (`git reset`, `git checkout --`).
4.  **Nivo 4: Kreiranje grana** — Uvod u grananje: Kreiranje i kretanje (`git branch`, `git checkout`, `git switch`).
5.  **Nivo 5: Spajanje grana** — Spajanje grana: Merge (`git merge`).
6.  **Nivo 6: Linearna istorija** — Linearna istorija: Rebase (`git rebase`).
7.  **Nivo 7: Odabir specifičnih izmena** — Odabir specifičnih izmena: Cherry-Pick (`git cherry-pick`).
8.  **Nivo 8: Udaljeni repozitorijumi** — Udaljeni repozitorijumi i kloniranje (`git clone`).
9.  **Nivo 9: Razmena promena** — Razmena promena: Fetch & Push (`git fetch`, `git push`).
10. **Nivo 10: Kompletna integracija** — Preuzimanje i spajanje: Git Pull (`git pull`).
11. **Nivo 11: Privremeno sklanjanje izmena** — Rad sa stekom (`git stash`).
12. **Nivo 12: Pregledanje izmena** — Poređenje verzija i koda (`git diff`).
13. **Nivo 13: Označavanje važnih trenutaka** — Kreiranje oznaka (`git tag`).
14. **Nivo 14: Kada se grane sukobe** — Rešavanje merge konflikata.
15. **Nivo 15: Povezivanje grana sa serverom** — Upstream grane i praćenje (`git push -u`).
16. **Nivo 16: Uređivanje istorije** — Interaktivno prepakivanje istorije (`git rebase -i`).
17. **Nivo 17: Brza popravka** — Izmena poslednjeg commit-a (`git commit --amend`).
18. **Nivo 18: Spasavanje obrisanog koda** — Dnevnik rada i oporavak (`git reflog`).
19. **Nivo 19: Pronalaženje bagova** — Binarna pretraga neispravnog koda (`git bisect`).

---

## 👩‍💻 Kako pokrenuti projekat lokalno

Platforma je izgrađena koristeći **React**, **TypeScript** i **Vite** bez ikakvog eksternog backend-a, što je čini idealnom za hostovanje na **GitHub Pages**.

### Zahtevi
*   [Node.js](https://nodejs.org/) (verzija 18 ili novija)

### Koraci za pokretanje:

1.  Klonirajte ovaj repozitorijum:
    ```bash
    git clone <url-ovog-repozitorijuma>
    cd git-ucenje
    ```

2.  Instalirajte zavisnosti:
    ```bash
    npm install
    ```

3.  Pokrenite lokalni razvojni server:
    ```bash
    npm run dev
    ```

4.  Otvorite adresu u pretraživaču (najčešće `http://localhost:5173`).

---

## 🎗️ Priznanja i Zasluge (Credits)

### 👨‍🏫 Prof. dr Igor Dejanović
Sav edukativni materijal, objašnjenja Git teorije, komandi i staza učenja preuzeti su iz zvaničnih slajdova i predavanja profesora **dr Igora Dejanovića** sa Fakulteta tehničkih nauka u Novom Sadu (kurs *Tehnički alati / Git*).
Izvorni materijali i detaljna literatura mogu se naći na profesorovom zvaničnom sajtu:
🔗 [igordejanovic.net/courses/tech/git/](https://igordejanovic.net/courses/tech/git/)

### 💡 Learn Git Branching
Vizuelni koncept učenja Git-a kroz interaktivno stablo commit-a inspirisan je izuzetnim i popularnim projektom **Learn Git Branching**:
🔗 [learngitbranching.js.org](https://learngitbranching.js.org/)

---

*Napravljeno s ljubavlju prema retro računarstvu i Y2K estetici.* 🌿
