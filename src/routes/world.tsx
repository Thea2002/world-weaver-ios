import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useVault, type NoteKind } from "@/lib/vault";

export const Route = createFileRoute("/world")({
  head: () => ({
    meta: [
      { title: "Worldbuilding-Fenster — Mythic Journal" },
      {
        name: "description",
        content:
          "Fenster für Charaktere, NSCs, Götter, Waffen, Rüstung, Timeline, Biome, Klassen und Rassen — plus eigene Kategorien.",
      },
      { property: "og:title", content: "Worldbuilding-Fenster — Mythic Journal" },
      { property: "og:description", content: "Eigene Kategorien anlegen und Notizen mit einem Tap starten." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: World,
});

type Window = { id: string; kind: NoteKind; label: string; emoji: string; folder: string; body: (t: string) => string };

const table = (head: string[]) =>
  `| ${head.join(" | ")} |\n| ${head.map(() => "---").join(" | ")} |\n| ${head.map(() => " ").join(" | ")} |`;

const WINDOWS: Window[] = [
  {
    id: "character",
    kind: "character",
    label: "Charakter",
    emoji: "🧝",
    folder: "World/Charaktere",
    body: (t) => `# ${t} 🧝\n\n**Volk:** · **Klasse:** · **Gesinnung:**\n**Fraktion:** [[]] · **Ort:** [[]]\n\n## Erscheinung\n\n## Ziele\n- \n\n## Beziehungen\n- [[]] — \n`,
  },
  {
    id: "npc",
    kind: "npc",
    label: "NSC",
    emoji: "🎭",
    folder: "World/NSCs",
    body: (t) => `# ${t} 🎭\n\n**Rolle:** · **Ort:** [[]] · **Haltung:**\n\n## Auftreten\n\n## Was er/sie will\n- \n\n## Gerüchte\n- \n`,
  },
  {
    id: "location",
    kind: "location",
    label: "Ort",
    emoji: "🏰",
    folder: "World/Orte",
    body: (t) => `# ${t} 🏰\n\n**Region:** · **Bevölkerung:** · **Herrschaft:**\n\n## Atmosphäre\n\n## Orte von Interesse\n${table(["Name", "Typ", "Notiz"])}\n`,
  },
  {
    id: "faction",
    kind: "faction",
    label: "Fraktion",
    emoji: "⚔️",
    folder: "World/Fraktionen",
    body: (t) => `# ${t} ⚔️\n\n**Einfluss:** · **Ziel:** · **Feinde:** [[]]\n\n## Mitglieder\n- [[]]\n`,
  },
  {
    id: "deity",
    kind: "deity",
    label: "Gott / Pantheon",
    emoji: "🕯️",
    folder: "World/Götter",
    body: (t) => `# ${t} 🕯️\n\n**Domäne:** · **Symbol:** · **Gesinnung:** · **Pantheon:**\n\n## Dogma\n\n## Klerus & Tempel\n${table(["Tempel", "Ort", "Rang"])}\n`,
  },
  {
    id: "weapon",
    kind: "item",
    label: "Waffen",
    emoji: "🗡️",
    folder: "World/Waffen",
    body: (t) => `# ${t} 🗡️\n\n**Typ:** · **Schaden:** · **Eigenschaften:** · **Seltenheit:**\n\n## Angebot\n${table(["Waffe", "Schaden", "Beschreibung", "Preis 🪙"])}\n`,
  },
  {
    id: "armor",
    kind: "item",
    label: "Rüstung",
    emoji: "🛡️",
    folder: "World/Rüstung",
    body: (t) => `# ${t} 🛡️\n\n**Typ:** · **RK:** · **Gewicht:** · **Seltenheit:**\n\n## Angebot\n${table(["Rüstung", "RK", "Beschreibung", "Preis 🪙"])}\n`,
  },
  {
    id: "item",
    kind: "item",
    label: "Gegenstände",
    emoji: "🎒",
    folder: "World/Gegenstände",
    body: (t) => `# ${t} 🎒\n\n**Art:** · **Seltenheit:** · **Preis:**\n\n## Angebot\n${table(["Angebot", "Wirkung/Verwendung", "Kurze Beschreibung", "Preis 🪙"])}\n`,
  },
  {
    id: "creature",
    kind: "creature",
    label: "Kreatur",
    emoji: "🐉",
    folder: "World/Bestiarium",
    body: (t) => `# ${t} 🐉\n\n> [!statblock] ${t}\n> **HG:** · **RK:** · **TP:** · **Bewegung:**\n> **Angriffe:** \n\n## Verhalten\n\n## Lebensraum\n`,
  },
  {
    id: "timeline",
    kind: "timeline",
    label: "Timeline",
    emoji: "⏳",
    folder: "World/Timeline",
    body: (t) => `# ${t} ⏳\n\n${table(["Jahr", "Ereignis", "Beteiligte", "Folgen"])}\n`,
  },
  {
    id: "environment",
    kind: "lore",
    label: "Biome & Terrain",
    emoji: "🌿",
    folder: "World/Umwelt",
    body: (t) => `# ${t} 🌿\n\n**Biom:** · **Klima:** · **Terrain:** · **Gefahren:**\n\n## Flora & Fauna\n${table(["Name", "Art", "Notiz"])}\n`,
  },
  {
    id: "class",
    kind: "rules",
    label: "Klassen",
    emoji: "🎓",
    folder: "World/Regeln/Klassen",
    body: (t) => `# ${t} 🎓\n\n**Trefferwürfel:** · **Attribut:** · **Rettungswürfe:**\n\n## Merkmale\n${table(["Stufe", "Merkmal", "Effekt"])}\n`,
  },
  {
    id: "race",
    kind: "rules",
    label: "Rassen / Völker",
    emoji: "🧬",
    folder: "World/Regeln/Völker",
    body: (t) => `# ${t} 🧬\n\n**Größe:** · **Bewegung:** · **Lebensspanne:** · **Heimat:** [[]]\n\n## Merkmale\n- \n`,
  },
  {
    id: "lore",
    kind: "lore",
    label: "Lore",
    emoji: "📜",
    folder: "World/Lore",
    body: (t) => `# ${t} 📜\n\n> Legende, Prophezeiung oder Chronik.\n\n## Quellen\n- \n`,
  },
  {
    id: "session",
    kind: "session",
    label: "Session-Log",
    emoji: "🎲",
    folder: "Journal",
    body: (t) => `# ${t} 🎲\n\n**Datum:** · **Spieler:**\n\n## Szenen\n1. \n\n## Loot & Hinweise\n- \n`,
  },
];

type Custom = { id: string; label: string; emoji: string; folder: string };
const CUSTOM_KEY = "mythic:world-windows";

function World() {
  const { notes, create } = useVault();
  const navigate = useNavigate();
  const [custom, setCustom] = useState<Custom[]>([]);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("✨");

  useEffect(() => {
    try {
      setCustom(JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? "[]") as Custom[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Custom[]) => {
    setCustom(next);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  };

  const addWindow = () => {
    const name = label.trim();
    if (!name) return;
    persist([...custom, { id: `c-${Date.now()}`, label: name, emoji: emoji.trim() || "✨", folder: `World/${name}` }]);
    setLabel("");
    setEmoji("✨");
    setAdding(false);
  };

  const countFor = (folder: string) => notes.filter((n) => n.path.startsWith(folder)).length;

  const open = (label: string, folder: string, kind: NoteKind, body: string) => {
    const title = `Neu: ${label}`;
    const note = create(kind, title, body, folder, { Kategorie: label });
    navigate({ to: "/note/$id", params: { id: note.id } });
  };

  return (
    <AppShell title="World" subtitle={`${WINDOWS.length + custom.length} Fenster · eigene Kategorien möglich`}>
      <div className="grid grid-cols-2 gap-3">
        {WINDOWS.map((w) => (
          <button
            key={w.id}
            onClick={() => open(w.label, w.folder, w.kind, w.body(`Neu: ${w.label}`))}
            className="card text-left active:scale-[0.98]"
          >
            <p className="font-display text-sm font-semibold text-foreground">
              {w.emoji} {w.label}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{w.folder}</p>
            <span className="chip mt-3 inline-block">{countFor(w.folder)} vorhanden</span>
          </button>
        ))}

        {custom.map((c) => (
          <div key={c.id} className="card relative text-left">
            <button
              onClick={() =>
                open(c.label, c.folder, "note", `# Neu: ${c.label} ${c.emoji}\n\n**Kategorie:** ${c.label}\n\n`)
              }
              className="block w-full text-left"
            >
              <p className="font-display text-sm font-semibold text-foreground">
                {c.emoji} {c.label}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{c.folder}</p>
              <span className="chip mt-3 inline-block">{countFor(c.folder)} vorhanden</span>
            </button>
            <button
              onClick={() => persist(custom.filter((x) => x.id !== c.id))}
              className="btn-ghost absolute right-1.5 top-1.5"
              aria-label={`${c.label} entfernen`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <section className="mt-4">
        {adding ? (
          <div className="card space-y-2">
            <div className="flex gap-2">
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-14 rounded-xl border border-border bg-surface-2 px-3 py-2 text-center text-sm"
                aria-label="Emoji"
              />
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Neues Fenster (z. B. Pantheons, Zauber …)"
                className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Kategoriename"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addWindow} className="btn-primary">
                <Plus className="size-3.5" /> Anlegen
              </button>
              <button onClick={() => setAdding(false)} className="btn-ghost px-3">
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="btn-primary w-full justify-center">
            <Plus className="size-4" /> Fenster hinzufügen
          </button>
        )}
      </section>
    </AppShell>
  );
}
