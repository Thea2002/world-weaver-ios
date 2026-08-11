import type { NoteKind } from "@/lib/vault";

export type Skill = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  folder: string;
  kind: NoteKind;
  /** Frontmatter/type tag used in the generated note. */
  tag?: string;
  /** System prompt for agents / AI tooling. */
  prompt: string;
  /** Markdown scaffold inserted into a new note. */
  template: (input: string) => string;
};

const fm = (type: string, name: string, tags: string) =>
  `---\ntype: ${type}\nname: "${name}"\ntags: [${tags}]\n---\n\n`;

export const SKILLS: Skill[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Generiert eine interaktive Dashboard-Übersicht",
    emoji: "🎛️",
    folder: "Skills",
    kind: "note",
    prompt:
      "Du bist die Benutzeroberfläche des Mythic Journals. Gib ein übersichtliches Dashboard aus. Nutze Callouts (> [!info]), Tags und Markdown-Links.",
    template: (i) => `# 🎛️ User Dashboard

> [!info] Quick Stats & Active Campaign
> Kampagne: ${i}

## 🚀 Quick Access
- [[05_Character_Generator|👤 Charakter erstellen]]
- [[06_NPC_Generator|🎭 NSC erstellen]]
- [[12_Region_Generator|🗺️ Region erstellen]]

## 📜 Recent Creations
- Letzte Änderungen hier eintragen…
`,
  },
  {
    id: "session-prep",
    name: "Session Prep",
    description: "Strukturierte Spielrunden-Vorbereitung",
    emoji: "📋",
    folder: "Journal",
    kind: "session",
    prompt:
      "Du bist das Session Prep Tool. Erstelle ein strukturiertes Vorbereitungs-Dokument für die nächste TTRPG-Spielrunde auf Deutsch mit Emojis.",
    template: (i) => `# 📋 Session Prep — ${i}

## 🎯 Strong Start

## 👥 Key NPCs
- [[]] — Rolle & Motivation

## ⚔️ Potential Encounters
1. Kampf:
2. Rätsel:
3. Social:

## 🏰 Fantastic Locations

## 🕵️ Secrets & Clues
1.
2.
3.

## 💎 Rewards & Loot
`,
  },
  {
    id: "world-codex",
    name: "World Codex",
    description: "Erstellt ein universelles Codex-Kapitel",
    emoji: "📚",
    folder: "World/Lore",
    kind: "lore",
    tag: "codex",
    prompt:
      "Du bist der World Codex Generator. Erstelle ein universelles Codex-Kapitel für ein Weltenbuch auf Deutsch.",
    template: (i) => `${fm("codex", i, "world")}# ${i}

> [!info|statblock] Kategorie & Status

## 📜 Overview

## 📖 Deep Lore

## 🔗 Key Associations
- [[]]

## 🕵️ Game Master Secrets
`,
  },
  {
    id: "discord",
    name: "Discord Integration",
    description: "Formatiert Text für Discord Embeds",
    emoji: "💬",
    folder: "Skills",
    kind: "note",
    prompt:
      "Du bist der Discord Bot Assistant. Wandle den Input des Nutzers in eine prägnante, formatierte Discord-Embed-Nachricht mit Discord-Markdown (>>>, Codeblöcken, Emojis) um.",
    template: (i) => `>>> 💬 **${i}**

**Kategorie:**

**Zusammenfassung:**

\`Stat-Block / Quick Info:\`
`,
  },
  {
    id: "character",
    name: "Character Generator",
    description: "Erstellt Spielercharaktere (PCs)",
    emoji: "👤",
    folder: "World/Charaktere",
    kind: "character",
    tag: "pc",
    prompt: "Du bist der Character Generator. Erstelle einen detaillierten Spielercharakter (PC) auf Deutsch.",
    template: (i) => `${fm("character", i, "pc")}# 👤 ${i}

> "[Zitat des Charakters]"

## 🎭 Appearance & Personality

## 📜 Backstory

## ⚔️ Stats & Abilities

## 🎒 Equipment & Relics

## 🎨 Image Generation Prompt
(English AI image prompt)
`,
  },
  {
    id: "npc",
    name: "NPC Generator",
    description: "Erstellt Nicht-Spieler-Charaktere",
    emoji: "🎭",
    folder: "World/Charaktere",
    kind: "character",
    tag: "npc",
    prompt: "Du bist der NPC Generator. Erstelle einen einprägsamen Nicht-Spieler-Charakter auf Deutsch.",
    template: (i) => `${fm("npc", i, "npc")}# 🎭 ${i}

> [!info|statblock] Rolle & Gesinnung

## 👁️ First Impression

## 🎯 Motivation & Secret

## 🪝 Plot Hooks

## 📊 Statblock Mini
`,
  },
  {
    id: "monster",
    name: "Monster Generator",
    description: "Erstellt Monster und Bestien",
    emoji: "👹",
    folder: "World/Bestiarium",
    kind: "lore",
    tag: "monster",
    prompt: "Du bist der Monster Generator. Erstelle eine gefährliche Kreatur auf Deutsch.",
    template: (i) => `${fm("monster", i, "monster")}# 👹 ${i}

> [!danger|statblock] Herausforderungsgrad (CR) & Typ

## ⚔️ Tactics & Behavior

## 🌿 Ecology & Habitat

## ⚡ Abilities & Actions

## 🦴 Loot / Carcass Harvesting
`,
  },
  {
    id: "species",
    name: "Species Generator",
    description: "Erstellt Spezies und Völker",
    emoji: "🧬",
    folder: "World/Lore",
    kind: "lore",
    tag: "species",
    prompt: "Du bist der Species Generator. Erschaffe eine einzigartige Spezies auf Deutsch.",
    template: (i) => `${fm("species", i, "species")}# 🧬 ${i}

## 🧬 Physiology

## 🏛️ Culture & Society

## 📊 Species Traits

## 🤝 Relations
`,
  },
  {
    id: "class",
    name: "Class Generator",
    description: "Erstellt TTRPG Klassen und Subklassen",
    emoji: "⚔️",
    folder: "World/Regeln",
    kind: "lore",
    tag: "class",
    prompt: "Du bist der Class Generator. Erstelle eine Klasse oder Subklasse auf Deutsch.",
    template: (i) => `${fm("class", i, "class")}# ⚔️ ${i}

## 🎯 Core Concept

## 📈 Class Features
| Stufe | Fähigkeit |
| --- | --- |
| 1 |  |

## 📜 Subclasses / Archetypes
1.
2.
`,
  },
  {
    id: "names",
    name: "Name Generator",
    description: "Generiert Namenstabellen",
    emoji: "🏷️",
    folder: "Skills",
    kind: "note",
    prompt:
      "Du bist der Name Generator. Generiere eine Liste von 20 thematisch passenden Namen basierend auf Kultur/Genre.",
    template: (i) => `# 🏷️ Name Generator — ${i}

- **🧑 Männliche Namen:**
- **👩 Weibliche Namen:**
- **🧑‍🤝‍🧑 Geschlechtsneutrale Namen:**
- **🛡️ Nachnamen / Sippennamen:**
- **👑 Beinamen / Titel:**
`,
  },
  {
    id: "settlement",
    name: "Settlement Generator",
    description: "Erstellt Siedlungen und Städte",
    emoji: "🏘️",
    folder: "World/Orte",
    kind: "location",
    tag: "settlement",
    prompt: "Du bist der Settlement Generator. Erstelle eine lebendige Siedlung auf Deutsch.",
    template: (i) => `${fm("settlement", i, "settlement")}# 🏘️ ${i}

> [!info|statblock] Größe, Einwohnerzahl, Herrschaftsform

## 🌫️ Atmosphere & Sounds

## 🏛️ Districts

## 📍 Key Locations

## 🗡️ Local Factions
`,
  },
  {
    id: "region",
    name: "Region Generator",
    description: "Erstellt Regionen mit JSON Plot Hooks",
    emoji: "🗺️",
    folder: "World/Orte",
    kind: "location",
    tag: "region",
    prompt: "Du bist der Region Generator. Erstelle eine komplexe Region auf Deutsch.",
    template: (i) => `${fm("region", i, "region")}# 🗺️ ${i}

> [!info|statblock] Kurze Beschreibung

## 🪝 Plot Hooks
- {"type": "Investigation", "title": "", "description": "", "startingPoint": "", "suggestedReward": ""}

## 🔗 Connections
- [[]]

## 📏 Scale & 💰 Economy
\`\`\`csv Wirtschaft
Aspekt;Wert
Scale;
Wealth Level;
Trade Hubs;
Trade Goods;
\`\`\`

## 📜 History
| Era | Event | Beschreibung |
| --- | --- | --- |
|  |  |  |

## 🕵️ Secrets
- Impact / Summary / DiscoveryHint

## ⚠️ Threats & 🏛️ Cultures & 🗺️ Geography & 🏛️ Governance
`,
  },
  {
    id: "tavern",
    name: "Tavern Generator",
    description: "Erstellt Tavernen und Herbergen",
    emoji: "🍺",
    folder: "World/Orte",
    kind: "location",
    tag: "tavern",
    prompt: "Du bist der Tavern Generator. Erstelle ein Gasthaus voller Leben auf Deutsch.",
    template: (i) => `${fm("tavern", i, "building, tavern")}# 🍺 ${i}

## 📜 Menu & Prices
\`\`\`csv Speisekarte
Posten;Kategorie;Preis
;;
\`\`\`

## 👥 Patrons

## 🗣️ Rumors & Hooks

## 🎲 Entertainment
`,
  },
  {
    id: "shop",
    name: "Shop Generator",
    description: "Erstellt Läden und Händler",
    emoji: "🛒",
    folder: "World/Orte",
    kind: "location",
    tag: "shop",
    prompt: "Du bist der Shop Generator. Erstelle ein Geschäft für Abenteurer auf Deutsch.",
    template: (i) => `${fm("shop", i, "building, shop")}# 🛒 ${i}

## 👤 Shopkeeper

## ⚔️ Inventory
\`\`\`csv Inventar
Gegenstand;Vorrat;Preis
;;
\`\`\`

## 🔮 Special Service
`,
  },
  {
    id: "building",
    name: "Building Generator",
    description: "Erstellt Gebäude und Anwesen",
    emoji: "🏛️",
    folder: "World/Orte",
    kind: "location",
    tag: "building",
    prompt: "Du bist der Building Generator. Erstelle ein Gebäude oder Anwesen auf Deutsch.",
    template: (i) => `${fm("building", i, "building")}# 🏛️ ${i}

> [!info|statblock] Gebäudename & Größe

## 🗣️ Rumors & 🕵️ Secret

## 📜 Description & 🌫️ Atmosphere & 🏛️ Architectural Style

## 📍 Notable Features & 🏛️ Condition & 👑 Owner & 👥 Notable NPCs

## 📜 Additional Sections
Layout, Sicherheit, Geheimwege.
`,
  },
  {
    id: "dungeon",
    name: "Dungeon Generator",
    description: "Erstellt Dungeons und Gewölbe",
    emoji: "🗝️",
    folder: "World/Orte",
    kind: "location",
    tag: "dungeon",
    prompt: "Du bist der Dungeon Generator. Erstelle einen gefährlichen Dungeon-Komplex auf Deutsch.",
    template: (i) => `${fm("dungeon", i, "dungeon")}# 🗝️ ${i}

> [!danger|statblock] Erbauer, Ursprünglicher Zweck, Bewohner

## 🎲 Wandering Monsters
\`\`\`csv Zufallsbegegnungen
Würfel;Begegnung;Notiz
1;;
\`\`\`

## 🚪 Key Rooms
1. Eingang —
2. Fallenraum —
3. Schatzkammer —
`,
  },
  {
    id: "world",
    name: "World Generator",
    description: "Generiert Weltenbau-Fundamente",
    emoji: "🌍",
    folder: "World",
    kind: "lore",
    prompt: "Du bist der World Generator. Generiere ein Weltenkonzept auf Deutsch.",
    template: (i) => `# 🌍 ${i}

- **📜 Description / Concept:**
- **🎯 Theme & Genre:** Theme (0/1000) & Genre
- **📍 Details:** Location, Societies & Cultures, Illustration, Environment, Resources, Geography, History, Population, Political Systems
- **🔮 Additional Details:** Magic System, Religious & Belief System
`,
  },
  {
    id: "faction",
    name: "Faction Generator",
    description: "Erstellt Fraktionen und Gilden",
    emoji: "🚩",
    folder: "World/Fraktionen",
    kind: "faction",
    tag: "faction",
    prompt: "Du bist der Faction Generator. Erstelle eine einflussreiche Organisation auf Deutsch.",
    template: (i) => `${fm("faction", i, "faction")}# 🚩 ${i}

## 🎯 Goals & Ideology

## 💰 Assets & Influence

## 👑 Key Figures
- [[]]

## 🤝 Allies & Enemies
`,
  },
  {
    id: "pantheon",
    name: "Pantheon Generator",
    description: "Erstellt Gottheiten und Religionen",
    emoji: "⚡",
    folder: "World/Lore",
    kind: "lore",
    tag: "pantheon",
    prompt: "Du bist der Pantheon Generator. Erstelle eine Gottheit oder Religion auf Deutsch.",
    template: (i) => `${fm("god", i, "pantheon")}# ⚡ ${i}

## 🔮 Domains & Alignment

## 🛐 Holy Symbols & Clergy

## 📜 Myths & Miracles
`,
  },
  {
    id: "quest",
    name: "Quest Generator",
    description: "Erstellt Quests und Aufträge",
    emoji: "📜",
    folder: "Journal",
    kind: "session",
    tag: "quest",
    prompt: "Du bist der Quest Generator. Erstelle eine vielschichtige Quest auf Deutsch.",
    template: (i) => `${fm("quest", i, "quest")}# 📜 ${i}

## 👤 Quest Giver

## 🎯 Objectives
- Haupt:
- Optional:

## 🌀 Complications / Twists

## 💎 Rewards
`,
  },
  {
    id: "hazard",
    name: "Hazard Generator",
    description: "Erstellt Umweltgefahren und Fallen",
    emoji: "⚠️",
    folder: "World/Regeln",
    kind: "lore",
    tag: "hazard",
    prompt: "Du bist der Hazard Generator. Erstelle eine Gefahr oder Falle auf Deutsch.",
    template: (i) => `${fm("hazard", i, "hazard")}# ⚠️ ${i}

## ⚡ Trigger

## 💥 Effect & Damage

## 🛠️ Countermeasures
`,
  },
  {
    id: "puzzle",
    name: "Puzzle Generator",
    description: "Erstellt Rätsel und Mechanismen",
    emoji: "🧩",
    folder: "World/Regeln",
    kind: "lore",
    tag: "puzzle",
    prompt: "Du bist der Puzzle Generator. Erstelle ein kreatives Rätsel auf Deutsch.",
    template: (i) => `${fm("puzzle", i, "puzzle")}# 🧩 ${i}

## 👁️ The Setup

## 🔍 The Clues

## 🗝️ The Solution

## 💥 Fail State / Punishment
`,
  },
  {
    id: "magic-item",
    name: "Magic Item Generator",
    description: "Erstellt magische Gegenstände",
    emoji: "🪄",
    folder: "World/Items",
    kind: "lore",
    tag: "item",
    prompt: "Du bist der Magic Item Generator. Erstelle ein magisches Item auf Deutsch.",
    template: (i) => `# 🪄 ${i}

- **Name**: ${i}
- **Appearance**:
- **Abilities**: 1. · 2. · 3.
- **Image Generation Prompt**: (English prompt for AI art tools)
`,
  },
  {
    id: "spellbook",
    name: "Spellbook Generator",
    description: "Erstellt Zauberbücher",
    emoji: "📖",
    folder: "World/Items",
    kind: "lore",
    tag: "magic",
    prompt: "Du bist der Spellbook Generator. Erstelle ein Zauberbuch mit Historie und Sprüchen auf Deutsch.",
    template: (i) => `${fm("spellbook", i, "magic")}# 📖 ${i}

## 📜 Cover & Condition

## 🧙‍♂️ Former Owner

## 🪄 Contained Spells
\`\`\`csv Zauber
Zauber;Grad;Schule
;;
\`\`\`

## 🔮 Arcane Quirks
`,
  },
  {
    id: "lore-workshop",
    name: "Fantasy Lore Workshop",
    description: "Vertieft vage Weltideen zu tiefem Lore",
    emoji: "🧪",
    folder: "World/Lore",
    kind: "lore",
    prompt:
      "Du bist der Fantasy Lore Workshop. Nimm eine vage Idee auf und schmiede daraus ein tiefgründiges Lore-Segment auf Deutsch.",
    template: (i) => `# 🧪 ${i}

- **📜 Forgotten Truths:**
- **🏛️ Cultural Impact:**
- **🔮 Artifacts & Echoes:**
`,
  },
];

/** Full system prompt with the user input interpolated — for agents/AI tooling. */
export function systemPrompt(skill: Skill, input: string) {
  return `${skill.prompt}\n\nOutput-Format:\n${skill.template("[Titel]")}\n---\n\nUser Input:\n${input}`;
}
