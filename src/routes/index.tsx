import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useVault } from "@/lib/vault";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mythic Journal — Markdown Second Brain" },
      {
        name: "description",
        content:
          "Lokales Second Brain für Worldbuilding: Markdown-Editor mit Source- und Preview-Mode, Graph, Datenbanken und TTRPG-Templates.",
      },
      { property: "og:title", content: "Mythic Journal — Markdown Second Brain" },
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
};

function Journal() {
  const { notes, create } = useVault();
  const navigate = useNavigate();

  const newNote = () => {
    const note = create("note", `Neue Notiz ${notes.length + 1}`, "# Neue Notiz\n\n");
    navigate({ to: "/note/$id", params: { id: note.id } });
  };

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
      <ul className="space-y-3">
        {notes.map((n) => (
          <li key={n.id}>
            <Link to="/note/$id" params={{ id: n.id }} className="card block active:scale-[0.99]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-foreground">{n.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.path}</p>
                </div>
                <span className="chip">{KIND_LABEL[n.kind] ?? n.kind}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                {n.body.replace(/[#*`>]|<[^>]*>/g, "").slice(0, 140)}
              </p>
            </Link>
          </li>
        ))}
        {!notes.length && (
          <li className="card flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <FileText className="size-6" />
            <p className="text-sm">Noch keine Notizen. Erstelle deine erste Datei.</p>
          </li>
        )}
      </ul>
    </AppShell>
  );
}
