import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Eye, Code2, Trash2, PenLine, Check } from "lucide-react";
import { TabBar } from "@/components/TabBar";
import { highlightMarkdown } from "@/lib/markdown";
import { PreviewContent } from "@/components/PreviewContent";
import { LiveEditor } from "@/components/LiveEditor";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { RelationPanel } from "@/components/RelationPanel";
import { download, useVault } from "@/lib/vault";


export const Route = createFileRoute("/note/$id")({
  head: () => ({
    meta: [
      { title: "Notiz bearbeiten — Mythic Journal" },
      { name: "description", content: "Markdown-Editor mit Source-Mode, Preview-Renderer, Inline-CSS und SVG." },
      { property: "og:title", content: "Notiz bearbeiten — Mythic Journal" },
      { property: "og:description", content: "Schreib- und Lesemodus für deine Worldbuilding-Notizen." },
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
  const [mode, setMode] = useState<"source" | "preview">("source");
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+14px)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <button onClick={() => navigate({ to: "/" })} className="btn-ghost" aria-label="Zurück">
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-semibold text-foreground">{note.title}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {saved ? "Gespeichert" : note.path}
            </p>
          </div>
          <button onClick={() => download(note)} className="btn-ghost" aria-label=".md exportieren">
            <Download className="size-4" />
          </button>
          <button
            onClick={() => {
              remove(note.id);
              navigate({ to: "/" });
            }}
            className="btn-ghost"
            aria-label="Löschen"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mx-auto mt-3 flex max-w-lg rounded-xl bg-muted p-1">
          {(["source", "preview"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "source" ? <Code2 className="size-3.5" /> : <Eye className="size-3.5" />}
              {m === "source" ? "Source" : "Preview"}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {mode === "source" ? (
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

        <RelationPanel
          note={note}
          allTitles={notes.filter((n) => n.id !== note.id).map((n) => n.title)}
          onChange={(relations) => save({ ...note, body, relations })}
        />

        <section className="mt-6">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Properties
          </h2>
          <div className="card space-y-1.5">
            {Object.entries(note.properties).map(([k, v]) => (
              <div key={k} className="flex gap-3 text-xs">
                <span className="w-24 shrink-0 text-muted-foreground">{k}</span>
                <span className="text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <TabBar />
    </div>
  );
}
