import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type MouseEvent } from "react";
import { CheckCheck, CircleDot, Link2, Maximize2, Search, ZoomIn, ZoomOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BatchExpandPanel } from "@/components/BatchExpandPanel";
import { outgoingLinks, useVault, type Note } from "@/lib/vault";

export const Route = createFileRoute("/graph")({
  head: () => ({
    meta: [
      { title: "Graph-Ansicht — Mythic Journal" },
      { name: "description", content: "Interaktive Node-Visualisierung aller Notizen und ihrer bidirektionalen Links." },
      { property: "og:title", content: "Graph-Ansicht — Mythic Journal" },
      { property: "og:description", content: "Sieh die Verbindungen zwischen Charakteren, Orten und Sessions." },
    ],
  }),
  component: GraphView,
});

type GraphNode = {
  note: Note;
  x: number;
  y: number;
  degree: number;
};

type GraphEdge = {
  source: string;
  target: string;
};

const KIND_COLORS: Record<string, string> = {
  note: "#88c0d0",
  character: "#a3be8c",
  location: "#ebcb8b",
  faction: "#bf616a",
  lore: "#b48ead",
  session: "#81a1c1",
  npc: "#88c0d0",
  deity: "#e5e9f0",
  item: "#d8dee9",
  creature: "#bf616a",
  timeline: "#d08770",
  rules: "#5e81ac",
};

const KIND_LABELS: Record<string, string> = {
  note: "Notiz",
  character: "Charakter",
  location: "Ort",
  faction: "Fraktion",
  lore: "Lore",
  session: "Session",
  npc: "NPC",
  deity: "Gottheit",
  item: "Gegenstand",
  creature: "Kreatur",
  timeline: "Zeitachse",
  rules: "Regeln",
};

function GraphView() {
  const { notes } = useVault();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [multiMode, setMultiMode] = useState(false);

  const edges = useMemo<GraphEdge[]>(() => {
    const byTitle = new Map(notes.map((note) => [note.title.toLowerCase(), note.id]));
    const seen = new Set<string>();
    const result: GraphEdge[] = [];

    for (const note of notes) {
      for (const link of outgoingLinks(note.body)) {
        const target = byTitle.get(link.toLowerCase());
        if (!target || target === note.id) continue;
        const key = [note.id, target].sort().join(":");
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ source: note.id, target });
      }
    }

    return result;
  }, [notes]);

  const degree = useMemo(() => {
    const counts = new Map<string, number>();
    for (const edge of edges) {
      counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
      counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
    }
    return counts;
  }, [edges]);

  const filteredNotes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return notes;
    return notes.filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(needle));
  }, [notes, query]);

  const graphNodes = useMemo<GraphNode[]>(() => {
    const width = 1000;
    const height = 620;
    const centerX = width / 2;
    const centerY = height / 2;
    const sorted = [...filteredNotes].sort((a, b) => {
      const degreeDiff = (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0);
      return degreeDiff || a.title.localeCompare(b.title);
    });

    return sorted.map((note, index) => {
      const ring = Math.floor(index / 12);
      const indexInRing = index % 12;
      const ringSize = Math.min(12, sorted.length - ring * 12);
      const radiusX = 170 + ring * 100;
      const radiusY = 130 + ring * 75;
      const angle = (indexInRing / Math.max(ringSize, 1)) * Math.PI * 2 - Math.PI / 2;
      return {
        note,
        x: centerX + Math.cos(angle) * radiusX,
        y: centerY + Math.sin(angle) * radiusY,
        degree: degree.get(note.id) ?? 0,
      };
    });
  }, [degree, filteredNotes]);

  const nodeById = useMemo(() => new Map(graphNodes.map((node) => [node.note.id, node])), [graphNodes]);
  const visibleIds = useMemo(() => new Set(graphNodes.map((node) => node.note.id)), [graphNodes]);
  const visibleEdges = edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  const selected = notes.find((note) => note.id === selectedId) ?? graphNodes[0]?.note;
  const selectedLinks = selected
    ? edges
        .filter((edge) => edge.source === selected.id || edge.target === selected.id)
        .map((edge) => notes.find((note) => note.id === (edge.source === selected.id ? edge.target : edge.source)))
        .filter((note): note is Note => Boolean(note))
    : [];

  const markedNotes = notes.filter((note) => markedIds.includes(note.id));

  const toggleMark = (id: string) =>
    setMarkedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));

  const selectNode = (event: MouseEvent<SVGGElement>, id: string) => {
    event.stopPropagation();
    setSelectedId(id);
    if (multiMode || event.shiftKey || event.metaKey || event.ctrlKey) toggleMark(id);
  };

  return (
    <AppShell
      title="Graph"
      subtitle={`${notes.length} Notizen · ${edges.length} Verbindungen`}
      action={
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setZoom(1);
            setSelectedId(null);
            setMarkedIds([]);
            setMultiMode(false);
          }}
          className="btn-ghost px-3"
          aria-label="Graph zurücksetzen"
        >
          <Maximize2 className="size-4" />
        </button>
      }
    >
      <div className="space-y-4">
        <div className="card space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Dein Wissensnetz</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Wikilinks verbinden Notizen automatisch.</p>
            </div>
            <span className="chip"><CircleDot className="size-3" /> Live</span>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Notizen im Graph suchen …"
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary"
              aria-label="Notizen im Graph suchen"
            />
          </label>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-inner">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between p-3">
            <div className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur">
              {filteredNotes.length} sichtbar
            </div>
            <div className="pointer-events-auto flex overflow-hidden rounded-xl border border-border bg-background/85 backdrop-blur">
              <button type="button" onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))} className="p-2 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground" aria-label="Herauszoomen">
                <ZoomOut className="size-4" />
              </button>
              <span className="border-x border-border px-2 py-2 text-[10px] tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} className="p-2 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground" aria-label="Hineinzoomen">
                <ZoomIn className="size-4" />
              </button>
            </div>
          </div>

          <svg
            viewBox="0 0 1000 620"
            className="h-[58vh] min-h-[430px] w-full"
            role="img"
            aria-label="Interaktiver Graph der Notizen"
            onClick={() => setSelectedId(null)}
          >
            <defs>
              <pattern id="graph-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
              </pattern>
              <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect width="1000" height="620" fill="url(#graph-grid)" />
            <g transform={`translate(${500 - 500 * zoom} ${310 - 310 * zoom}) scale(${zoom})`}>
              {visibleEdges.map((edge) => {
                const source = nodeById.get(edge.source);
                const target = nodeById.get(edge.target);
                if (!source || !target) return null;
                const active = selected?.id === edge.source || selected?.id === edge.target;
                return <line key={`${edge.source}-${edge.target}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} className={active ? "stroke-primary" : "stroke-border"} strokeWidth={active ? 2.5 : 1.2} strokeOpacity={active ? 0.9 : 0.65} />;
              })}
              {graphNodes.map(({ note, x, y, degree: nodeDegree }) => {
                const active = selected?.id === note.id;
                const color = KIND_COLORS[note.kind] ?? KIND_COLORS["note"];
                const radius = 13 + Math.min(nodeDegree, 5) * 2;
                return (
                  <g key={note.id} transform={`translate(${x} ${y})`} onClick={(event) => selectNode(event, note.id)} className="cursor-pointer">
                    {active && <circle r={radius + 8} fill={color} opacity="0.16" filter="url(#node-glow)" />}
                    <circle r={radius} fill={color} fillOpacity={active ? 1 : 0.82} stroke="hsl(var(--background))" strokeWidth={active ? 4 : 2} />
                    <text y={radius + 17} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">{note.title.length > 22 ? `${note.title.slice(0, 21)}…` : note.title}</text>
                    {nodeDegree > 0 && <text y="4" textAnchor="middle" className="fill-background text-[10px] font-bold">{nodeDegree}</text>}
                  </g>
                );
              })}
            </g>
          </svg>

          {!graphNodes.length && (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              <div><Search className="mx-auto size-6 text-muted-foreground" /><p className="mt-2 text-sm font-medium text-foreground">Keine passende Notiz</p><p className="mt-1 text-xs text-muted-foreground">Versuche einen anderen Suchbegriff.</p></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="card p-3"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Nodes</p><p className="mt-1 font-display text-xl font-bold text-foreground">{notes.length}</p></div>
          <div className="card p-3"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Links</p><p className="mt-1 font-display text-xl font-bold text-foreground">{edges.length}</p></div>
          <div className="card p-3"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Cluster</p><p className="mt-1 font-display text-xl font-bold text-foreground">{new Set(notes.map((note) => note.kind)).size}</p></div>
        </div>

        {selected && (
          <section className="card animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: KIND_COLORS[selected.kind] ?? KIND_COLORS["note"] }} /><p className="truncate font-display text-base font-semibold text-foreground">{selected.title}</p></div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{KIND_LABELS[selected.kind] ?? "Notiz"} · {selected.path}</p>
              </div>
              <button type="button" onClick={() => navigate({ to: "/note/$id", params: { id: selected.id } })} className="btn-primary shrink-0 px-3 py-2 text-xs">Öffnen</button>
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{selected.body.replace(/[#*`>]|<[^>]*>/g, "").trim() || "Noch kein Inhalt."}</p>
            {selectedLinks.length > 0 && <div className="mt-4 border-t border-border pt-3"><p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><Link2 className="size-3" /> Verknüpft mit</p><div className="flex flex-wrap gap-1.5">{selectedLinks.slice(0, 6).map((note) => <button key={note.id} type="button" onClick={() => setSelectedId(note.id)} className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-foreground transition hover:border-primary">{note.title}</button>)}</div></div>}
          </section>
        )}

        <p className="px-1 text-xs text-muted-foreground">Klicke einen Node, um seine Verbindungen und Inhalte zu sehen. Links entstehen automatisch aus <span className="font-mono text-primary">[[Wikilinks]]</span>.</p>
      </div>
    </AppShell>
  );
}