# 🕹️ Mathe Games: Terme & Gleichungen

Selbstlern-Spiel für **Klasse 8** im Arcade-Look – **für das Handy gebaut**. Die Lernenden arbeiten eigenständig: Professor Eule 🦉 erklärt, danach wird geübt, Schritt für Schritt gerechnet und gegen Bosse gekämpft.

Die 7 Welten folgen dem Kapitel **„Terme und Gleichungen“**:

| Welt | Thema | Boss |
|---|---|---|
| 1 Klammer-Lagune | Ausmultiplizieren & Ausklammern | 🐙 Klammer-Krake |
| 2 Multipli-Mine | Summen multiplizieren | 👾 Multipli-Monster |
| 3 Binomi-Burg | Binomische Formeln, z. B. (4 − x)² | 🐉 Binomi-Drache |
| 4 Faktor-Friedhof | Faktorisieren mit binomischen Formeln | 👻 Faktor-Phantom |
| 5 Gleichungs-Gebirge | Gleichungen mit Klammern | 🗿 Gleichungs-Golem |
| 6 Bruch-Wüste | Bruchgleichungen & Verhältnisgleichungen | 🦂 Bruch-Bestie |
| 7 Formel-Fabrik | Formeln umstellen | 🦊 Formel-Fuchs |
| Finale: Rückspiegel-Turm | alles gemischt | 🤖 Mega-Robo |

## Spielmodi

- **📖 Lern-Story** – Erklärung in kleinen Seiten mit Bildern (Pfeile, Rechteck-Modell, Quadrat-Puzzle) und Mini-Check.
- **🎯 Training** – 10 Aufgaben, Tipps, „📒 Merke“, 2. Versuch, Lösungsweg. Bis zu 3 Sterne.
- **🪜 Schritt für Schritt** – Gleichungen, Bruchgleichungen und Formeln in Einzelschritten mit Rechenweg-Tafel.
- **⚡ Blitz-Runde** – 60 Sekunden.
- **⚔️ Boss-Kampf** – jede richtige Antwort ist ein Treffer, 3 Herzen.
- **📒 Spickzettel** – alle Regeln auf einer Seite (druckbar).

Niveaus: **★ G · ★★ M · ★★★ E**. Terme werden mit **Lückenkästchen** eingegeben (z. B. □x² □x □), typische Fehler (fehlendes 2ab, Vorzeichen, Nenner nicht multipliziert …) werden erkannt und erklärt.

## Benutzen

- Online über GitHub Pages: `https://<benutzername>.github.io/mathe-games-terme-und-gleichungen/`
- Am Handy: im Browser öffnen → „Zum Home-Bildschirm“ – dann startet es wie eine App.
- Offline: `index.html` öffnen.

## Technik

Reines HTML/CSS/JavaScript, keine Abhängigkeiten, kein Server, keine Cookies. Fortschritt nur im `localStorage` des Geräts.

```
index.html · css/style.css · assets/ (eigene Pixel-Schrift, Icons)
js/util.js     Zahlen, Brüche, Formatierung
js/core.js     Speicher, Sound, Abzeichen, Konfetti
js/worlds.js   Die 7 Welten: Aufgaben (G/M/E), Lern-Storys, Merksätze
js/input.js    Eingabe (Zahl, Auswahl, Lückenterm, Schritt für Schritt)
js/games.js    Spielmodi
js/app.js      Bildschirme
tools/check.js Automatischer Test aller Aufgaben (node tools/check.js)
```
