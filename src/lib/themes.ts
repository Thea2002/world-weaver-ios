export type ThemeName = "nord" | "dracula" | "gruvbox" | "solarized";

export const THEMES: { id: ThemeName; label: string; swatch: string[] }[] = [
  { id: "nord", label: "Nord", swatch: ["#2e3440", "#88c0d0", "#a3be8c", "#bf616a"] },
  { id: "dracula", label: "Dracula", swatch: ["#282a36", "#bd93f9", "#50fa7b", "#ff79c6"] },
  { id: "gruvbox", label: "Gruvbox", swatch: ["#282828", "#fabd2f", "#b8bb26", "#fb4934"] },
  { id: "solarized", label: "Solarized", swatch: ["#002b36", "#268bd2", "#859900", "#cb4b16"] },
];

const THEME_KEY = "mythic:theme";
const CUSTOM_KEY = "mythic:custom-theme";
const REMOTE_KEY = "mythic:remote-theme";
const REMOTE_ID = "mythic-remote-theme";

/** Extracts URLs from `@import url('…')`, `@import "…"` or a bare URL. */
export function extractThemeUrls(raw: string): string[] {
  const urls = new Set<string>();
  for (const m of raw.matchAll(/@import\s+(?:url\(\s*)?['"]?(https?:\/\/[^'")\s]+)['"]?\s*\)?/gi)) {
    urls.add(m[1]!);
  }
  if (!urls.size) {
    for (const m of raw.matchAll(/https?:\/\/\S+\.(?:css|uss)(?:\?\S*)?/gi)) urls.add(m[0]!);
  }
  return [...urls];
}

/** Loads remote CSS via <link>, then maps recognised color vars onto our tokens. */
const TOKENS = ["--background", "--foreground", "--surface", "--primary", "--secondary", "--destructive"];

export async function applyRemoteTheme(url: string): Promise<{ error?: string; applied: string[] }> {
  if (typeof document === "undefined") return { applied: [] };
  // Snapshot the currently effective tokens: a remote stylesheet may define the same
  // variable names and would otherwise repaint the app with unreadable colors.
  const computed = getComputedStyle(document.documentElement);
  const fallback = Object.fromEntries(TOKENS.map((t) => [t, computed.getPropertyValue(t).trim()]));

  document.getElementById(REMOTE_ID)?.remove();
  const link = document.createElement("link");
  link.id = REMOTE_ID;
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
  localStorage.setItem(REMOTE_KEY, url);

  const pinFallback = () => {
    const pinned: Record<string, string> = {};
    for (const [t, v] of Object.entries(fallback)) {
      if (!v) continue;
      document.documentElement.style.setProperty(t, v);
      pinned[t] = v;
    }
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(pinned));
  };

  try {
    const res = await fetch(url);
    if (!res.ok) {
      pinFallback();
      return { applied: [], error: `Stylesheet geladen, Farben nicht lesbar (${res.status}).` };
    }
    const css = await res.text();
    const mapped = importCustomTheme(css);
    // Only keep the token mapping when we got a readable background/foreground pair.
    if (!(mapped.applied.includes("--background") && mapped.applied.includes("--foreground"))) {
      clearCustomTheme();
      pinFallback();
      return { applied: [], error: "Stylesheet eingebunden — Farbpalette unklar, Preset-Farben bleiben aktiv." };
    }
    return { applied: mapped.applied };
  } catch {
    pinFallback();
    return { applied: [], error: "Stylesheet eingebunden, Farb-Mapping fehlgeschlagen (CORS)." };
  }
}

export function restoreRemoteTheme() {
  if (typeof localStorage === "undefined") return;
  const url = localStorage.getItem(REMOTE_KEY);
  if (!url || document.getElementById(REMOTE_ID)) return;
  const link = document.createElement("link");
  link.id = REMOTE_ID;
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

export function getRemoteTheme(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(REMOTE_KEY);
}

export function clearRemoteTheme() {
  if (typeof document === "undefined") return;
  document.getElementById(REMOTE_ID)?.remove();
  localStorage.removeItem(REMOTE_KEY);
}

export function applyTheme(name: ThemeName) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset["theme"] = name;
  localStorage.setItem(THEME_KEY, name);
}

export function getTheme(): ThemeName {
  if (typeof localStorage === "undefined") return "nord";
  return (localStorage.getItem(THEME_KEY) as ThemeName) ?? "nord";
}

/** Accepts raw JSON, CSS or .uss text and maps recognised keys onto design tokens. */
export function importCustomTheme(raw: string): { applied: string[]; error?: string } {
  const pairs: Record<string, string> = {};
  const trimmed = raw.trim();

  try {
    if (trimmed.startsWith("{")) {
      const flatten = (obj: unknown, prefix = "") => {
        if (!obj || typeof obj !== "object") return;
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          if (typeof v === "string") pairs[(prefix + k).toLowerCase()] = v;
          else flatten(v, prefix + k + ".");
        }
      };
      flatten(JSON.parse(trimmed));
    } else {
      for (const m of trimmed.matchAll(/([-\w.]+)\s*:\s*([^;{}\n]+)/g)) {
        pairs[m[1]!.replace(/^--/, "").toLowerCase()] = m[2]!.trim();
      }
    }
  } catch {
    return { applied: [], error: "Konnte Theme nicht parsen (JSON/CSS erwartet)." };
  }

  const find = (...keys: string[]) => {
    for (const key of keys) {
      const hit = Object.keys(pairs).find((p) => p.endsWith(key));
      if (hit && /^(#|rgb|hsl|oklch)/i.test(pairs[hit]!)) return pairs[hit]!;
    }
    return undefined;
  };

  const map: [string, string | undefined][] = [
    [
      "--background",
      find("primary-background-color", "main-background-color", "background", "bg", "base00", "editor.background"),
    ],
    ["--foreground", find("primary-text-color", "title-text-color", "foreground", "fg", "text", "base05")],
    [
      "--surface",
      find("secondary-background-color", "tertiary-background-color", "surface", "panel", "sidebar", "base01"),
    ],
    ["--primary", find("accent", "primary", "blue", "base0d")],
    ["--secondary", find("secondary", "green", "base0b")],
    ["--destructive", find("error", "red", "base08")],
  ];

  const applied: string[] = [];
  const style: Record<string, string> = {};
  for (const [token, value] of map) {
    if (!value) continue;
    document.documentElement.style.setProperty(token, value);
    style[token] = value;
    applied.push(token);
  }
  if (!applied.length) return { applied, error: "Keine bekannten Farbwerte gefunden." };
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(style));
  return { applied };
}

export function restoreCustomTheme() {
  if (typeof localStorage === "undefined") return;
  const raw = localStorage.getItem(CUSTOM_KEY);
  if (!raw) return;
  try {
    for (const [k, v] of Object.entries(JSON.parse(raw) as Record<string, string>)) {
      document.documentElement.style.setProperty(k, v);
    }
  } catch {
    /* ignore */
  }
}

export function clearCustomTheme() {
  localStorage.removeItem(CUSTOM_KEY);
  for (const t of ["--background", "--foreground", "--surface", "--primary", "--secondary", "--destructive"]) {
    document.documentElement.style.removeProperty(t);
  }
}
