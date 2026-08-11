import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useVault, type NoteKind } from "@/lib/vault";

export const Route = createFileRoute("/world")({
  head: () => ({
    meta: [
      { title: "Worldbuilding-Templates — Mythic Journal" },
      { name: "description", content: "Templates für Charaktere, Orte, Fraktionen, Lore und Session-Logs für Faerûn und Eberron." },
      { property: "og:title", content: "Worldbuilding-Templates — Mythic Journal" },
      { property: "og:description", content: "Starte Charaktere, Orte, Fraktionen und Session-Logs mit einem Tap." },
    ],
  }),
  component: World,
});

const TEMPLATES: { kind: NoteKind; label: string; folder: string; body: (t: string) => string }[] = [
  {
    kind: "character",
    label: "Charakter",
    folder: "World/Charaktere",
    body: (t) => `# ${t}

**Volk:** · **Klasse:** · **Gesinnung:**
**Fraktion:** [[]] · **Ort:** [[]]

## Erscheinung
<span style="color:#88c0d0">Beschreibung hier</span>

## Ziele
- 

## Beziehungen
- [[]] — 
`,
  },
  {
    kind: "location",
    label: "Ort",
    folder: "World/Orte",
    body: (t) => `# ${t}

**Region:** · **Bevölkerung:** · **Herrschaft:**

## Atmosphäre

## Orte von Interesse
| Name | Typ | Notiz |
| --- | --- | --- |
|  |  |  |
`,
  },
  {
    kind: "faction",
    label: "Fraktion",
    folder: "World/Fraktionen",
    body: (t) => `# ${t}

**Einfluss:** · **Ziel:** · **Feinde:** [[]]

## Mitglieder
- [[]]
`,
  },
  {
    kind: "lore",
    label: "Lore",
    folder: "World/Lore",
    body: (t) => `# ${t}

> Legende, Prophezeiung oder Chronik.

## Quellen
- 
`,
  },
  {
    kind: "session",
    label: "Session-Log",
    folder: "Journal",
    body: (t) => `# ${t}

**Datum:** · **Spieler:** 

## Szenen
1. 

## Loot & Hinweise
- 
`,
  },
];

function World() {
  const { notes, create } = useVault();
  const navigate = useNavigate();

  const counts = notes.reduce<Record<string, number>>((acc, n) => {
    acc[n.kind] = (acc[n.kind] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell title="World" subtitle="Faerûn · Eberron · Templates">
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.kind}
            onClick={() => {
              const title = `Neu: ${t.label}`;
              const note = create(t.kind, title, t.body(title), t.folder);
              navigate({ to: "/note/$id", params: { id: note.id } });
            }}
            className="card text-left active:scale-[0.98]"
          >
            <p className="font-display text-sm font-semibold text-foreground">{t.label}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{t.folder}</p>
            <span className="chip mt-3 inline-block">{counts[t.kind] ?? 0} vorhanden</span>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
