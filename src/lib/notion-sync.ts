import { useCallback, useEffect, useState } from "react";
import {
  createNotionClient,
  loadNotionConfig,
  saveNotionConfig,
  loadNotionDatabasePages,
  createNotionPage,
  updateNotionPage,
  deleteNotionPage,
  loadNotionPageContent,
  extractTextFromRichText,
} from "./notion-client";
import { useVault, type Note, type NoteKind } from "./vault";

// Mapping zwischen Notion-Property-Typen und Mythic Journal Typen
const KIND_MAPPING: Record<string, NoteKind> = {
  "Notiz": "note",
  "Charakter": "character",
  "Ort": "location",
  "Fraktion": "faction",
  "Lore": "lore",
  "Session": "session",
  "NPC": "npc",
  "Gottheit": "deity",
  "Gegenstand": "item",
  "Kreatur": "creature",
  "Zeitachse": "timeline",
  "Regeln": "rules",
};

const REVERSE_KIND_MAPPING: Record<NoteKind, string> = Object.entries(KIND_MAPPING).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<NoteKind, string>
);

/** Konvertiert eine Notion-Seite in eine Mythic Journal Notiz */
export function notionPageToNote(page: any, databaseId: string): Note {
  const properties = page.properties || {};
  
  // Extrahiere Titel
  const titleProperty = properties["Titel"] || properties["Name"] || properties["title"] || properties["name"];
  const title = titleProperty?.title?.[0]?.plain_text || 
                titleProperty?.rich_text?.[0]?.plain_text || 
                "Unbenannte Notiz";
  
  // Extrahiere Typ
  const typeProperty = properties["Typ"] || properties["Type"] || properties["type"];
  const typeText = typeProperty?.select?.name || 
                  typeProperty?.multi_select?.[0]?.name || 
                  "note";
  const kind = KIND_MAPPING[typeText] || "note";
  
  // Extrahiere Tags/Properties
  const props: Record<string, string> = {};
  for (const [key, raw] of Object.entries(properties)) {
    const value = raw as any;
    if (key === "Titel" || key === "Name" || key === "title" || key === "name" || 
        key === "Typ" || key === "Type" || key === "type") {
      continue;
    }
    
    if (value.type === "rich_text") {
      props[key] = extractTextFromRichText(value.rich_text);
    } else if (value.type === "select") {
      props[key] = value.select?.name || "";
    } else if (value.type === "multi_select") {
      props[key] = value.multi_select?.map((s: any) => s.name).join(", ") || "";
    } else if (value.type === "date") {
      props[key] = value.date?.start || "";
    } else if (value.type === "number") {
      props[key] = String(value.number || "");
    } else if (value.type === "people") {
      props[key] = value.people?.map((p: any) => p.name).join(", ") || "";
    }
  }
  
  // Pfad aus Ordner/Relation ableiten
  const folderProperty = properties["Ordner"] || properties["Folder"] || properties["folder"];
  const folder = folderProperty?.select?.name || "Journal";
  
  return {
    id: `ntn-${page.id}`,
    title,
    path: `${folder}/${title}.md`,
    kind,
    body: "", // Wird später geladen
    properties: props,
    relations: [],
    updatedAt: new Date(page.last_edited_time).getTime(),
  };
}

/** Konvertiert eine Mythic Journal Notiz in Notion-Properties */
export function noteToNotionProperties(note: Note): Record<string, any> {
  const properties: Record<string, any> = {
    Titel: {
      title: [{ text: { content: note.title } }],
    },
    Typ: {
      select: { name: REVERSE_KIND_MAPPING[note.kind] || note.kind },
    },
  };
  
  // Pfad als Ordner
  const folder = note.path.split("/").slice(0, -1).join("/");
  if (folder) {
    properties["Ordner"] = {
      select: { name: folder },
    };
  }
  
  // Properties als Notion-Properties
  for (const [key, value] of Object.entries(note.properties)) {
    if (key === "Keywords" || key === "Wörter") {
      properties[key] = {
        rich_text: [{ text: { content: value } }],
      };
    } else {
      properties[key] = {
        rich_text: [{ text: { content: String(value) } }],
      };
    }
  }
  
  return properties;
}

/** Synchronisiert Notizen von Notion zum lokalen Vault */
export async function syncFromNotion(databaseId: string): Promise<{ synced: number; errors: string[] }> {
  const client = createNotionClient();
  if (!client) {
    return { synced: 0, errors: ["Notion-Client nicht verfügbar"] };
  }
  
  const errors: string[] = [];
  let synced = 0;
  
  try {
    // Lade alle Seiten aus der Datenbank
    const pages = await loadNotionDatabasePages(databaseId);
    if (!pages || pages.length === 0) {
      return { synced: 0, errors: ["Keine Seiten in der Datenbank gefunden"] };
    }
    
    // Lade lokale Notizen
    const localNotes = JSON.parse(localStorage.getItem("mythic:vault:v4") || "[]") as Note[];
    const localNoteIds = new Set(localNotes.map((n) => n.id));
    
    // Verarbeite jede Seite
    for (const page of pages) {
      try {
        const note = notionPageToNote(page, databaseId);
        
        // Lade den Inhalt
        const content = await loadNotionPageContent(page.id);
        if (content) {
          note.body = content;
        }
        
        // Prüfe, ob die Notiz bereits existiert
        const existingIndex = localNotes.findIndex(
          (n) => n.id === note.id || n.title === note.title
        );
        
        if (existingIndex >= 0) {
          // Aktualisiere bestehende Notiz
          localNotes[existingIndex] = note;
        } else {
          // Füge neue Notiz hinzu
          localNotes.push(note);
        }
        
        synced++;
      } catch (error) {
        errors.push(`Fehler beim Synchronisieren der Seite ${page.id}: ${error}`);
      }
    }
    
    // Speichere aktualisierte Notizen
    localStorage.setItem("mythic:vault:v4", JSON.stringify(localNotes));
    
  } catch (error) {
    errors.push(`Allgemeiner Fehler beim Synchronisieren: ${error}`);
  }
  
  return { synced, errors };
}

/** Synchronisiert lokale Notizen zu Notion */
export async function syncToNotion(databaseId: string): Promise<{ synced: number; errors: string[] }> {
  const client = createNotionClient();
  if (!client) {
    return { synced: 0, errors: ["Notion-Client nicht verfügbar"] };
  }
  
  const errors: string[] = [];
  let synced = 0;
  
  try {
    // Lade lokale Notizen
    const localNotes = JSON.parse(localStorage.getItem("mythic:vault:v4") || "[]") as Note[];
    
    // Lade bestehende Notion-Seiten
    const existingPages = await loadNotionDatabasePages(databaseId);
    const existingPageTitles = new Map<string, string>();
    if (existingPages) {
      for (const page of existingPages) {
        const title: string =
          page.properties?.["Titel"]?.title?.[0]?.plain_text ||
          page.properties?.["Name"]?.title?.[0]?.plain_text ||
          "";
        existingPageTitles.set(title.toLowerCase(), page.id);
      }
    }
    
    // Verarbeite jede lokale Notiz
    for (const note of localNotes) {
      try {
        const pageId = existingPageTitles.get(note.title.toLowerCase());
        const properties = noteToNotionProperties(note);
        
        // Konvertiere Markdown zu Notion-Blöcken
        const children = markdownToNotionBlocks(note.body);
        
        if (pageId) {
          // Aktualisiere bestehende Seite
          const success = await updateNotionPage(pageId, properties, children);
          if (success) {
            synced++;
          } else {
            errors.push(`Fehler beim Aktualisieren von ${note.title}`);
          }
        } else {
          // Erstelle neue Seite
          const newPageId = await createNotionPage(databaseId, properties, children);
          if (newPageId) {
            // Aktualisiere die lokale Notiz-ID mit der Notion-ID
            note.id = `ntn-${newPageId}`;
            synced++;
          } else {
            errors.push(`Fehler beim Erstellen von ${note.title}`);
          }
        }
      } catch (error) {
        errors.push(`Fehler beim Synchronisieren von ${note.title}: ${error}`);
      }
    }
    
  } catch (error) {
    errors.push(`Allgemeiner Fehler beim Synchronisieren: ${error}`);
  }
  
  return { synced, errors };
}

/** Vollständige bidirektionale Synchronisation */
export async function fullSync(databaseId: string): Promise<{
  fromNotion: { synced: number; errors: string[] };
  toNotion: { synced: number; errors: string[] };
}> {
  const fromNotion = await syncFromNotion(databaseId);
  const toNotion = await syncToNotion(databaseId);
  
  return { fromNotion, toNotion };
}

/** Konvertiert Markdown zu Notion-Blöcken */
function markdownToNotionBlocks(markdown: string): any[] {
  const blocks: any[] = [];
  const lines = markdown.split("\n");
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    
    if (line.startsWith("# ")) {
      // H1
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: line.slice(2).trim() } }],
        },
      });
    } else if (line.startsWith("## ")) {
      // H2
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: line.slice(3).trim() } }],
        },
      });
    } else if (line.startsWith("### ")) {
      // H3
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: line.slice(4).trim() } }],
        },
      });
    } else if (line.startsWith("> ")) {
      // Blockquote
      blocks.push({
        object: "block",
        type: "quote",
        quote: {
          rich_text: [{ type: "text", text: { content: line.slice(2).trim() } }],
        },
      });
    } else if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("+ ")) {
      // Bulleted list
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: line.slice(2).trim() } }],
        },
      });
    } else if (/^\d+\. /.test(line)) {
      // Numbered list
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: [{ type: "text", text: { content: line.slice(line.match(/^\d+\. /)![0].length).trim() } }],
        },
      });
    } else if (line.startsWith("```")) {
      // Code block
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) {
        codeLines.push(lines[i]!);
        i++;
      }
      blocks.push({
        object: "block",
        type: "code",
        code: {
          language,
          rich_text: codeLines.map((codeLine) => ({
            type: "text",
            text: { content: codeLine },
          })),
        },
      });
    } else if (line === "---") {
      // Divider
      blocks.push({
        object: "block",
        type: "divider",
        divider: {},
      });
    } else if (line.trim() !== "") {
      // Paragraph
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: line.trim() } }],
        },
      });
    }
    
    i++;
  }
  
  return blocks;
}

/** React Hook für Notion-Synchronisation */
export function useNotionSync() {
  const { notes, save, create, remove } = useVault();
  const [config, setConfig] = useState<ReturnType<typeof loadNotionConfig>>(loadNotionConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<{
    fromNotion: number;
    toNotion: number;
    errors: string[];
  } | null>(null);

  // Speichere Konfiguration
  const saveConfig = useCallback((newConfig: Partial<ReturnType<typeof loadNotionConfig>>) => {
    const updatedConfig = { ...config, ...newConfig };
    saveNotionConfig(updatedConfig);
    setConfig(updatedConfig);
  }, [config]);

  // Synchronisation durchführen
  const performSync = useCallback(async (direction: "pull" | "push" | "both" = "both") => {
    if (!config.isEnabled || !config.apiKey || !config.databaseId) {
      setLastSyncError("Notion-Integration ist nicht aktiviert oder nicht konfiguriert");
      return;
    }

    setIsSyncing(true);
    setLastSyncError(null);

    try {
      if (direction === "pull" || direction === "both") {
        const result = await syncFromNotion(config.databaseId);
        setSyncStats((prev) => ({
          ...prev,
          fromNotion: result.synced,
          errors: [...(prev?.errors || []), ...result.errors],
        }));
      }

      if (direction === "push" || direction === "both") {
        const result = await syncToNotion(config.databaseId);
        setSyncStats((prev) => ({
          ...prev,
          toNotion: result.synced,
          errors: [...(prev?.errors || []), ...result.errors],
        }));
      }

      // Aktualisiere letzte Sync-Zeit
      saveConfig({ lastSyncTime: Date.now() });
    } catch (error) {
      setLastSyncError(`Synchronisationsfehler: ${error}`);
    } finally {
      setIsSyncing(false);
    }
  }, [config, saveConfig]);

  // Automatische Synchronisation
  useEffect(() => {
    if (config.isEnabled && config.autoSync && config.apiKey && config.databaseId) {
      const interval = setInterval(() => {
        performSync("both");
      }, 300000); // Alle 5 Minuten
      return () => clearInterval(interval);
    }
  }, [config, performSync]);

  return {
    config,
    setConfig: saveConfig,
    isSyncing,
    lastSyncError,
    syncStats,
    performSync,
    isConnected: config.isEnabled && !!config.apiKey && !!config.databaseId,
  };
}


// Re-export from notion-client for settings.tsx
export { searchNotionDatabase, loadNotionConfig, saveNotionConfig } from "./notion-client";
