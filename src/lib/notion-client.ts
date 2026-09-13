import { notionProxy } from "./notion.functions";

// Typen für Notion-Datenbanken
interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  url: string;
  properties: Record<string, any>;
}

interface NotionDatabase {
  id: string;
  title: { type: "title"; title: { plain_text: string }[] }[];
  properties: Record<string, any>;
}

// Konfiguration für die Notion-Integration
export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  isEnabled: boolean;
  autoSync: boolean;
  lastSyncTime: number | null;
}

const CONFIG_KEY = "mythic:notion:config";

/** Speichert die Notion-Konfiguration im localStorage */
export function saveNotionConfig(config: NotionConfig): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
}

/** Lädt die Notion-Konfiguration aus dem localStorage */
export function loadNotionConfig(): NotionConfig {
  const fallback: NotionConfig = {
    apiKey: "",
    databaseId: "",
    isEnabled: false,
    autoSync: false,
    lastSyncTime: null,
  };
  if (typeof localStorage === "undefined") {
    return fallback;
  }
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as NotionConfig;
  } catch {
    return fallback;
  }
}

/** Ruft die Notion-API über den Server-Proxy auf (Browser-Aufrufe scheitern an CORS) */
async function notionRequest(
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: unknown
): Promise<any | null> {
  const config = loadNotionConfig();
  if (!config.apiKey || !config.isEnabled) {
    return null;
  }
  try {
    return await notionProxy({ data: { apiKey: config.apiKey, path, method, body } });
  } catch (error) {
    console.error("Notion-Anfrage fehlgeschlagen:", error);
    throw error;
  }
}

/** Sucht nach einer Notion-Datenbank */
export async function searchNotionDatabase(query: string): Promise<NotionDatabase[] | null> {
  try {
    const response = await notionRequest("/search", "POST", {
      query,
      filter: { value: "database", property: "object" },
    });
    if (!response) return null;

    return (response.results as any[])
      .filter((r) => r.object === "database")
      .map((db) => ({
        id: db.id,
        title: db.title?.length
          ? [{ type: "title" as const, title: db.title }]
          : [{ type: "title" as const, title: [{ plain_text: "Unnamed Database" }] }],
        properties: db.properties || {},
      }));
  } catch (error) {
    console.error("Fehler bei der Notion-Datenbanksuche:", error);
    return null;
  }
}

/** Lädt alle Seiten aus einer Notion-Datenbank (mit Pagination) */
export async function loadNotionDatabasePages(databaseId: string): Promise<NotionPage[] | null> {
  try {
    const pages: NotionPage[] = [];
    let startCursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const body: Record<string, unknown> = { page_size: 100 };
      if (startCursor) body["start_cursor"] = startCursor;

      const response = await notionRequest(`/databases/${databaseId}/query`, "POST", body);
      if (!response) return null;

      for (const page of response.results as any[]) {
        pages.push({
          id: page.id,
          created_time: page.created_time,
          last_edited_time: page.last_edited_time,
          url: page.url,
          properties: page.properties,
        });
      }
      hasMore = Boolean(response.has_more);
      startCursor = response.next_cursor ?? undefined;
    }

    return pages;
  } catch (error) {
    console.error("Fehler beim Laden der Notion-Seiten:", error);
    return null;
  }
}

/** Erstellt eine neue Seite in einer Notion-Datenbank */
export async function createNotionPage(
  databaseId: string,
  properties: Record<string, any>,
  children?: any[]
): Promise<string | null> {
  try {
    const response = await notionRequest("/pages", "POST", {
      parent: { database_id: databaseId },
      properties,
      ...(children ? { children } : {}),
    });
    return response?.id ?? null;
  } catch (error) {
    console.error("Fehler beim Erstellen der Notion-Seite:", error);
    return null;
  }
}

/** Aktualisiert eine bestehende Notion-Seite */
export async function updateNotionPage(
  pageId: string,
  properties: Record<string, any>,
  children?: any[]
): Promise<boolean> {
  try {
    await notionRequest(`/pages/${pageId}`, "PATCH", { properties });

    if (children && children.length > 0) {
      await notionRequest(`/blocks/${pageId}/children`, "PATCH", { children });
    }
    return true;
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Notion-Seite:", error);
    return false;
  }
}

/** Löscht eine Notion-Seite */
export async function deleteNotionPage(pageId: string): Promise<boolean> {
  try {
    await notionRequest(`/pages/${pageId}`, "PATCH", { archived: true });
    return true;
  } catch (error) {
    console.error("Fehler beim Löschen der Notion-Seite:", error);
    return false;
  }
}

/** Extrahiert Text aus Notion-Rich-Text */
export function extractTextFromRichText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return "";
  return richText
    .map((item) => {
      if (item.type === "text" && item.text?.content) {
        return item.text.content;
      }
      return item.plain_text ?? "";
    })
    .join("");
}

/** Extrahiert Markdown aus Notion-Blöcken */
export function notionBlocksToMarkdown(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading_1":
          return `# ${extractTextFromRichText(block.heading_1?.rich_text)}`;
        case "heading_2":
          return `## ${extractTextFromRichText(block.heading_2?.rich_text)}`;
        case "heading_3":
          return `### ${extractTextFromRichText(block.heading_3?.rich_text)}`;
        case "paragraph":
          return extractTextFromRichText(block.paragraph?.rich_text);
        case "bulleted_list_item":
          return `- ${extractTextFromRichText(block.bulleted_list_item?.rich_text)}`;
        case "numbered_list_item":
          return `1. ${extractTextFromRichText(block.numbered_list_item?.rich_text)}`;
        case "code": {
          const language = block.code?.language || "";
          const content = block.code?.rich_text ? extractTextFromRichText(block.code.rich_text) : "";
          return "```" + language + "\n" + content + "\n```";
        }
        case "quote":
          return `> ${extractTextFromRichText(block.quote?.rich_text)}`;
        case "divider":
          return "---";
        default:
          return "";
      }
    })
    .filter((line) => line.trim() !== "")
    .join("\n\n");
}

/** Lädt den Inhalt einer Notion-Seite als Markdown (mit Pagination) */
export async function loadNotionPageContent(pageId: string): Promise<string | null> {
  try {
    const blocks: any[] = [];
    let startCursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const query = startCursor ? `?start_cursor=${encodeURIComponent(startCursor)}` : "";
      const response = await notionRequest(`/blocks/${pageId}/children${query}`, "GET");
      if (!response) return null;

      blocks.push(...(response.results as any[]));
      hasMore = Boolean(response.has_more);
      startCursor = response.next_cursor ?? undefined;
    }

    return notionBlocksToMarkdown(blocks);
  } catch (error) {
    console.error("Fehler beim Laden des Notion-Seiteninhalts:", error);
    return null;
  }
}
