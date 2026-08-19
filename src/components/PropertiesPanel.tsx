import { ChevronRight } from "lucide-react";
import { useState } from "react";

/** Collapsible "Properties ⚜️" list used above note content. */
export function PropertiesPanel({
  entries,
  defaultOpen = false,
}: {
  entries: [string, string][];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!entries.length) return null;

  return (
    <section className="mb-4 overflow-hidden rounded-xl border border-border bg-surface">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <ChevronRight className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Properties ⚜️
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">{entries.length}</span>
      </button>
      {open && (
        <dl className="space-y-1 border-t border-border px-3 py-2.5">
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-3 text-xs">
              <dt className="w-28 shrink-0 truncate text-muted-foreground">{k}</dt>
              <dd className="min-w-0 flex-1 break-words text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
