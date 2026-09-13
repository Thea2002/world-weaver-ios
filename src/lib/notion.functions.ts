import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Server-seitiger Proxy für die Notion-API.
 * Direkte Browser-Aufrufe an api.notion.com schlagen wegen CORS fehl
 * ("Load failed"), daher laufen alle Requests über diese Server Function.
 */
export const notionProxy = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        apiKey: z.string().min(1),
        path: z.string().min(1),
        method: z.enum(["GET", "POST", "PATCH"]).default("POST"),
        body: z.unknown().optional(),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const res = await fetch(`https://api.notion.com/v1${data.path}`, {
      method: data.method,
      headers: {
        Authorization: `Bearer ${data.apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: data.method === "GET" ? undefined : JSON.stringify(data.body ?? {}),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        (json as { message?: string } | null)?.message || res.statusText || "Unbekannter Fehler";
      throw new Error(`Notion API Fehler [${res.status}]: ${message}`);
    }
    return json;
  });
