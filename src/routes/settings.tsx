import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  THEMES,
  applyTheme,
  clearCustomTheme,
  getTheme,
  importCustomTheme,
  restoreCustomTheme,
  type ThemeName,
} from "@/lib/themes";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Themes & Einstellungen — Mythic Journal" },
      { name: "description", content: "Nord, Dracula, Gruvbox und Solarized wählen oder eigene JSON-, CSS- und .uss-Themes importieren." },
      { property: "og:title", content: "Themes & Einstellungen — Mythic Journal" },
      { property: "og:description", content: "Passe die App-Farben mit eigenen Theme-Dateien an." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [theme, setTheme] = useState<ThemeName>("nord");
  const [raw, setRaw] = useState("");
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    setTheme(getTheme());
    restoreCustomTheme();
  }, []);

  return (
    <AppShell title="Settings" subtitle="Themes · Vault · Rendering">
      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Presets</h2>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                clearCustomTheme();
                applyTheme(t.id);
                setTheme(t.id);
                setStatus(`${t.label} aktiv`);
              }}
              className={`card text-left ${theme === t.id ? "ring-2 ring-primary" : ""}`}
            >
              <p className="font-display text-sm font-semibold text-foreground">{t.label}</p>
              <div className="mt-2 flex gap-1">
                {t.swatch.map((c) => (
                  <span key={c} className="size-4 rounded-full border border-border" style={{ background: c }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Theme importieren (JSON / CSS / .uss)
        </h2>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={`{ "background": "#1e1e2e", "foreground": "#cdd6f4", "accent": "#89b4fa" }`}
          className="h-40 w-full rounded-xl border border-border bg-surface p-3 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              const res = importCustomTheme(raw);
              setStatus(res.error ?? `${res.applied.length} Tokens übernommen`);
            }}
            className="btn-primary"
          >
            Anwenden
          </button>
          <button
            onClick={() => {
              clearCustomTheme();
              setStatus("Custom-Theme entfernt");
            }}
            className="btn-ghost px-3"
          >
            Zurücksetzen
          </button>
        </div>
        {status && <p className="mt-2 text-xs text-muted-foreground">{status}</p>}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Phase 1</h2>
        <ul className="card space-y-1.5 text-xs text-muted-foreground">
          <li>✓ Tab-Navigation: Journal, Graph, World, Suche, Settings</li>
          <li>✓ Markdown-Editor mit Source-/Preview-Toggle</li>
          <li>✓ Preview mit Inline-CSS, SVG, Wikilinks &amp; Embeds</li>
          <li>✓ Lokaler Vault mit .md-Export</li>
        </ul>
      </section>
    </AppShell>
  );
}
