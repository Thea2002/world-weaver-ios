import type { Skill } from "./skills";

export type SkillOption = {
  id: string;
  label: string;
  choices: string[];
};

const SIZE = {
  id: "size",
  label: "Siedlungstyp",
  choices: ["Thorp", "Hamlet", "Village", "Town", "Small City", "Large City"],
};
const REGION = {
  id: "region",
  label: "Region / Umgebung",
  choices: [
    "Coastal",
    "Forest",
    "Mountain",
    "Plains / Farmland",
    "Desert",
    "Swamp",
    "River Crossing",
    "Frontier / Border",
    "Underdark",
    "Arctic",
  ],
};
const PROSPERITY = {
  id: "prosperity",
  label: "Wohlstand",
  choices: ["Impoverished", "Poor", "Modest", "Comfortable", "Wealthy"],
};
const MOOD = {
  id: "mood",
  label: "Thema / Stimmung",
  choices: [
    "Peaceful",
    "Prosperous",
    "Struggling",
    "Mysterious",
    "Corrupt",
    "Religious",
    "Militarized",
    "Haunted",
    "Bustling Trade Hub",
    "Isolated",
    "Under Threat",
  ],
};
const POPULATION = {
  id: "population",
  label: "Dominante Bevölkerung",
  choices: [
    "Mostly Human",
    "Mixed Races",
    "Dwarven",
    "Elven",
    "Halfling",
    "Gnomish",
    "Half-Orc",
    "Tiefling",
    "Frontier Melting Pot",
  ],
};
const TONE = {
  id: "tone",
  label: "Ton",
  choices: ["Heroic", "Grimdark", "Whimsical", "Mythic", "Gritty Realism", "Cosmic Horror"],
};
const GENRE = {
  id: "genre",
  label: "Genre",
  choices: ["High Fantasy", "Dark Fantasy", "Sword & Sorcery", "Steampunk", "Science Fantasy", "Historical"],
};
const CR = {
  id: "cr",
  label: "Herausforderung",
  choices: ["CR 0–2", "CR 3–5", "CR 6–10", "CR 11–16", "CR 17+"],
};
const LEVEL = {
  id: "level",
  label: "Gruppenstufe",
  choices: ["Stufe 1–4", "Stufe 5–10", "Stufe 11–16", "Stufe 17–20"],
};
const RARITY = {
  id: "rarity",
  label: "Seltenheit",
  choices: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"],
};
const ROLE = {
  id: "role",
  label: "Rolle",
  choices: ["Verbündeter", "Antagonist", "Händler", "Auftraggeber", "Rivale", "Mentor", "Wildcard"],
};
const LENGTH = { id: "length", label: "Umfang", choices: ["Kompakt", "Standard", "Ausführlich"] };

/** Option groups per skill id. Every group also gets an implicit "Beliebig". */
export const SKILL_OPTIONS: Record<string, SkillOption[]> = {
  settlement: [SIZE, REGION, PROSPERITY, MOOD, POPULATION, LENGTH],
  region: [REGION, MOOD, GENRE, POPULATION, LENGTH],
  tavern: [
    { id: "class", label: "Klientel", choices: ["Spelunke", "Bürgerlich", "Luxus", "Schmugglertreff", "Gildenhaus"] },
    REGION,
    MOOD,
    LENGTH,
  ],
  shop: [
    {
      id: "type",
      label: "Ladentyp",
      choices: ["Waffenschmied", "Alchemist", "Magier-Laden", "Krämer", "Schwarzmarkt", "Stallmeister"],
    },
    PROSPERITY,
    MOOD,
    LENGTH,
  ],
  building: [
    {
      id: "type",
      label: "Gebäudetyp",
      choices: ["Anwesen", "Tempel", "Wachturm", "Gildenhalle", "Ruine", "Werkstatt"],
    },
    { id: "condition", label: "Zustand", choices: ["Neu", "Gepflegt", "Verfallen", "Ruine", "Verflucht"] },
    MOOD,
    LENGTH,
  ],
  dungeon: [
    { id: "type", label: "Dungeon-Typ", choices: ["Grabmal", "Höhlensystem", "Festung", "Tempel", "Mine", "Labor"] },
    LEVEL,
    MOOD,
    { id: "rooms", label: "Räume", choices: ["3–5", "6–10", "11–20"] },
  ],
  character: [
    GENRE,
    LEVEL,
    { id: "class", label: "Klasse/Archetyp", choices: ["Kämpfer", "Magier", "Schurke", "Kleriker", "Waldläufer", "Barde", "Hexenmeister"] },
    POPULATION,
    TONE,
  ],
  npc: [
    ROLE,
    POPULATION,
    { id: "attitude", label: "Gesinnung", choices: ["Freundlich", "Neutral", "Misstrauisch", "Feindlich"] },
    TONE,
    LENGTH,
  ],
  monster: [
    CR,
    {
      id: "type",
      label: "Kreaturentyp",
      choices: ["Bestie", "Untot", "Aberration", "Konstrukt", "Elementar", "Drache", "Unhold"],
    },
    REGION,
    TONE,
  ],
  species: [GENRE, REGION, TONE, LENGTH],
  class: [GENRE, TONE, { id: "focus", label: "Fokus", choices: ["Nahkampf", "Fernkampf", "Magie", "Support", "Hybrid"] }],
  quest: [
    LEVEL,
    { id: "type", label: "Quest-Typ", choices: ["Investigation", "Rettung", "Eskorte", "Heist", "Jagd", "Intrige", "Dungeon Crawl"] },
    MOOD,
    LENGTH,
  ],
  faction: [
    { id: "type", label: "Typ", choices: ["Gilde", "Kult", "Adelshaus", "Söldner", "Diebesbande", "Orden"] },
    { id: "reach", label: "Einfluss", choices: ["Lokal", "Regional", "National", "Kontinental"] },
    MOOD,
    LENGTH,
  ],
  pantheon: [
    { id: "domain", label: "Domäne", choices: ["Licht", "Tod", "Natur", "Krieg", "Wissen", "Trickerei", "Meer", "Sturm"] },
    TONE,
    LENGTH,
  ],
  hazard: [LEVEL, REGION, { id: "type", label: "Typ", choices: ["Falle", "Umweltgefahr", "Magische Anomalie", "Krankheit"] }],
  puzzle: [
    { id: "type", label: "Rätseltyp", choices: ["Logik", "Wortspiel", "Mechanisch", "Magisch", "Physisch"] },
    { id: "difficulty", label: "Schwierigkeit", choices: ["Leicht", "Mittel", "Schwer", "Brutal"] },
  ],
  "magic-item": [RARITY, { id: "slot", label: "Kategorie", choices: ["Waffe", "Rüstung", "Wundersam", "Trank", "Schriftrolle", "Ring"] }, TONE],
  spellbook: [RARITY, { id: "school", label: "Schule", choices: ["Beschwörung", "Nekromantie", "Illusion", "Evokation", "Verzauberung", "Verwandlung"] }, TONE],
  world: [GENRE, TONE, { id: "magic", label: "Magielevel", choices: ["Keine Magie", "Niedrig", "Mittel", "Hoch", "Allgegenwärtig"] }, LENGTH],
  "world-codex": [GENRE, TONE, LENGTH],
  "lore-workshop": [GENRE, TONE, LENGTH],
  names: [
    { id: "culture", label: "Kultur", choices: ["Nordisch", "Elfisch", "Zwergisch", "Orkisch", "Arabisch inspiriert", "Ostasiatisch inspiriert", "Römisch inspiriert"] },
    GENRE,
  ],
  "session-prep": [LEVEL, MOOD, LENGTH],
  quest_default: [],
  dashboard: [LENGTH],
  discord: [{ id: "style", label: "Stil", choices: ["Ankündigung", "Statblock", "Recap", "Lore-Drop"] }],
};

export const ANY = "Beliebig";

/** Multi-select: every option id maps to a list of chosen values. */
export type Choices = Record<string, string[]>;

export function optionsFor(skill: Skill): SkillOption[] {
  return SKILL_OPTIONS[skill.id] ?? [GENRE, TONE, LENGTH];
}

export function randomChoices(options: SkillOption[]): Choices {
  const out: Choices = {};
  for (const o of options) {
    const pick = o.choices[Math.floor(Math.random() * o.choices.length)];
    if (pick) out[o.id] = [pick];
  }
  return out;
}

const SHOP_SKILLS = new Set(["shop", "tavern", "magic-item", "spellbook", "building", "settlement"]);

/** Shops, taverns and item vendors always get an offer table with emoji-tagged goods. */
function offerTableRule(skill: Skill) {
  if (!SHOP_SKILLS.has(skill.id)) return null;
  return [
    "Wenn Waren, Dienstleistungen, Speisen, Zaubertränke, Waffen, Rüstung, Kleidung oder Bücher vorkommen, gib IMMER eine Angebots-Tabelle in genau diesem Format aus (Markdown-Pipe-Tabelle, 4 Spalten, jede Ware mit passendem Emoji):",
    "| Angebot | Wirkung / Verwendung | Kurze Beschreibung | Preis 🪙 |\n| --- | --- | --- | --- |\n| Nachtschattenwurz 🌿 | Wird für Schmerzmittel und Räucherwerk genutzt | Wächst nur an feuchten Nordhängen der Region | 4 sp |\n| Bruchstahl-Dolch 🗡️ | Leichte Waffe, 1d4 Stich | Umgeschmiedet aus Schlachtfeld-Resten | 2 gp |",
    "6–12 Zeilen, Preise mit Währungseinheit passend zum Setting, keine leeren Zellen.",
  ].join("\n\n");
}

/** Builds the user message: free input + all chosen options (multi-select aware). */
export function buildUserMessage(skill: Skill, input: string, selected: Choices, settings: string[] = []) {
  const opts = optionsFor(skill)
    .map((o) => {
      const v = (selected[o.id] ?? []).filter((x) => x && x !== ANY);
      if (!v.length) return null;
      return v.length === 1 ? `- ${o.label}: ${v[0]}` : `- ${o.label}: ${v.join(" + ")} (kombiniere alle genannten Aspekte)`;
    })
    .filter(Boolean);

  const lines = [
    input.trim() ? `Idee / Titel: ${input.trim()}` : "Idee / Titel: Überrasche mich (frei erfinden).",
    settings.length ? `Gewähltes Setting: ${settings.join(", ")}` : null,
    opts.length
      ? `Vorgaben (müssen exakt eingehalten werden):\n${opts.join("\n")}`
      : "Keine weiteren Vorgaben — wähle passende Werte selbst.",
    "Wenn eine Vorgabe fehlt, wähle eine dazu passende Option und bleib in sich konsistent.",
  ].filter(Boolean) as string[];
  return lines.join("\n\n");
}

export function buildSystemPrompt(skill: Skill, settingGuide = "") {
  return [
    skill.prompt,
    settingGuide
      ? `Kanon-Vorgabe — alles (Orte, Tavernen, NSCs, Gegenstände, Götter, Währung, Namen) muss im gewählten Setting tatsächlich vorkommen können; nutze existierende Eigennamen des Settings, wo es passt:\n${settingGuide}`
      : null,
    "Du schreibst direkt spielfertige Inhalte für eine Spielleitung: konkrete Namen, Zahlen, Preise, Gerüchte, Hooks und Geheimnisse — keine Platzhalter, keine Meta-Kommentare, keine Rückfragen.",
    "Nutze passende Emojis: im Titel (z. B. `# Kräuterladen 🌿`), bei Abschnitts-Headings und bei einzelnen Waren, NSCs oder Orten. Sparsam und thematisch, nie dekorativer Emoji-Spam.",
    offerTableRule(skill),
    "Beginne mit einem YAML-Frontmatter-Block (`---`) mit den Feldern type, name, setting, tags sowie den wichtigsten Eigenschaften (z. B. Region, Wohlstand, Fraktion) — diese werden als Datenbank-Properties übernommen.",
    "Antworte ausschließlich in Markdown (keine Code-Fences um das gesamte Dokument). Halte dich an diese Struktur und fülle jeden Abschnitt aus:",
    skill.template("[Titel]"),
    "Verlinke verwandte Einträge als [[Wikilinks]]. Für reine Datenlisten sind ```csv-Blöcke mit Semikolon-Trennung erlaubt, für Angebote/Preise nutze die Pipe-Tabelle.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
