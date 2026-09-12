import { Client } from "@notionhq/client";

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

interface NotionSearchResult {
  results: Array<{
    object: "page" | "database";
    id: string;
    url: string;
    title?: { type: "title"; title: { plain_text: string }[] }[];
    properties?: Record<string, any>;
  }>;
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
  if (typeof localStorage === "undefined") {
    return {
      apiKey: "",
      databaseId: "",
      isEnabled: false,
      autoSync: false,
      lastSyncTime: null,
    };
  }
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) {
    return {
      apiKey: "",
      databaseId: "",
      isEnabled: false,
      autoSync: false,
      lastSyncTime: null,
    };
  }
  try {
    return JSON.parse(raw) as NotionConfig;
  } catch {
    return {
      apiKey: "",
      databaseId: "",
      isEnabled: false,
      autoSync: false,
      lastSyncTime: null,
    };
  }
}

/** Erstellt einen Notion-Client mit dem gespeicherten API-Key */
export function createNotionClient(): Client | null {
  const config = loadNotionConfig();
  if (!config.apiKey || !config.isEnabled) {
    return null;
  }
  return new Client({ auth: config.apiKey });
}

/** Sucht nach einer Notion-Datenbank */
export async function searchNotionDatabase(query: string): Promise<NotionDatabase[] | null> {
  const client = createNotionClient();
  if (!client) return null;

  try {
    const response = await client.search({
      query: query,
      filter: { value: "data_source", property: "object" },
    });
    
    const results = (response as unknown as NotionSearchResult).results;
    return results
      .filter((r) => r.object === "database")
      .map((db) => ({
        id: db.id,
        title: db.title || [{ type: "title", title: [{ plain_text: "Unnamed Database" }] }],
        properties: db.properties || {},
      }));
  } catch (error) {
    console.error("Fehler bei der Notion-Datenbanksuche:", error);
    return null;
  }
}

/** Lädt alle Seiten aus einer Notion-Datenbank */
export async function loadNotionDatabasePages(databaseId: string): Promise<NotionPage[] | null> {
  const client = createNotionClient();
  if (!client) return null;

  try {
    const response = await (client as unknown as {
      databases: { query: (args: { database_id: string }) => Promise<unknown> };
    }).databases.query({ database_id: databaseId });
    
    const results = (response as unknown as { results: NotionPage[] }).results;
    return results.map((page) => ({
      id: page.id,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
      url: page.url,
      properties: page.properties,
    }));
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
  const client = createNotionClient();
  if (!client) return null;

  try {
    const response = await client.pages.create({
      parent: { type: "database_id", database_id: databaseId },
      properties,
      ...(children ? { children } : {}),
    } as Parameters<typeof client.pages.create>[0]);
    return response.id;
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
  const client = createNotionClient();
  if (!client) return false;

  try {
    await client.pages.update({
      page_id: pageId,
      properties,
    });
    
    if (children) {
      await client.blocks.children.append({
        block_id: pageId,
        children,
      });
    }
    return true;
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Notion-Seite:", error);
    return false;
  }
}

/** Löscht eine Notion-Seite */
export async function deleteNotionPage(pageId: string): Promise<boolean> {
  const client = createNotionClient();
  if (!client) return false;

  try {
    await client.pages.update({
      page_id: pageId,
      archived: true,
    });
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
      return "";
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
        case "code":
          const language = block.code?.language || "";
          const content = block.code?.rich_text ? extractTextFromRichText(block.code.rich_text) : "";
          return "```" + language + "\n" + content + "\n```";
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

/** Lädt den Inhalt einer Notion-Seite als Markdown */
export async function loadNotionPageContent(pageId: string): Promise<string | null> {
  const client = createNotionClient();
  if (!client) return null;

  try {
    const response = await client.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    
    const blocks = (response as unknown as { results: any[] }).results;
    return notionBlocksToMarkdown(blocks);
  } catch (error) {
    console.error("Fehler beim Laden des Notion-Seiteninhalts:", error);
    return null;
  }
}
