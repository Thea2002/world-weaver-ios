import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CsvTable } from "@/components/CsvTable";
import { renderMarkdown } from "@/lib/markdown";
import { useVault, type NoteKind } from "@/lib/vault";

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

const KIND_PREFIX: Record<string, { kind: NoteKind; folder: string; emoji: string }> = {
  npc: { kind: "npc", folder: "World/NPCs", emoji: "🎭" },
  nsc: { kind: "npc", folder: "World/NPCs", emoji: "🎭" },
  char: { kind: "character", folder: "World/Characters", emoji: "👤" },
  ort: { kind: "location", folder: "World/Locations", emoji: "🗺️" },
  location: { kind: "location", folder: "World/Locations", emoji: "🗺️" },
  city: { kind: "location", folder: "World/Locations", emoji: "🏙️" },
  taverne: { kind: "location", folder: "World/Locations", emoji: "🍺" },
  shop: { kind: "location", folder: "World/Locations", emoji: "🏪" },
  faction: { kind: "faction", folder: "World/Factions", emoji: "⚔️" },
  fraktion: { kind: "faction", folder: "World/Factions", emoji: "⚔️" },
  item: { kind: "item", folder: "World/Items", emoji: "🪄" },
  deity: { kind: "deity", folder: "World/Deities", emoji: "🕯️" },
  gott: { kind: "deity", folder: "World/Deities", emoji: "🕯️" },
  monster: { kind: "creature", folder: "World/Bestiary", emoji: "🐉" },
  lore: { kind: "lore", folder: "World/Lore", emoji: "📚" },
};

/** `[[npc.Elara]]` → NPC note "Elara" in the NPC folder. */
export function parseLinkTarget(raw: string) {
  const m = raw.match(/^([a-zA-ZäöüÄÖÜ]+)[.:]\s*(.+)$/);
  const meta = m ? KIND_PREFIX[m[1]!.toLowerCase()] : undefined;
  const title = (meta ? m![2]! : raw).replace(/^["„]|["“]$/g, "").trim();
  return {
    title,
    kind: meta?.kind ?? ("note" as NoteKind),
    folder: meta?.folder ?? "World/Inbox",
    emoji: meta?.emoji ?? "📄",
  };
}

/** Preview renderer: markdown + inline CSS/SVG, CSV tables and tap-to-navigate wikilinks. */
export function PreviewContent({ body, path }: { body: string; path?: string }) {
  const { notes, create } = useVault();
  const navigate = useNavigate();
  const isCsvFile = !!path && /\.(csv|tsv)$/i.test(path);
  const blocks = useMemo(() => splitBlocks(body, isCsvFile), [body, isCsvFile]);

  const resolve = (title: string) => {
    const t = parseLinkTarget(title).title.toLowerCase();
    return notes.find((n) => n.title.toLowerCase() === title.toLowerCase() || n.title.toLowerCase() === t)?.id;
  };

  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest("a.md-wikilink") as HTMLAnchorElement | null;
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("/note/")) {
      navigate({ to: "/note/$id", params: { id: href.slice("/note/".length) } });
      return;
    }
    // Missing link → create the page on the fly (Logseq style) and open it.
    const raw = link.getAttribute("data-title") ?? link.textContent ?? "";
    if (!raw.trim()) return;
    const { title, kind, folder, emoji } = parseLinkTarget(raw);
    const note = create(kind, title, `# ${emoji} ${title}\n\n`, folder, { Typ: kind, Quelle: "Wikilink" });
    navigate({ to: "/note/$id", params: { id: note.id } });
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
