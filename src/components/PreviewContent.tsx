import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CsvTable } from "@/components/CsvTable";
import { renderMarkdown } from "@/lib/markdown";
import { useVault } from "@/lib/vault";

type Block = { type: "md" | "csv"; content: string; title?: string | undefined };

/** Splits the body into markdown segments and ```csv fenced blocks. */
function splitBlocks(body: string, isCsvFile: boolean): Block[] {
  if (isCsvFile) return [{ type: "csv", content: body }];
  const blocks: Block[] = [];
  const re = /```(?:csv|tsv)(?:[ \t]+([^\n]+))?\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    if (m.index > last) blocks.push({ type: "md", content: body.slice(last, m.index) });
    blocks.push({ type: "csv", content: m[2] ?? "", title: m[1]?.trim() });
    last = m.index + m[0].length;
  }
  if (last < body.length) blocks.push({ type: "md", content: body.slice(last) });
  return blocks;
}

/** Preview renderer: markdown + inline CSS/SVG, CSV tables and tap-to-navigate wikilinks. */
export function PreviewContent({ body, path }: { body: string; path?: string }) {
  const { notes } = useVault();
  const navigate = useNavigate();
  const isCsvFile = !!path && /\.(csv|tsv)$/i.test(path);
  const blocks = useMemo(() => splitBlocks(body, isCsvFile), [body, isCsvFile]);

  const resolve = (title: string) => notes.find((n) => n.title.toLowerCase() === title.toLowerCase())?.id;

  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest("a.md-wikilink") as HTMLAnchorElement | null;
    if (!link) return;
    e.preventDefault();
    const href = link.getAttribute("href") ?? "";
    const id = href.startsWith("/note/") ? href.slice("/note/".length) : undefined;
    if (id) navigate({ to: "/note/$id", params: { id } });
  };

  return (
    <div onClick={onTap}>
      {blocks.map((b, i) =>
        b.type === "csv" ? (
          <CsvTable key={i} source={b.content} title={b.title ?? path?.split("/").pop()} />
        ) : (
          <article
            key={i}
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(b.content, resolve) }}
          />
        ),
      )}
    </div>
  );
}
