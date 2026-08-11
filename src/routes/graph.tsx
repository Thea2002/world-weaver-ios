import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { AppShell } from "@/components/AppShell";
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

type Node = { id: string; title: string; x: number; y: number; vx: number; vy: number; deg: number };

function GraphView() {
  const { notes } = useVault();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const nodesRef = useRef<Node[]>([]);

  const edges = useMemo(() => {
    const byTitle = new Map(notes.map((n) => [n.title.toLowerCase(), n.id]));
    const list: [string, string][] = [];
    for (const n of notes) {
      for (const link of outgoingLinks(n.body)) {
        const target = byTitle.get(link.toLowerCase());
        if (target && target !== n.id) list.push([n.id, target]);
      }
    }
    return list;
  }, [notes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !notes.length) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const css = getComputedStyle(document.documentElement);
    const primary = css.getPropertyValue("--primary").trim() || "#88c0d0";
    const line = css.getPropertyValue("--border").trim() || "#4c566a";
    const fg = css.getPropertyValue("--foreground").trim() || "#eceff4";

    nodesRef.current = notes.map((n, i) => {
      const a = (i / notes.length) * Math.PI * 2;
      return {
        id: n.id,
        title: n.title,
        x: w / 2 + Math.cos(a) * Math.min(w, h) * 0.3,
        y: h / 2 + Math.sin(a) * Math.min(w, h) * 0.3,
        vx: 0,
        vy: 0,
        deg: edges.filter(([s, t]) => s === n.id || t === n.id).length,
      };
    });

    let raf = 0;
    const step = () => {
      const nodes = nodesRef.current;
      for (const a of nodes) {
        for (const b of nodes) {
          if (a === b) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = Math.max(dx * dx + dy * dy, 100);
          const f = 2200 / d2;
          a.vx += (dx / Math.sqrt(d2)) * f;
          a.vy += (dy / Math.sqrt(d2)) * f;
        }
        a.vx += (w / 2 - a.x) * 0.004;
        a.vy += (h / 2 - a.y) * 0.004;
      }
      const map = new Map(nodes.map((n) => [n.id, n]));
      for (const [s, t] of edges) {
        const a = map.get(s);
        const b = map.get(t);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - 110) * 0.01;
        a.vx += (dx / d) * f;
        a.vy += (dy / d) * f;
        b.vx -= (dx / d) * f;
        b.vy -= (dy / d) * f;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      for (const [s, t] of edges) {
        const a = map.get(s);
        const b = map.get(t);
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (const n of nodes) {
        n.x += n.vx *= 0.82;
        n.y += n.vy *= 0.82;
        n.x = Math.min(w - 16, Math.max(16, n.x));
        n.y = Math.min(h - 26, Math.max(20, n.y));
        const r = 6 + Math.min(n.deg, 5) * 2;
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = fg;
        ctx.font = "10px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.fillText(n.title.slice(0, 18), n.x, n.y + r + 11);
      }
      raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, [notes, edges]);

  const onTap = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hit = nodesRef.current.find((n) => Math.hypot(n.x - x, n.y - y) < 18);
    if (hit) navigate({ to: "/note/$id", params: { id: hit.id } });
  };

  return (
    <AppShell title="Graph" subtitle={`${notes.length} Nodes · ${edges.length} Links`}>
      <canvas
        ref={canvasRef}
        onClick={onTap}
        className="h-[62vh] w-full rounded-2xl border border-border bg-surface"
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Tippe auf einen Node, um die Notiz zu öffnen. Links entstehen automatisch aus [[Wikilinks]].
      </p>
    </AppShell>
  );
}
