import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { generateContent } from "@/lib/generate.functions";
import { ASPECTS, buildExpandPrompt, type Aspect } from "@/lib/expand-aspects";
import type { Note } from "@/lib/vault";

/** Generates additional detail sections for an existing note and appends them. */
export function ExpandPanel({ note, body, onAppend }: { note: Note; body: string; onAppend: (md: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  const run = async (aspect: Aspect) => {
    setBusy(aspect.id);
    setError(undefined);
    const { system, user } = buildExpandPrompt(note, body, aspect);

    try {
      const res = await generateContent({ data: { system, user } });
      onAppend(res.text.trim());
    } catch {
      setError("Generieren fehlgeschlagen. Bitte nochmal versuchen.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="card mt-6">
      <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5" /> Ausbauen
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Erweitert „{note.title}“ um neue Abschnitte — direkt an die Seite angehängt und automatisch gespeichert.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ASPECTS.map((a) => (
          <button
            key={a.id}
            onClick={() => void run(a)}
            disabled={busy !== null}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] disabled:opacity-50 ${
              a.id === "full"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-surface-2 text-muted-foreground"
            }`}
          >
            {busy === a.id && <Loader2 className="size-3 animate-spin" />}
            {a.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </section>
  );
}
