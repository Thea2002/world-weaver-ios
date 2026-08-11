export type CsvData = { headers: string[]; rows: string[][] };

/** Minimal RFC4180-ish CSV/TSV parser with quote support and auto delimiter detection. */
export function parseCsv(text: string, delimiter?: string): CsvData {
  const src = text.replace(/\r\n?/g, "\n").trim();
  const d = delimiter ?? detectDelimiter(src);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === d) {
      row.push(field.trim());
      field = "";
    } else if (c === "\n") {
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field.trim());
  rows.push(row);

  const [head, ...body] = rows.filter((r) => r.some((v) => v !== ""));
  const headers = head ?? [];
  return {
    headers,
    rows: body.map((r) => headers.map((_, i) => r[i] ?? "")),
  };
}

function detectDelimiter(src: string) {
  const line = src.split("\n")[0] ?? "";
  const counts: [string, number][] = [";", ",", "\t", "|"].map((d) => [d, line.split(d).length - 1]);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0]![1] > 0 ? counts[0]![0] : ",";
}

export function isNumericColumn(rows: string[][], col: number) {
  const vals = rows.map((r) => r[col] ?? "").filter(Boolean);
  return vals.length > 0 && vals.every((v) => !Number.isNaN(Number(v.replace(",", "."))));
}

/** Strips [[wikilink]] syntax to the plain display value. */
export function plainCell(value: string) {
  return value.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, a: string, b?: string) => (b ?? a).trim());
}

/** Extracts the link target of a cell, if it is a wikilink. */
export function cellLinkTarget(value: string) {
  const m = value.match(/\[\[([^\]|#]+)/);
  return m ? m[1]!.trim() : undefined;
}
