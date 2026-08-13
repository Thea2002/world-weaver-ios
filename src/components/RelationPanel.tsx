import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { relationSegments, relationStatus, upsertRelation } from "@/lib/relations";
import type { Note, Relation } from "@/lib/vault";

export function RelationBar({ value }: { value: number }) {
  const { filled, empty, clamped } = relationSegments(value);
  const status = relationStatus(clamped);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] leading-none text-destructive">♡̷</span>
      <span className="font-mono text-[13px] leading-none tracking-tight">
        <span style={{ color: status.color }}>{"█".repeat(filled)}</span>
        <span className="text-muted-foreground/40">{"░".repeat(empty)}</span>
      </span>
      <span className="text-[13px] leading-none" style={{ color: "#a3be8c" }}>
        ♡
      </span>
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
        style={{ color: status.color, background: status.bg }}
      >
        {status.label} ({clamped > 0 ? `+${clamped}` : clamped})
      </span>
    </div>
  );
}

export function RelationPanel({
  note,
  allTitles,
  onChange,
}: {
  note: Note;
  allTitles: string[];
  onChange: (relations: Relation[]) => void;
}) {
  const relations = note.relations ?? [];
  const [target, setTarget] = useState("");
  const [value, setValue] = useState(0);
  const [label, setLabel] = useState("");

  const add = () => {
    const name = target.trim();
    if (!name) return;
    onChange(upsertRelation(relations, { target: name, value, ...(label.trim() ? { label: label.trim() } : {}) }));
    setTarget("");
    setLabel("");
    setValue(0);
  };

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Beziehungen ({relations.length})
      </h2>

      <div className="card space-y-3">
        {relations.map((r) => (
          <div key={r.target} className="space-y-1.5 border-b border-border pb-3 last:border-0 last:pb-0">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {r.target}
                {r.label && <span className="ml-1 text-[11px] font-normal text-muted-foreground">· {r.label}</span>}
              </p>
              <button
                onClick={() => onChange(relations.filter((x) => x.target !== r.target))}
                className="btn-ghost shrink-0"
                aria-label={`${r.target} entfernen`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <RelationBar value={r.value} />
            <input
              type="range"
              min={-10}
              max={10}
              step={1}
              value={r.value}
              onChange={(e) => onChange(upsertRelation(relations, { ...r, value: Number(e.target.value) }))}
              className="w-full accent-primary"
              aria-label={`Beziehungswert zu ${r.target}`}
            />
          </div>
        ))}

        {!relations.length && (
          <p className="text-xs text-muted-foreground">Noch keine Verknüpfungen — verlinke NSCs, Fraktionen oder Charaktere.</p>
        )}

        <div className="space-y-2 border-t border-border pt-3">
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            list="relation-targets"
            placeholder="Notiz / NSC verlinken …"
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Beziehungsziel"
          />
          <datalist id="relation-targets">
            {allTitles.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Art der Beziehung (optional) …"
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Beziehungsart"
          />
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={-10}
              max={10}
              step={1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="flex-1 accent-primary"
              aria-label="Beziehungswert"
            />
            <span className="w-8 text-right font-mono text-xs text-foreground">{value > 0 ? `+${value}` : value}</span>
            <button onClick={add} className="btn-primary shrink-0">
              <Plus className="size-3.5" /> Add
            </button>
          </div>
          <RelationBar value={value} />
        </div>
      </div>
    </section>
  );
}
