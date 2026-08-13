import { useCallback, useEffect, useState } from "react";

export type NoteKind =
  | "note"
  | "character"
  | "location"
  | "faction"
  | "lore"
  | "session"
  | "npc"
  | "deity"
  | "item"
  | "creature"
  | "timeline"
  | "rules";

/** Link between two notes with a sentiment value from -10 (Feind) to +10 (bester Freund). */
export type Relation = {
  target: string; // note title
  value: number; // -10 … +10
  label?: string;
};

export type Note = {
  id: string;
  title: string;
  path: string; // e.g. "World/Faerun/Elminster.md"
  kind: NoteKind;
  body: string;
  properties: Record<string, string>;
  relations?: Relation[];
  updatedAt: number;
};

const KEY = "mythic:vault:v4";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function seed(): Note[] {
  const now = Date.now();
  return [
    {
      id: "n-elminster",
      title: "Elminster Aumar",
      path: "World/Faerûn/Elminster Aumar.md",
      kind: "character",
      properties: { Typ: "NPC", Fraktion: "Harpers", Ort: "Shadowdale" },
      updatedAt: now,
      body: `# Elminster Aumar

> *"Magie ist kein Werkzeug, sie ist ein Gespräch."*

**Fraktion:** [[Harpers]] · **Heimat:** [[Shadowdale]]

Der <span style="color:#88c0d0;font-weight:700">Chosen of Mystra</span> wandert seit
Jahrhunderten über <span style="background:#bf616a;color:#eceff4;padding:0 4px;border-radius:4px">Faerûn</span>.

<svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Arkanes Siegel">
  <circle cx="60" cy="60" r="52" fill="none" stroke="#88c0d0" stroke-width="3"/>
  <polygon points="60,14 104,92 16,92" fill="none" stroke="#a3be8c" stroke-width="3"/>
  <circle cx="60" cy="66" r="14" fill="#ebcb8b" opacity="0.85"/>
</svg>

## Session-Notizen
- Trifft die Gruppe erstmals in der [[Old Skull Inn]]
- Bietet Zugang zum Archiv unter einer Bedingung
`,
    },
    {
      id: "n-sharn",
      title: "Sharn",
      path: "World/Eberron/Sharn.md",
      kind: "location",
      properties: { Typ: "Stadt", Welt: "Eberron", Ebene: "Upper City" },
      updatedAt: now - 8_000_000,
      body: `# Sharn — City of Towers

Türme aus <span style="color:#d08770">Manifest-Zone-Stein</span> durchstoßen den Nebel.

| Ward | Ebene | Stimmung |
| --- | --- | --- |
| Menthis | Middle | Theater, Lärm |
| Dura | Lower | Gefährlich |

Verknüpft: [[Elminster Aumar]] · [[Harpers]]
`,
    },
    {
      id: "n-loot-csv",
      title: "Loot-Tabelle",
      path: "World/Data/Loot.csv",
      kind: "note",
      properties: { Typ: "CSV", Spalten: "4" },
      updatedAt: Date.now() - 2_000_000,
      body: `Name;Typ;Wert;Ort
Elminster Aumar;NSC;-;Shadowdale
Sharn;Ort;-;Eberron
Nebelvertrag;Artefakt;2500;Sharn
Harfner-Pin;Abzeichen;150;Shadowdale`,
    },
    {
      id: "n-session-01",
      title: "Session 01 — Der Nebelvertrag",
      path: "Journal/Session 01.md",
      kind: "session",
      properties: { Datum: "1492 DR", Spieler: "4", Status: "Abgeschlossen" },
      updatedAt: now - 20_000_000,
      body: `# Session 01 — Der Nebelvertrag

1. Ankunft in [[Sharn]]
2. Verhandlung mit einer Drachenmarken-Haus-Agentin
3. Cliffhanger: <span style="color:#bf616a;font-weight:700">Der Vertrag brennt.</span>
`,
    },
  ];
}

function read(): Note[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  try {
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

function write(notes: Note[]) {
  localStorage.setItem(KEY, JSON.stringify(notes));
  emit();
}

export function extractProperties(body: string): Record<string, string> {
  const stop = new Set(["und", "der", "die", "das", "mit", "eine", "einer", "sich", "den", "dem", "für", "auf", "ist", "the", "and", "with"]);
  const counts = new Map<string, number>();
  for (const word of body.replace(/<[^>]*>/g, " ").match(/[\p{L}][\p{L}'-]{3,}/gu) ?? []) {
    const w = word.toLowerCase();
    if (stop.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
  return { Keywords: top.join(", "), Wörter: String(body.split(/\s+/).filter(Boolean).length) };
}

export function outgoingLinks(body: string): string[] {
  return [...body.matchAll(/!?\[\[([^\]|#]+)/g)].map((m) => m[1]!.trim());
}

export function useVault() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const sync = () => setNotes(read());
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  const save = useCallback((note: Note) => {
    const all = read();
    const idx = all.findIndex((n) => n.id === note.id);
    const next: Note = {
      ...note,
      updatedAt: Date.now(),
      properties: { ...note.properties, ...extractProperties(note.body) },
    };
    if (idx >= 0) all[idx] = next;
    else all.unshift(next);
    write(all);
    return next;
  }, []);

  const create = useCallback((kind: NoteKind, title: string, body: string, folder = "Journal") => {
    const note: Note = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      path: `${folder}/${title}.md`,
      kind,
      body,
      properties: extractProperties(body),
      updatedAt: Date.now(),
    };
    write([note, ...read()]);
    return note;
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((n) => n.id !== id));
  }, []);

  return { notes, save, create, remove };
}

export function download(note: Note) {
  const blob = new Blob([note.body], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
