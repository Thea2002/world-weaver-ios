import { settingGuides } from "./lore-settings";
import type { Note } from "./vault";

const SETTING_KEY = "mythic:settings-selection";

export type Aspect = { id: string; label: string; instruction: string };

export const ASPECTS: Aspect[] = [
  {
    id: "full",
    label: "🏘️ Ort komplett ausbauen",
    instruction:
      "Baue diesen Ort vollständig aus: Überblick zum Vorlesen, Struktur (Regierung, Wirtschaft, Verteidigung), 5–8 bemerkenswerte Gebäude, 3–5 Shops mit Angebots-Tabelle, 2 Tavernen mit Speisekarte, 6–10 NSCs mit Motivation und Hook, Gerüchte, Geheimnisse und aktuelle Ereignisse.",
  },
  {
    id: "buildings",
    label: "🏛️ Häuser & Gebäude",
    instruction:
      "Erzeuge 6–8 bemerkenswerte Gebäude (Wohnhäuser, Werkstätten, Tempel, Verwaltung) mit Besitzer:in, Zustand, Atmosphäre und je einem Hook oder Geheimnis.",
  },
  {
    id: "shops",
    label: "🛒 Shops & Händler",
    instruction:
      "Erzeuge 3–5 Läden mit Inhaber:in, Ruf und jeweils einer Angebots-Tabelle (Angebot | Wirkung / Verwendung | Kurze Beschreibung | Preis 🪙) mit 6–12 Zeilen und Emojis pro Ware.",
  },
  {
    id: "taverns",
    label: "🍺 Tavernen & Gasthäuser",
    instruction:
      "Erzeuge 2–3 Tavernen mit Wirt:in, Stimmung, Preisen für Zimmer und Speisekarten-Tabelle (mit Emojis), Stammgästen und 3 Gerüchten je Haus.",
  },
  {
    id: "people",
    label: "🎭 Personen & NSCs",
    instruction:
      "Erzeuge 6–10 NSCs mit Rolle, Aussehen in einem Satz, Persönlichkeitszug, geheimer Motivation und Plot Hook. Tabelle: Name | Rolle | Persönlichkeit | Motivation | Hook.",
  },
  {
    id: "rumors",
    label: "🗣️ Gerüchte & Plot Hooks",
    instruction: "Erzeuge 8 Gerüchte (davon 2 falsch) und 5 Plot Hooks mit Einstieg, Gegenspieler und Belohnung.",
  },
  {
    id: "secrets",
    label: "🕵️ Geheimnisse (nur SL)",
    instruction:
      "Erzeuge 5 Geheimnisse mit Auswirkung, Entdeckungs-Hinweis (Fähigkeit/DC) und Konsequenz, wenn sie unentdeckt bleiben.",
  },
];

export function readSettings(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SETTING_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Builds the system/user prompt pair used to expand an existing note. */
export function buildExpandPrompt(note: Pick<Note, "kind" | "title">, body: string, aspect: Aspect) {
  const guide = settingGuides(readSettings());
  const system = [
    `Du baust einen bestehenden Eintrag eines TTRPG-Weltenbuchs weiter aus. Typ des Eintrags: ${note.kind}.`,
    guide ? `Kanon-Vorgabe — alles muss in diesem Setting existieren können:\n${guide}` : null,
    "Antworte ausschließlich in Markdown, beginne mit einer `##`-Überschrift (mit passendem Emoji) und gib NUR die neuen Abschnitte aus — keine Wiederholung des bestehenden Textes, kein Frontmatter, keine Meta-Kommentare.",
    "Alles ist spielfertig: konkrete Namen, Zahlen, Preise, Hooks. Verlinke neue Orte, Gebäude, Shops, Tavernen und Personen als [[Wikilinks]] (z. B. [[npc.Elara Weißdorn]], [[shop.Kräuterladen Nachtschatten]]), damit daraus eigene Seiten entstehen können.",
    "Nutze Emojis in Überschriften und bei einzelnen Waren, NSCs oder Orten — sparsam und thematisch.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const user = [
    `Eintrag: ${note.title}`,
    `Aufgabe: ${aspect.instruction}`,
    `Bestehender Inhalt (nicht wiederholen, aber konsistent bleiben):\n${body.slice(0, 5000)}`,
  ].join("\n\n");

  return { system, user };
}
