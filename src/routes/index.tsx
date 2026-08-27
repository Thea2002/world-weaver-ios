import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, FileText, Clock, Tag } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useVault } from "@/lib/vault";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mythic Journal \u2014 Markdown Second Brain" },
      {
        name: "description",
        content:
          "Lokales Second Brain f\u00fcr Worldbuilding: Markdown-Editor mit Source- und Preview-Mode, Graph, Datenbanken und TTRPG-Templates.",
      },
      { property: "og:title", content: "Mythic Journal \u2014 Markdown Second Brain" },
      {
        property: "og:description",
        content: "Markdown-Notizen mit Wikilinks, Inline-CSS, SVG-Rendering und Graph-Ansicht.",
      },
    ],
  }),
  component: Journal,
});

const KIND_LABEL: Record<string, string> = {
  note: "Notiz",
  character: "Charakter",
  location: "Ort",
  faction: "Fraktion",
  lore: "Lore",
  session: "Session",
  npc: "NPC",
  deity: "Gottheit",
  item: "Gegenstand",
  creature: "Kreatur",
  timeline: "Zeitachse",
  rules: "Regeln",
};

const KIND_COLOR: Record<string, string> = {
  note: "#88c0d0",
  character: "#a3be8c",
  location: "#ebcb8b",
  faction: "#bf616a",
  lore: "#b48ead",
  session: "#81a1c1",
  npc: "#88c0d0",
  deity: "#e5e9f0",
  item: "#d8dee9",
  creature: "#bf616a",
  timeline: "#d08770",
  rules: "#5e81ac",
};

const KIND_ICON: Record<string, string> = {
  note: "\ud83d\udcc4",
  character: "\ud83d\udc64",
  location: "\ud83d\uddfa\ufe0f",
  faction: "\u2694\ufe0f",
  lore: "\ud83d\udcda",
  session: "\ud83d\udcbb",
  npc: "\ud83c\udfad",
  deity: "\ud83d\udd6f\ufe0f",
  item: "\ud83e\ude84",
  creature: "\ud83d\udc09",
  timeline: "\ud83d\udd63",
  rules: "\ud83d\udcd6",
};

function Journal() {
  const { notes, create } = useVault();
  const navigate = useNavigate();

  const newNote = () => {
    const note = create("note", `Neue Notiz ${notes.length + 1}`, "# Neue Notiz\n\n");
    navigate({ to: "/note/$id", params: { id: note.id } });
  };

  // Gruppiere Notizen nach Typ
  const notesByKind: Record<string, typeof notes> = {};
  notes.forEach((note) => {
    const kind = note.kind || "note";
    if (!notesByKind[kind]) {
      notesByKind[kind] = [];
    }
    notesByKind[kind].push(note);
  });

  // Sortiere nach Aktualit\u00e4t
  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 3);

  return (
    <AppShell
      title="Journal"
      subtitle={`${notes.length} Dateien im Vault`}
      action={
        <button onClick={newNote} className="btn-primary" aria-label="Neue Notiz">
          <Plus className="size-4" /> Neu
        </button>
      }
    >
      {/* Schnellzugriff - Letzte Notizen */}
      {recentNotes.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Zuletzt bearbeitet
            </h2>
          </div>
          <div className="space-y-2">
            {recentNotes.map((n) => (
              <Link
                key={n.id}
                to="/note/$id"
                params={{ id: n.id }}
                className="card block active:scale-[0.99] animate-fade-in"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-foreground">
                      {n.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.path}</p>
                  </div>
                  <span className="chip">
                    {KIND_ICON[n.kind] || KIND_ICON.note} {KIND_LABEL[n.kind] ?? n.kind}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {n.body.replace(/[#*`>]|<[^>]*>/g, "").slice(0, 140)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nach Typ gruppiert */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Nach Typ
        </h2>
        <div className="space-y-4">
          {Object.entries(notesByKind).map(([kind, kindNotes]) => (
            <div key={kind}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: KIND_COLOR[kind] || "#88c0d0" }}>
                  {KIND_ICON[kind] || KIND_ICON.note}
                </span>
                <h3 className="text-sm font-semibold text-foreground">
                  {KIND_LABEL[kind] || kind} ({kindNotes.length})
                </h3>
              </div>
              <div className="space-y-2">
                {kindNotes
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((n) => (
                    <Link
                      key={n.id}
                      to="/note/$id"
                      params={{ id: n.id }}
                      className="card block active:scale-[0.99] animate-fade-in"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-display text-base font-semibold text-foreground">
                            {n.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {n.path}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {n.body.replace(/[#*`>]|<[^>]*>/g, "").slice(0, 140)}
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {!notes.length && (
        <li className="card flex flex-col items-center gap-2 py-10 text-center text-muted-foreground animate-fade-in">
          <FileText className="size-6" />
          <p className="text-sm">Noch keine Notizen. Erstelle deine erste Datei.</p>
        </li>
      )}
    </AppShell>
  );
}
