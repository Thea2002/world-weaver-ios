import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2, Copy, Check, Sparkles, Shuffle, Loader2, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SKILLS, systemPrompt, type Skill } from "@/lib/skills";
import { ANY, buildSystemPrompt, buildUserMessage, optionsFor, randomChoices } from "@/lib/skill-options";
import { generateContent } from "@/lib/generate.functions";
import { useVault } from "@/lib/vault";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Generatoren & Skills — Mythic Journal" },
      {
        name: "description",
        content:
          "25 konfigurierbare Worldbuilding-Generatoren: Städte, NSCs, Monster, Dungeons, Quests und Session-Prep — mit Optionen, Surprise Me und KI-Ausgabe direkt in den Vault.",
      },
      { property: "og:title", content: "Generatoren & Skills — Mythic Journal" },
      { property: "og:description", content: "Konfigurierbare KI-Generatoren für Städte, NSCs, Monster, Quests und Lore." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Skills,
});

function titleFromMarkdown(md: string, fallback: string) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1]!.replace(/[#*_`]/g, "").replace(/^[^\p{L}\p{N}]+/u, "").trim() || fallback : fallback;
}

function Skills() {
  const { create } = useVault();
  const navigate = useNavigate();
  const [active, setActive] = useState<Skill | null>(null);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const openSkill = (s: Skill) => {
    setActive(active?.id === s.id ? null : s);
    setSelected({});
    setError(undefined);
    setShowPrompt(false);
  };

  const saveNote = (skill: Skill, body: string, title: string) => {
    const note = create(skill.kind, title, body, skill.folder);
    navigate({ to: "/note/$id", params: { id: note.id } });
  };

  const generate = async (skill: Skill, choices: Record<string, string>) => {
    setBusy(true);
    setError(undefined);
    try {
      const res = await generateContent({
        data: { system: buildSystemPrompt(skill), user: buildUserMessage(skill, input, choices) },
      });
      const body = res.text.replace(/^```(?:markdown|md)?\n([\s\S]*)\n```$/m, "$1").trim();
      saveNote(skill, body, titleFromMarkdown(body, input.trim() || skill.name));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generierung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Generatoren" subtitle={`${SKILLS.length} Custom-Generatoren · Optionen & KI`}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Idee / Titel (optional) …"
        className="mb-4 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        aria-label="Generator-Input"
      />

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
                  {options.map((o) => (
                    <div key={o.id} className="mb-3">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {o.label}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[ANY, ...o.choices].map((c) => {
                          const chosen = (selected[o.id] ?? ANY) === c;
                          return (
                            <button
                              key={c}
                              onClick={() => setSelected((p) => ({ ...p, [o.id]: c }))}
                              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                                chosen
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
                  ))}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => void generate(s, selected)} disabled={busy} className="btn-primary">
                      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                      {busy ? "Generiere…" : "Generieren"}
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
                        saveNote(s, s.template(title), title);
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
                        {`${buildSystemPrompt(s)}\n\n---\n\n${buildUserMessage(s, input || "{{input}}", selected)}`}
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
