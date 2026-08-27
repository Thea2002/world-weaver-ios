import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Eye, Code2, Trash2, PenLine, Check, Calendar, Tag, FileText } from "lucide-react";
import { TabBar } from "@/components/TabBar";
import { highlightMarkdown } from "@/lib/markdown";
import { PreviewContent } from "@/components/PreviewContent";
import { LiveEditor } from "@/components/LiveEditor";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { RelationPanel } from "@/components/RelationPanel";
import { ExpandPanel } from "@/components/ExpandPanel";
import { download, useVault } from "@/lib/vault";

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


export const Route = createFileRoute("/note/$id")({
  head: () => ({
    meta: [
      { title: "Notiz bearbeiten \u2014 Mythic Journal" },
      { name: "description", content: "Markdown-Editor mit Source-Mode, Preview-Renderer, Inline-CSS und SVG." },
      { property: "og:title", content: "Notiz bearbeiten \u2014 Mythic Journal" },
      { property: "og:description", content: "Schreib- und Lesemodus f\u00fcr deine Worldbuilding-Notizen." },
    ],
  }),
  component: NoteEditor,
});

function NoteEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { notes, save, remove } = useVault();
  const note = notes.find((n) => n.id === id);

  const [doc, setDoc] = useState<{ id: string; body: string }>({ id: "", body: "" });
  const body = doc.id === id ? doc.body : (note?.body ?? "");
  const setBody = (value: string) => setDoc({ id, body: value });
  const [mode, setMode] = useState<"live" | "source" | "preview">("live");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!note || doc.id !== note.id || doc.body === note.body) return;
    const t = setTimeout(() => {
      save({ ...note, body: doc.body });
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    }, 700);
    return () => clearTimeout(t);
  }, [doc, note, save]);


  if (!note) {
    return (
      <div className="min-h-screen bg-background p-6 text-muted-foreground">
        <p>Notiz nicht gefunden.</p>
      </div>
    );
  }

  // Formatiertes Datum
  const formattedDate = new Date(note.updatedAt).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+14px)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <button onClick={() => navigate({ to: "/" })} className="btn-ghost" aria-label="Zur\u00fcck">
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span 
                style={{ color: KIND_COLOR[note.kind] || "#88c0d0" }} 
                className="text-lg"
              >
                {note.kind === "character" ? "\ud83d\udc64" :
                 note.kind === "location" ? "\ud83d\uddfa\ufe0f" :
                 note.kind === "faction" ? "\u2694\ufe0f" :
                 note.kind === "lore" ? "\ud83d\udcda" :
                 note.kind === "session" ? "\ud83d\udcbb" :
                 note.kind === "npc" ? "\ud83c\udfad" :
                 note.kind === "deity" ? "\ud83d\udd6f\ufe0f" :
                 note.kind === "item" ? "\ud83e\ude84" :
                 note.kind === "creature" ? "\ud83d\udc09" :
                 "\ud83d\udcc4"}
              </span>
              <p className="truncate font-display text-base font-semibold text-foreground">{note.title}</p>
            </div>
            <p className="truncate text-[11px] text-muted-foreground">
              {saved ? (
                <span className="inline-flex items-center gap-1 text-primary">
                  <Check className="size-3" /> Automatisch gespeichert
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3" /> {formattedDate}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => download(note)} className="btn-ghost" aria-label=".md exportieren">
              <Download className="size-4" />
            </button>
            <button
              onClick={() => {
                remove(note.id);
                navigate({ to: "/" });
              }}
              className="btn-ghost"
              aria-label="L\u00f6schen"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-lg rounded-xl bg-muted p-1">
          {(["live", "source", "preview"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 ${
                mode === m 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {m === "live" ? <PenLine className="size-3.5" /> : m === "source" ? <Code2 className="size-3.5" /> : <Eye className="size-3.5" />}
              {m === "live" ? "Live" : m === "source" ? "Source" : "Preview"}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {mode === "live" ? (
          <LiveEditor body={body} path={note.path} onChange={setBody} hideFrontmatter />
        ) : mode === "source" ? (
          <div className="editor-stack">
            <pre className="editor-highlight" aria-hidden dangerouslySetInnerHTML={{ __html: highlightMarkdown(body) + "\n" }} />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              spellCheck={false}
              className="editor-input"
              aria-label="Markdown Quelltext"
            />
          </div>
        ) : (
          <PreviewContent body={body} path={note.path} />
        )}

        <ExpandPanel
          note={note}
          body={body}
          onAppend={(md) => setBody(`${body.replace(/\s*$/, "")}\n\n${md}\n`)}
        />

        <RelationPanel
          note={note}
          allTitles={notes.filter((n) => n.id !== note.id).map((n) => n.title)}
          onChange={(relations) => save({ ...note, body, relations })}
        />

        <div className="mt-6">
          <PropertiesPanel entries={Object.entries(note.properties)} />
        </div>
      </main>
      <TabBar />
    </div>
  );
}
