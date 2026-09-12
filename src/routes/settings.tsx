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
  applyRemoteTheme,
  restoreRemoteTheme,
  clearRemoteTheme,
  getRemoteTheme,
  extractThemeUrls,
  REMOTE_PRESETS,
  type ThemeName,
} from "@/lib/themes";
import { loadNotionConfig, saveNotionConfig, searchNotionDatabase } from "@/lib/notion-client";
import { useNotionSync } from "@/lib/notion-sync";
import { RefreshCw, Database, Key, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";


export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Themes & Einstellungen \u2014 Mythic Journal" },
      { name: "description", content: "Nord, Dracula, Gruvbox und Solarized w\u00e4hlen oder eigene JSON-, CSS- und .uss-Themes importieren." },
      { property: "og:title", content: "Themes & Einstellungen \u2014 Mythic Journal" },
      { property: "og:description", content: "Passe die App-Farben mit eigenen Theme-Dateien an." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [theme, setTheme] = useState<ThemeName>("nord");
  const [raw, setRaw] = useState("");
  const [status, setStatus] = useState<string>();
  const [url, setUrl] = useState("");
  const [remote, setRemote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbQuery, setDbQuery] = useState("");
  const [dbResults, setDbResults] = useState<Array<{ id: string; title: string }>>([]);
  const [dbSearchLoading, setDbSearchLoading] = useState(false);
  
  // Notion Sync
  const notionSync = useNotionSync();

  const loadRemote = async (raw: string) => {
    const target = extractThemeUrls(raw)[0] ?? raw.trim();
    if (!/^https?:\/\//i.test(target)) {
      setStatus("Bitte eine Theme-URL oder ein @import-Statement einf\u00fcgen.");
      return;
    }
    setLoading(true);
    const res = await applyRemoteTheme(target);
    setLoading(false);
    setRemote(target);
    setStatus(res.error ?? `Remote-Theme geladen \u00b7 ${res.applied.length} Tokens \u00fcbernommen`);
  };

  useEffect(() => {
    setTheme(getTheme());
    restoreCustomTheme();
    restoreRemoteTheme();
    setRemote(getRemoteTheme());
  }, []);

  // Suche nach Notion-Datenbanken
  const searchDatabases = async () => {
    if (!dbQuery.trim()) return;
    setDbSearchLoading(true);
    try {
      const results = await searchNotionDatabase(dbQuery);
      if (results) {
        setDbResults(
          results.map((db) => ({
            id: db.id,
            title: db.title?.[0]?.title?.[0]?.plain_text || "Unbenannte Datenbank",
          }))
        );
      }
    } catch (error) {
      console.error("Fehler bei der Datenbanksuche:", error);
    } finally {
      setDbSearchLoading(false);
    }
  };

  // Aktiviere/deaktiviere Notion-Sync
  const toggleNotionSync = (enabled: boolean) => {
    const config = loadNotionConfig();
    saveNotionConfig({ ...config, isEnabled: enabled });
    notionSync.setConfig({ isEnabled: enabled });
  };

  // Speichere API-Key
  const saveApiKey = (key: string) => {
    const config = loadNotionConfig();
    saveNotionConfig({ ...config, apiKey: key });
    notionSync.setConfig({ apiKey: key });
  };

  // Speichere Datenbank-ID
  const saveDatabaseId = (id: string) => {
    const config = loadNotionConfig();
    saveNotionConfig({ ...config, databaseId: id });
    notionSync.setConfig({ databaseId: id });
  };

  // Toggle Auto-Sync
  const toggleAutoSync = (enabled: boolean) => {
    const config = loadNotionConfig();
    saveNotionConfig({ ...config, autoSync: enabled });
    notionSync.setConfig({ autoSync: enabled });
  };

  return (
    <AppShell title="Settings" subtitle="Themes \u00b7 Vault \u00b7 Rendering">
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
          Logseq-Themes (Ein-Tap, wird gespeichert)
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {REMOTE_PRESETS.map((p) => (
            <button
              key={p.url}
              onClick={() => void loadRemote(p.url)}
              disabled={loading}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                remote === p.url ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface-2 text-muted-foreground"
              }`}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Theme per URL / @import
        </h2>
        <textarea
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={`@import url('https://cdn.jsdelivr.net/gh/sansui233/logseq-bonofix-theme/custom.css');`}
          className="h-24 w-full rounded-xl border border-border bg-surface p-3 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground"
          aria-label="Theme-URL"
        />
        <div className="mt-2 flex gap-2">
          <button onClick={() => void loadRemote(url)} disabled={loading} className="btn-primary">
            {loading ? "Lade\u2026" : "Laden"}
          </button>
          <button
            onClick={() => {
              clearRemoteTheme();
              clearCustomTheme();
              setRemote(null);
              setStatus("Remote-Theme entfernt");
            }}
            className="btn-ghost px-3"
          >
            Entfernen
          </button>
        </div>
        {remote && <p className="mt-2 break-all text-[11px] text-muted-foreground">Aktiv: {remote}</p>}
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
              setStatus(res.error ?? `${res.applied.length} Tokens \u00fcbernommen`);
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
            Zur\u00fccksetzen
          </button>
        </div>
        {status && <p className="mt-2 text-xs text-muted-foreground">{status}</p>}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Notion Sync
        </h2>
        <div className="card space-y-4">
          {/* Verbindung status */}
          <div className="flex items-center gap-3">
            <div className={`size-3 rounded-full ${notionSync.isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <div>
              <p className="text-sm font-medium text-foreground">
                {notionSync.isConnected ? "Verbunden mit Notion" : "Nicht verbunden"}
              </p>
              <p className="text-xs text-muted-foreground">
                {notionSync.config.isEnabled ? "Sync aktiviert" : "Sync deaktiviert"}
              </p>
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Key className="size-3" /> Notion API Key
            </label>
            <input
              type="password"
              value={notionSync.config.apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
              placeholder="ntn_..."
              className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Database Suche */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Database className="size-3" /> Notion Datenbank
            </label>
            <div className="flex gap-2">
              <input
                value={dbQuery}
                onChange={(e) => setDbQuery(e.target.value)}
                placeholder="Datenbankname suchen..."
                className="flex-1 rounded-xl border border-border bg-surface p-3 text-xs text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={searchDatabases}
                disabled={dbSearchLoading || !dbQuery.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {dbSearchLoading ? <Loader2 className="size-4 animate-spin" /> : "Suchen"}
              </button>
            </div>
            {dbResults.length > 0 && (
              <div className="max-h-32 overflow-y-auto border border-border rounded-xl bg-surface p-2">
                {dbResults.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => {
                      saveDatabaseId(db.id);
                      setDbQuery("");
                      setDbResults([]);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-2 text-xs text-foreground truncate"
                  >
                    {db.title}
                  </button>
                ))}
              </div>
            )}
            {notionSync.config.databaseId && (
              <p className="text-xs text-muted-foreground">
                Ausgew\u00e4hlt: {notionSync.config.databaseId.slice(0, 8)}...
              </p>
            )}
          </div>

          {/* Sync Optionen */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notionSync.config.isEnabled}
                onChange={(e) => toggleNotionSync(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface text-primary"
              />
              <span className="text-sm text-foreground">Notion Sync aktivieren</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notionSync.config.autoSync}
                onChange={(e) => toggleAutoSync(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface text-primary"
              />
              <span className="text-sm text-foreground">Automatisch alle 5 Minuten syncen</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => notionSync.performSync("pull")}
                disabled={notionSync.isSyncing || !notionSync.isConnected}
                className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Loader2 className={`size-4 ${notionSync.isSyncing ? "animate-spin" : "hidden"}`} />
                <span>Von Notion laden</span>
              </button>
              <button
                onClick={() => notionSync.performSync("push")}
                disabled={notionSync.isSyncing || !notionSync.isConnected}
                className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Loader2 className={`size-4 ${notionSync.isSyncing ? "animate-spin" : "hidden"}`} />
                <span>Zu Notion pushen</span>
              </button>
              <button
                onClick={() => notionSync.performSync("both")}
                disabled={notionSync.isSyncing || !notionSync.isConnected}
                className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`size-4 ${notionSync.isSyncing ? "animate-spin" : ""}`} />
                <span>Beides</span>
              </button>
            </div>

            {/* Sync Status */}
            {notionSync.lastSyncError && (
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle className="size-3" />
                <span>{notionSync.lastSyncError}</span>
              </div>
            )}
            {notionSync.syncStats && notionSync.syncStats.fromNotion > 0 && (
              <div className="flex items-center gap-2 text-green-500 text-xs">
                <CheckCircle className="size-3" />
                <span>
                  {notionSync.syncStats.fromNotion} Notizen von Notion geladen
                  {notionSync.syncStats.toNotion > 0 && 
                    `, ${notionSync.syncStats.toNotion} zu Notion gesendet`}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Phase 1</h2>
        <ul className="card space-y-1.5 text-xs text-muted-foreground">
          <li>\u2713 Tab-Navigation: Journal, Graph, World, Suche, Settings</li>
          <li>\u2713 Markdown-Editor mit Source-/Preview-Toggle</li>
          <li>\u2713 Preview mit Inline-CSS, SVG, Wikilinks & Embeds</li>
          <li>\u2713 Lokaler Vault mit .md-Export</li>
          <li>\u2713 Notion Sync Integration</li>
        </ul>
      </section>
    </AppShell>
  );
}
