import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Server-only access through the project's permanent Notion connection. */
export const notionProxy = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        path: z.string().startsWith("/"),
        method: z.enum(["GET", "POST", "PATCH"]).default("POST"),
        body: z.unknown().optional(),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env['LOVABLE_API_KEY'];
    const notionKey = process.env['NOTION_API_KEY'];
    if (!lovableKey || !notionKey) throw new Error("Die Notion-Projektverbindung ist nicht eingerichtet.");

    const res = await fetch(`https://connector-gateway.lovable.dev/notion/v1${data.path}`, {
      method: data.method,
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": notionKey,
        "Notion-Version": "2025-09-03",
        "Content-Type": "application/json",
      },
      body: data.method === "GET" ? null : JSON.stringify(data.body ?? {}),
    });

    const raw = await res.text();
    const json = raw ? JSON.parse(raw) : null;
    if (!res.ok) {
      const message =
        (json as { message?: string } | null)?.message || res.statusText || "Unbekannter Fehler";
      console.error(`Notion request failed [${res.status}]: ${raw}`);
      throw new Error(`Notion-Fehler [${res.status}]: ${message}`);
    }
    return json;
  });
