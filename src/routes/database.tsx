import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useVault, type Note } from "@/lib/vault";
import { relationStatus } from "@/lib/relations";

export const Route = createFileRoute("/database")({
  head: () => ({
    meta: [
      { title: "Datenbank — Mythic Journal" },
      {
        name: "description",
        content:
          "Notion-artige Datenbank aller Notizen: Properties, Typ-Filter, Sortierung und Beziehungswerte in einer Tabelle.",
      },
      { property: "og:title", content: "Datenbank — Mythic Journal" },
      { property: "og:description", content: "Alle Notizen mit Properties als sortierbare Tabelle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Database,
});

const BASE = ["Titel", "Typ", "Pfad", "Aktualisiert"] as const;

function value(note: Note, col: string): string {
  if (col === "Titel") return note.title;
  if (col === "Typ") return note.kind;
  if (col === "Pfad") return note.path;
  if (col === "Aktualisiert") return new Date(note.updatedAt).toLocaleDateString("de-DE");
  return note.properties[col] ?? "";
}

function Database() {
  const { notes } = useVault();
  const navigate = useNavigate();
  const [kind, setKind] = useState<string>("alle");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ col: string; dir: 1 | -1 }>({ col: "Aktualisiert", dir: -1 });

  const propCols = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of notes) for (const k of Object.keys(n.properties)) counts.set(k, (counts.get(k) ?? 0) + 1);
    return [...counts.entries()]
      .filter(([k]) => k !== "Keywords" && k !== "Wörter")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([k]) => k);
  }, [notes]);

  const cols = [...BASE, ...propCols];
  const kinds = useMemo(() => ["alle", ...new Set(notes.map((n) => n.kind))], [notes]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => (kind === "alle" || n.kind === kind))
      .filter(
        (n) =>
          !q ||
          n.title.toLowerCase().includes(q) ||
          Object.values(n.properties).some((v) => v.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        if (sort.col === "Aktualisiert") return (a.updatedAt - b.updatedAt) * sort.dir;
        return value(a, sort.col).localeCompare(value(b, sort.col), "de") * sort.dir;
      });
  }, [notes, kind, query, sort]);

  const toggleSort = (col: string) =>
    setSort((s) => (s.col === col ? { col, dir: s.dir === 1 ? -1 : 1 } : { col, dir: 1 }));

  return (
    <AppShell title="Datenbank" subtitle={`${rows.length} Einträge · ${cols.length} Spalten`}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filtern nach Titel oder Property …"
        className="mb-3 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        aria-label="Datenbank filtern"
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full border px-2.5 py-1 text-[11px] ${
              kind === k ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface-2 text-muted-foreground"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="csv-wrap overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="csv-table w-full text-left text-[11px]">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c} className="whitespace-nowrap px-2.5 py-2">
                  <button onClick={() => toggleSort(c)} className="font-semibold text-muted-foreground">
                    {c}
                    {sort.col === c ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
              <th className="whitespace-nowrap px-2.5 py-2 text-muted-foreground">Beziehungen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr
                key={n.id}
                onClick={() => navigate({ to: "/note/$id", params: { id: n.id } })}
                className="cursor-pointer border-t border-border active:bg-primary/10"
              >
                {cols.map((c) => (
                  <td key={c} className="max-w-[180px] truncate px-2.5 py-2 text-foreground">
                    {value(n, c)}
                  </td>
                ))}
                <td className="whitespace-nowrap px-2.5 py-2">
                  {(n.relations ?? []).slice(0, 3).map((r) => {
                    const st = relationStatus(r.value);
                    return (
                      <span
                        key={r.target}
                        className="mr-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {r.target} {r.value > 0 ? `+${r.value}` : r.value}
                      </span>
                    );
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!rows.length && <p className="mt-4 text-xs text-muted-foreground">Keine Einträge für diesen Filter.</p>}
    </AppShell>
  );
}
