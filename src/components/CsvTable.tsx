import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowDownAZ, ArrowUpAZ, Share2, Filter } from "lucide-react";
import { parseCsv, isNumericColumn, plainCell, cellLinkTarget } from "@/lib/csv";
import { useVault } from "@/lib/vault";

/** Renders CSV text as a sortable + filterable table; each row links into the graph. */
export function CsvTable({ source, title }: { source: string; title?: string | undefined }) {
  const { headers, rows } = useMemo(() => parseCsv(source), [source]);
  const { notes, create } = useVault();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = q ? rows.filter((r) => r.some((c) => plainCell(c).toLowerCase().includes(q))) : rows.slice();
    if (sort) {
      const numeric = isNumericColumn(rows, sort.col);
      out.sort((a, b) => {
        const x = plainCell(a[sort.col] ?? "");
        const y = plainCell(b[sort.col] ?? "");
        const cmp = numeric
          ? Number(x.replace(",", ".")) - Number(y.replace(",", "."))
          : x.localeCompare(y, "de");
        return cmp * sort.dir;
      });
    }
    return out;
  }, [rows, query, sort]);

  const openRow = (row: string[]) => {
    const raw = row[0] ?? "";
    const name = (cellLinkTarget(raw) ?? plainCell(raw)).trim();
    if (!name) return;
    const existing = notes.find((n) => n.title.toLowerCase() === name.toLowerCase());
    if (existing) {
      navigate({ to: "/note/$id", params: { id: existing.id } });
      return;
    }
    const fields = headers
      .map((h, i) => `| ${h || `Feld ${i + 1}`} | ${plainCell(row[i] ?? "")} |`)
      .join("\n");
    const body = `# ${name}\n\n> [!info] Aus CSV${title ? ` · ${title}` : ""}\n\n| Feld | Wert |\n| --- | --- |\n${fields}\n\n## Verknüpfungen\n- [[${title ?? "CSV"}]]\n`;
    const note = create("note", name, body, "World/CSV");
    navigate({ to: "/note/$id", params: { id: note.id } });
  };

  if (!headers.length) return null;

  return (
    <div className="csv-block">
      <div className="flex items-center gap-2 px-1 pb-2">
        <Filter className="size-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`${rows.length} Zeilen filtern…`}
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs text-foreground outline-none placeholder:text-muted-foreground"
          aria-label="CSV filtern"
        />
        <span className="chip">{visible.length}</span>
      </div>

      <div className="csv-scroll">
        <table className="csv-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>
                  <button
                    type="button"
                    onClick={() =>
                      setSort((s) => (s?.col === i ? { col: i, dir: s.dir === 1 ? -1 : 1 } : { col: i, dir: 1 }))
                    }
                    className="flex items-center gap-1"
                  >
                    {h || `Feld ${i + 1}`}
                    {sort?.col === i &&
                      (sort.dir === 1 ? <ArrowDownAZ className="size-3" /> : <ArrowUpAZ className="size-3" />)}
                  </button>
                </th>
              ))}
              <th aria-label="Graph" />
            </tr>
          </thead>
          <tbody>
            {visible.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci}>{plainCell(c)}</td>
                ))}
                <td>
                  <button
                    type="button"
                    onClick={() => openRow(r)}
                    className="btn-ghost !px-1.5 !py-1"
                    aria-label="Zeile im Graph öffnen"
                  >
                    <Share2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 px-1 text-[11px] text-muted-foreground">
        Spalte antippen zum Sortieren · Icon öffnet bzw. erstellt die verknüpfte Notiz.
      </p>
    </div>
  );
}
