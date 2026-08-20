import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { generateContent } from "@/lib/generate.functions";
import { settingGuides } from "@/lib/lore-settings";
import type { Note } from "@/lib/vault";

const SETTING_KEY = "mythic:settings-selection";

type Aspect = { id: string; label: string; instruction: string };

const ASPECTS: Aspect[] = [
  {
    id: "full",
    label: "🏘️ Ort komplett ausbauen",
    instruction:
      "Baue diesen Ort vollständig aus: Überblick zum Vorlesen, Struktur (Regierung, Wirtschaft, Verteidigung), 5–8 bemerkenswerte Gebäude, 3–5 Shops mit Angebots-Tabelle, 2 Tavernen mit Speisekarte, 6–10 NSCs mit Motivation und Hook, Gerüchte, Geheimnisse und aktuelle Ereignisse.",
  },
  {
    id: "buildings",
    label: "🏛️ Häuser & Gebäude",
    instruction:
      "Erzeuge 6–8 bemerkenswerte Gebäude (Wohnhäuser, Werkstätten, Tempel, Verwaltung) mit Besitzer:in, Zustand, Atmosphäre und je einem Hook oder Geheimnis.",
  },
  {
    id: "shops",
    label: "🛒 Shops & Händler",
    instruction:
      "Erzeuge 3–5 Läden mit Inhaber:in, Ruf und jeweils einer Angebots-Tabelle (Angebot | Wirkung / Verwendung | Kurze Beschreibung | Preis 🪙) mit 6–12 Zeilen und Emojis pro Ware.",
  },
  {
    id: "taverns",
    label: "🍺 Tavernen & Gasthäuser",
    instruction:
      "Erzeuge 2–3 Tavernen mit Wirt:in, Stimmung, Preisen für Zimmer und Speisekarten-Tabelle (mit Emojis), Stammgästen und 3 Gerüchten je Haus.",
  },
  {
    id: "people",
    label: "🎭 Personen & NSCs",
    instruction:
      "Erzeuge 6–10 NSCs mit Rolle, Aussehen in einem Satz, Persönlichkeitszug, geheimer Motivation und Plot Hook. Tabelle: Name | Rolle | Persönlichkeit | Motivation | Hook.",
  },
  {
    id: "rumors",
    label: "🗣️ Gerüchte & Plot Hooks",
    instruction: "Erzeuge 8 Gerüchte (davon 2 falsch) und 5 Plot Hooks mit Einstieg, Gegenspieler und Belohnung.",
  },
  {
    id: "secrets",
    label: "🕵️ Geheimnisse (nur SL)",
    instruction:
      "Erzeuge 5 Geheimnisse mit Auswirkung, Entdeckungs-Hinweis (Fähigkeit/DC) und Konsequenz, wenn sie unentdeckt bleiben.",
  },
];

function readSettings(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SETTING_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Generates additional detail sections for an existing note and appends them. */
export function ExpandPanel({ note, body, onAppend }: { note: Note; body: string; onAppend: (md: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  const run = async (aspect: Aspect) => {
    setBusy(aspect.id);
    setError(undefined);
    const guide = settingGuides(readSettings());
    const system = [
      `Du baust einen bestehenden Eintrag eines TTRPG-Weltenbuchs weiter aus. Typ des Eintrags: ${note.kind}.`,
      guide
        ? `Kanon-Vorgabe — alles muss in diesem Setting existieren können:\n${guide}`
        : null,
      "Antworte ausschließlich in Markdown, beginne mit einer `##`-Überschrift (mit passendem Emoji) und gib NUR die neuen Abschnitte aus — keine Wiederholung des bestehenden Textes, kein Frontmatter, keine Meta-Kommentare.",
      "Alles ist spielfertig: konkrete Namen, Zahlen, Preise, Hooks. Verlinke neue Orte, Gebäude, Shops, Tavernen und Personen als [[Wikilinks]] (z. B. [[npc.Elara Weißdorn]], [[shop.Kräuterladen Nachtschatten]]), damit daraus eigene Seiten entstehen können.",
      "Nutze Emojis in Überschriften und bei einzelnen Waren, NSCs oder Orten — sparsam und thematisch.",
    ]
      .filter(Boolean)
      .join("\n\n");

    const user = [
      `Eintrag: ${note.title}`,
      `Aufgabe: ${aspect.instruction}`,
      `Bestehender Inhalt (nicht wiederholen, aber konsistent bleiben):\n${body.slice(0, 5000)}`,
    ].join("\n\n");

    try {
      const res = await generateContent({ data: { system, user } });
      onAppend(res.text.trim());
    } catch {
      setError("Generieren fehlgeschlagen. Bitte nochmal versuchen.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="card mt-6">
      <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5" /> Ausbauen
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Erweitert „{note.title}“ um neue Abschnitte — direkt an die Seite angehängt und automatisch gespeichert.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ASPECTS.map((a) => (
          <button
            key={a.id}
            onClick={() => void run(a)}
            disabled={busy !== null}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] disabled:opacity-50 ${
              a.id === "full"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-surface-2 text-muted-foreground"
            }`}
          >
            {busy === a.id && <Loader2 className="size-3 animate-spin" />}
            {a.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </section>
  );
}
