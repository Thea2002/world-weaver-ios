import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { generateContent } from "@/lib/generate.functions";
import { ASPECTS, buildExpandPrompt, type Aspect } from "@/lib/expand-aspects";
import { useVault, type Note } from "@/lib/vault";

type Progress = { done: number; total: number; current: string };

/** Generates one aspect for many marked notes and appends it to each page. */
export function BatchExpandPanel({ notes, onClear }: { notes: Note[]; onClear: () => void }) {
  const { save } = useVault();
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [result, setResult] = useState<string>();

  const run = async (aspect: Aspect) => {
    setBusy(aspect.id);
    setResult(undefined);
    let ok = 0;
    const failed: string[] = [];

    for (const [index, note] of notes.entries()) {
      setProgress({ done: index, total: notes.length, current: note.title });
      const { system, user } = buildExpandPrompt(note, note.body, aspect);
      try {
        const res = await generateContent({ data: { system, user } });
        save({ ...note, body: `${note.body.trimEnd()}\n\n${res.text.trim()}\n` });
        ok += 1;
      } catch {
        failed.push(note.title);
      }
    }

    setProgress(null);
    setBusy(null);
    setResult(
      failed.length
        ? `${ok} von ${notes.length} Seiten erweitert · fehlgeschlagen: ${failed.join(", ")}`
        : `${ok} Seiten erweitert und gespeichert.`,
    );
  };

  return (
    <section className="card animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="size-3.5" /> {notes.length} markiert · gesammelt ausbauen
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Der gewählte Abschnitt wird für jede markierte Seite generiert und dort angehängt.
          </p>
        </div>
        <button type="button" onClick={onClear} className="btn-ghost shrink-0 px-2 py-1" aria-label="Auswahl aufheben">
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {notes.map((note) => (
          <span key={note.id} className="rounded-full border border-primary/60 bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
            {note.title}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ASPECTS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => void run(a)}
            disabled={busy !== null}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] disabled:opacity-50 ${
              a.id === "full" ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface-2 text-muted-foreground"
            }`}
          >
            {busy === a.id && <Loader2 className="size-3 animate-spin" />}
            {a.label}
          </button>
        ))}
      </div>

      {progress && (
        <p className="mt-2 text-xs text-muted-foreground">
            {progress.done + 1}/{progress.total} · generiere „{progress.current}“ …
        </p>
      )}
      {result && <p className="mt-2 text-xs text-foreground">{result}</p>}
    </section>
  );
}
