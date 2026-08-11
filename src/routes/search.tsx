import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useVault } from "@/lib/vault";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Volltextsuche — Mythic Journal" },
      { name: "description", content: "Durchsuche alle Markdown-Notizen, Titel, Pfade und Auto-Properties deines Vaults." },
      { property: "og:title", content: "Volltextsuche — Mythic Journal" },
      { property: "og:description", content: "Finde Charaktere, Orte und Session-Notizen in Sekunden." },
    ],
  }),
  component: SearchView,
});

function SearchView() {
  const { notes } = useVault();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();

  const results = term
    ? notes.filter((n) =>
        [n.title, n.path, n.body, Object.values(n.properties).join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
    : notes;

  return (
    <AppShell title="Suche" subtitle={`${results.length} Treffer`}>
      <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Notizen, Properties, Inhalte…"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <ul className="mt-4 space-y-3">
        {results.map((n) => {
          const idx = n.body.toLowerCase().indexOf(term);
          const snippet = term && idx >= 0 ? n.body.slice(Math.max(0, idx - 40), idx + 80) : n.body.slice(0, 110);
          return (
            <li key={n.id}>
              <Link to="/note/$id" params={{ id: n.id }} className="card block">
                <p className="font-display text-sm font-semibold text-foreground">{n.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{n.path}</p>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  …{snippet.replace(/[#*`>]|<[^>]*>/g, "")}…
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
