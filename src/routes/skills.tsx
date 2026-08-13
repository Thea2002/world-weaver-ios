import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wand2, Copy, Check, Sparkles, Shuffle, Loader2, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SKILLS, systemPrompt, type Skill } from "@/lib/skills";
import { ANY, buildSystemPrompt, buildUserMessage, optionsFor, randomChoices, type Choices } from "@/lib/skill-options";
import { LORE_SETTINGS, settingGuides } from "@/lib/lore-settings";
import { generateContent } from "@/lib/generate.functions";
import { useVault } from "@/lib/vault";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Generatoren & Skills — Mythic Journal" },
      {
        name: "description",
        content:
          "Konfigurierbare Worldbuilding-Generatoren mit Mehrfachauswahl und Setting-Kanon (Faerûn, Eberron, Waterdeep, Exandria, Witcher, Skyrim) — Ausgabe landet direkt im Vault.",
      },
      { property: "og:title", content: "Generatoren & Skills — Mythic Journal" },
      { property: "og:description", content: "KI-Generatoren für Städte, NSCs, Shops, Monster und Lore — setting-treu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Skills,
});

const SETTING_KEY = "mythic:settings-selection";

function titleFromMarkdown(md: string, fallback: string) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1]!.replace(/[#*_`]/g, "").trim() || fallback : fallback;
}

function Skills() {
  const { create } = useVault();
  const navigate = useNavigate();
  const [active, setActive] = useState<Skill | null>(null);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Choices>({});
  const [settings, setSettings] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SETTING_KEY);
    if (raw) {
      try {
        setSettings(JSON.parse(raw) as string[]);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const toggleSetting = (id: string) => {
    setSettings((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      localStorage.setItem(SETTING_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleChoice = (optionId: string, choice: string) => {
    setSelected((prev) => {
      const cur = prev[optionId] ?? [];
      if (choice === ANY) return { ...prev, [optionId]: [] };
      return { ...prev, [optionId]: cur.includes(choice) ? cur.filter((c) => c !== choice) : [...cur, choice] };
    });
  };

  const openSkill = (s: Skill) => {
    setActive(active?.id === s.id ? null : s);
    setSelected({});
    setError(undefined);
    setShowPrompt(false);
  };

  const settingLabels = LORE_SETTINGS.filter((s) => settings.includes(s.id)).map((s) => s.label);

  const propertiesFrom = (skill: Skill, choices: Choices): Record<string, string> => {
    const props: Record<string, string> = { Generator: skill.name, Typ: skill.tag ?? skill.kind };
    if (settingLabels.length) props["Setting"] = settingLabels.join(", ");
    for (const o of optionsFor(skill)) {
      const v = (choices[o.id] ?? []).filter((x) => x !== ANY);
      if (v.length) props[o.label] = v.join(", ");
    }
    props["Erstellt"] = new Date().toLocaleString("de-DE");
    return props;
  };

  const saveNote = (skill: Skill, body: string, title: string, props: Record<string, string>) =>
    create(skill.kind, title, body, skill.folder, props);

  const generate = async (skill: Skill, choices: Choices) => {
    setBusy(true);
    setError(undefined);
    try {
      const res = await generateContent({
        data: {
          system: buildSystemPrompt(skill, settingGuides(settings)),
          user: buildUserMessage(skill, input, choices, settingLabels),
        },
      });
      const body = res.text.replace(/^```(?:markdown|md)?\n([\s\S]*)\n```$/m, "$1").trim();
      const note = saveNote(skill, body, titleFromMarkdown(body, input.trim() || skill.name), propertiesFrom(skill, choices));
      navigate({ to: "/note/$id", params: { id: note.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generierung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Generatoren" subtitle={`${SKILLS.length} Generatoren · Mehrfachauswahl & Setting-Kanon`}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Idee / Titel (optional) …"
        className="mb-4 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        aria-label="Generator-Input"
      />

      <section className="card mb-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Setting (mehrfach wählbar)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LORE_SETTINGS.map((s) => {
            const on = settings.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleSetting(s.id)}
                className={`rounded-full border px-2.5 py-1 text-[11px] ${
                  on ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface-2 text-muted-foreground"
                }`}
              >
                {s.emoji} {s.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {settings.length
            ? "Generierte Inhalte bleiben im Kanon dieser Settings — und werden automatisch gespeichert."
            : "Ohne Auswahl generisch-fantasy. Auswahl bleibt gespeichert."}
        </p>
      </section>

      <ul className="space-y-3">
        {SKILLS.map((s) => {
          const isOpen = active?.id === s.id;
          const options = optionsFor(s);
          return (
            <li key={s.id} className="card">
              <button onClick={() => openSkill(s)} className="flex w-full items-start gap-3 text-left">
                <span className="text-xl leading-none">{s.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{s.description}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {s.folder} · {options.length} Optionen
                  </p>
                </div>
                <span className="chip shrink-0">{isOpen ? "Schließen" : "Öffnen"}</span>
              </button>

              {isOpen && (
                <div className="mt-3 border-t border-border pt-3">
                  {options.map((o) => {
                    const chosen = selected[o.id] ?? [];
                    return (
                      <div key={o.id} className="mb-3">
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {o.label}
                          {chosen.length > 1 && <span className="ml-1 text-primary">×{chosen.length}</span>}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {[ANY, ...o.choices].map((c) => {
                            const on = c === ANY ? chosen.length === 0 : chosen.includes(c);
                            return (
                              <button
                                key={c}
                                onClick={() => toggleChoice(o.id, c)}
                                className={`rounded-full border px-2.5 py-1 text-[11px] ${
                                  on
                                    ? "border-primary bg-primary/15 text-primary"
                                    : "border-border bg-surface-2 text-muted-foreground"
                                }`}
                              >
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => void generate(s, selected)} disabled={busy} className="btn-primary">
                      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                      {busy ? "Generiere…" : "Generieren & speichern"}
                    </button>
                    <button
                      onClick={() => {
                        const rnd = randomChoices(options);
                        setSelected(rnd);
                        void generate(s, rnd);
                      }}
                      disabled={busy}
                      className="btn-ghost px-3"
                    >
                      <Shuffle className="size-3.5" /> Surprise Me
                    </button>
                    <button
                      onClick={() => {
                        const title = input.trim() || `Neu: ${s.name}`;
                        const note = saveNote(s, s.template(title), title, propertiesFrom(s, selected));
                        navigate({ to: "/note/$id", params: { id: note.id } });
                      }}
                      className="btn-ghost px-3"
                    >
                      <FileText className="size-3.5" /> Leeres Template
                    </button>
                  </div>

                  {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

                  <button
                    onClick={() => setShowPrompt((v) => !v)}
                    className="mt-3 text-[11px] font-semibold text-primary"
                  >
                    {showPrompt ? "Prompt verbergen" : "System-Prompt ansehen"}
                  </button>
                  {showPrompt && (
                    <div className="mt-2">
                      <pre className="max-h-64 overflow-auto rounded-xl border border-border bg-surface-2 p-3 text-[11px] leading-relaxed whitespace-pre-wrap">
                        {`${buildSystemPrompt(s, settingGuides(settings))}\n\n---\n\n${buildUserMessage(
                          s,
                          input || "{{input}}",
                          selected,
                          settingLabels,
                        )}`}
                      </pre>
                      <button
                        onClick={() => {
                          void navigator.clipboard.writeText(systemPrompt(s, input || "{{input}}"));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1200);
                        }}
                        className="btn-ghost mt-2"
                      >
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copied ? "Kopiert" : "Prompt kopieren"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isOpen && (
                <button onClick={() => openSkill(s)} className="mt-2 text-[11px] font-semibold text-primary">
                  <Wand2 className="mr-1 inline size-3" /> Optionen & Generieren
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
