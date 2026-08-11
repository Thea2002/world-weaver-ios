import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({ gfm: true, breaks: true });

const CALLOUT_ICONS: Record<string, string> = {
  info: "ℹ️",
  danger: "⚠️",
  warning: "⚠️",
  tip: "💡",
  note: "📝",
  quote: "❝",
  statblock: "📊",
  success: "✅",
};

/** Converts Obsidian-style `> [!info] Title` callouts into styled blocks. */
function renderCallouts(source: string) {
  return source.replace(
    /^> \[!(\w+)(?:\|([^\]]+))?\][ \t]*(.*)((?:\n> .*)*)/gm,
    (_m, kind: string, variant: string | undefined, title: string, rest: string) => {
      const k = kind.toLowerCase();
      const bodyLines = (rest || "")
        .split("\n")
        .map((l) => l.replace(/^> ?/, ""))
        .filter((l) => l.trim() !== "");
      const body = bodyLines.length ? `<p>${bodyLines.join("<br/>")}</p>` : "";
      const label = title.trim() || k.charAt(0).toUpperCase() + k.slice(1);
      return `<div class="md-callout md-callout-${k}${variant ? " md-callout-statblock" : ""}"><p class="md-callout-title">${CALLOUT_ICONS[k] ?? "•"} ${label}</p>${body}</div>`;
    },
  );
}

/** Renders markdown with [[wikilinks]], ![[embeds]], callouts, inline CSS and SVG support. */
export function renderMarkdown(source: string, resolve?: (title: string) => string | undefined) {
  const withLinks = renderCallouts(source)
    .replace(/!\[\[([^\]]+)\]\]/g, (_m, target: string) => {
      const [name] = target.split("|");
      return `<blockquote class="md-embed"><strong>Embed:</strong> ${name!.trim()}</blockquote>`;
    })
    .replace(/\[\[([^\]]+)\]\]/g, (_m, target: string) => {
      const [name, alias] = target.split("|");
      const title = name!.trim();
      const id = resolve?.(title);
      return `<a class="md-wikilink${id ? "" : " md-wikilink-missing"}" href="${id ? `/note/${id}` : "#"}">${(alias ?? title).trim()}</a>`;
    });

  const html = marked.parse(withLinks, { async: false }) as string;


  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    ADD_ATTR: ["style", "target", "class", "viewBox", "role", "aria-label"],
  });
}

/** Lightweight markdown syntax highlighting for the source editor overlay. */
export function highlightMarkdown(source: string) {
  const esc = source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return esc
    .replace(/^(#{1,6} .*)$/gm, '<span class="tok-heading">$1</span>')
    .replace(/^(&gt; .*)$/gm, '<span class="tok-quote">$1</span>')
    .replace(/^(\s*(?:[-*+]|\d+\.) )/gm, '<span class="tok-list">$1</span>')
    .replace(/(\[\[[^\]]+\]\])/g, '<span class="tok-link">$1</span>')
    .replace(/(\*\*[^*\n]+\*\*)/g, '<span class="tok-strong">$1</span>')
    .replace(/(`[^`\n]+`)/g, '<span class="tok-code">$1</span>')
    .replace(/(&lt;\/?[a-zA-Z][^&]*&gt;)/g, '<span class="tok-tag">$1</span>');
}
