# Fantasy Scribers POV

# 📱 Native iOS Prompt: "Mythic Journal" (SwiftUI / Claude)

Du agierst als Senior iOS Engineer und UI/UX Designer. Konzipiere und erstelle eine native iOS-App in Swift, die als lokales "Second Brain" dient. Sie kombiniert Obsidian/Logseq (Graph, Links), Notion (Datenbanken), Mem (AI-Properties) und TTRPG-Worldbuilding.

## 🛠 Tech-Stack & Architektur

- **Sprache:** Swift 5.9+ (iOS 17+)

- **UI:** SwiftUI (Native iOS UI, optimiert für iPhone)

- **Data & Local Storage:** SwiftData oder CoreData (für Indizierung & Graph) + lokales Dateisystem (`.md` und `.csv` Dateien).

- **Renderer:** Custom `TextEngine` / `WebKit`-Kombination für vollen Inline-CSS- und SVG-Support im Lesemodus.

- **Architektur:** MVVM mit modularer Service-Schicht.

---

## ✨ Kern-Features

### 1. Editor (Source vs. Preview)

- **Schreibmodus:** Reines Markdown mit Syntax-Highlighting.

- **Lesemodus (Preview):** Rendert Markdown inkl. Inline-CSS (`<span style="...">`), SVGs, `[[Wikilinks]]` und `![[Embeds]]`.

### 2. Graph & KI-Properties

- **Graph-Ansicht:** Interaktive Node-Visualisierung aller Notizen via Canvas/SpriteKit.

- **Auto-Properties:** Automatische Schlüsselwort-Extraktion als Metadaten.

### 3. Datenbanken & Verknüpfungen

- **CSV-Renderer:** Wandelt CSV-Dateien in sortierbare SwiftUI-Tabellen um.

- **Bi-Directional Graph Links:** Einzelne Zeilen oder Notizen können gegenseitig im Graph verknüpft werden.

### 4. TTRPG & Worldbuilding (Faerûn / Eberron)

- Templates für Charaktere, Lore, Orte und Fraktionen.

- Session-Logbook und NPC-Beziehungsnetzwerk.

### 5. Themes & Ulysses-Support

- Presets: Nord, Dracula, Gruvbox, Solarized.

- Einstellungsmenü mit Import-Feld für rohe JSON-, CSS- oder `.uss`-Themes (z. B. von GitHub), um die App-Farben dynamisch anzupassen.

---

## 🚀 Phase 1 Execution Plan

Erstelle als Erstes Phase 1:

1. SwiftUI Grundstruktur mit fixer Bottom Tab Bar (`[Journal]`, `[Graph]`, `[World]`, `[Suche]`, `[Settings]`).

2. Einen Markdown-Editor mit Toggle-Button zwischen **Source-Mode** und **Preview-Mode**.

3. Den Preview-Renderer mit voller Unterstützung für **Inline-CSS-Farben** und **SVGs**.

4. Lokales Dateisystem-Handling zum Erstellen/Speichern von `.md`-Dateien.

Starte direkt mit Phase 1!

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c7662ea0-f551-4fff-81f3-ab93a3efce05).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
