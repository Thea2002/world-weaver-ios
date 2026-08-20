import { useEffect, useMemo, useRef, useState } from "react";
import { PreviewContent } from "@/components/PreviewContent";
import { PropertiesPanel } from "@/components/PropertiesPanel";

type Chunk = { start: number; end: number; text: string; isFrontmatter: boolean };

/** Splits markdown into editable blocks (paragraph-ish), keeping fences and frontmatter intact. */
function chunk(src: string): Chunk[] {
  const lines = src.split("\n");
  const ranges: { start: number; end: number }[] = [];
  let cur: number | null = null;
  let fence = false;

  lines.forEach((l, i) => {
    if (/^\s*```/.test(l)) {
      if (cur === null) cur = i;
      fence = !fence;
      if (!fence) {
        ranges.push({ start: cur, end: i });
        cur = null;
      }
      return;
    }
    if (fence) return;
    if (l.trim() === "") {
      if (cur !== null) {
        ranges.push({ start: cur, end: i - 1 });
        cur = null;
      }
      return;
    }
    if (cur === null) cur = i;
  });
  if (cur !== null) ranges.push({ start: cur, end: lines.length - 1 });

  return ranges.map((r) => {
    const text = lines.slice(r.start, r.end + 1).join("\n");
    return { ...r, text, isFrontmatter: /^---\s*$/.test(lines[r.start] ?? "") && /:/.test(lines[r.start + 1] ?? "") };
  });
}

function replaceRange(src: string, start: number, end: number, text: string) {
  const lines = src.split("\n");
  lines.splice(start, end - start + 1, ...text.split("\n"));
  return lines.join("\n");
}

function frontmatterEntries(text: string): [string, string][] {
  return text
    .split("\n")
    .slice(1, -1)
    .map((l) => l.match(/^([^:]+):\s*(.*)$/))
    .filter(Boolean)
    .map((m) => [m![1]!.trim(), m![2]!.trim().replace(/^["[]|["\]]$/g, "")] as [string, string]);
}

/** Obsidian-style live preview: formatted by default, tap a block to edit its markdown source. */
export function LiveEditor({
  body,
  path,
  onChange,
  hideFrontmatter = false,
}: {
  body: string;
  path?: string | undefined;
  onChange: (value: string) => void;
  hideFrontmatter?: boolean;
}) {
  const chunks = useMemo(() => chunk(body), [body]);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (editing === null || !el) return;
    el.focus();
    el.style.height = `${el.scrollHeight}px`;
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  const commit = (c: Chunk) => {
    if (draft !== c.text) onChange(replaceRange(body, c.start, c.end, draft));
    setEditing(null);
  };

  const open = (c: Chunk, i: number) => {
    setDraft(c.text);
    setEditing(i);
  };

  return (
    <div className="live-editor">
      {chunks.map((c, i) =>
        editing === i ? (
          <textarea
            key={`e-${c.start}`}
            ref={ref}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onBlur={() => commit(c)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                commit(c);
              }
            }}
            spellCheck={false}
            className="live-block-input"
            aria-label="Markdown Quelltext dieses Blocks"
          />
        ) : c.isFrontmatter ? (
          hideFrontmatter ? null : (
            <div key={`f-${c.start}`} onDoubleClick={() => open(c, i)}>
              <PropertiesPanel entries={frontmatterEntries(c.text)} />
            </div>
          )
        ) : (
          <div key={`p-${c.start}`} className="live-block" onClick={() => open(c, i)}>
            <PreviewContent body={c.text} path={path} />
          </div>
        ),
      )}

      <button
        onClick={() => {
          const next = `${body.replace(/\s*$/, "")}\n\n`;
          onChange(`${next}Neuer Absatz…`);
          setDraft("Neuer Absatz…");
          setEditing(chunks.length);
        }}
        className="mt-2 w-full rounded-xl border border-dashed border-border px-3 py-2 text-left text-xs text-muted-foreground"
      >
        + Block hinzufügen
      </button>
    </div>
  );
}
