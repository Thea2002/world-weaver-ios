import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2, Copy, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SKILLS, systemPrompt, type Skill } from "@/lib/skills";
import { useVault } from "@/lib/vault";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills & Agenten — Mythic Journal" },
      {
        name: "description",
        content:
          "25 Worldbuilding-Skills: Charakter-, NSC-, Monster-, Region-, Dungeon- und Session-Prep-Generatoren als Notiz-Templates und System-Prompts.",
      },
      { property: "og:title", content: "Skills & Agenten — Mythic Journal" },
      { property: "og:description", content: "Generatoren für Charaktere, Orte, Quests, Lore und Session-Prep." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Skills,
});

function Skills() {
  const { create } = useVault();
  const navigate = useNavigate();
  const [open, setOpen] = useState<Skill | null>(null);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const run = (skill: Skill) => {
    const title = input.trim() || `Neu: ${skill.name}`;
    const note = create(skill.kind, title, skill.template(title), skill.folder);
    navigate({ to: "/note/$id", params: { id: note.id } });
  };

  return (
    <AppShell title="Skills" subtitle={`${SKILLS.length} Generatoren & Agenten-Prompts`}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Input / Titel für den Skill…"
        className="mb-4 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        aria-label="Skill-Input"
      />

      <ul className="space-y-3">
        {SKILLS.map((s) => (
          <li key={s.id} className="card">
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none">{s.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-foreground">{s.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.description}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{s.folder}</p>
              </div>
              <button onClick={() => run(s)} className="btn-primary shrink-0" aria-label={`${s.name} ausführen`}>
                <Wand2 className="size-3.5" /> Erstellen
              </button>
            </div>
            <button
              onClick={() => setOpen(open?.id === s.id ? null : s)}
              className="mt-2 text-[11px] font-semibold text-primary"
            >
              {open?.id === s.id ? "Prompt verbergen" : "System-Prompt ansehen"}
            </button>
            {open?.id === s.id && (
              <div className="mt-2">
                <pre className="max-h-64 overflow-auto rounded-xl border border-border bg-surface-2 p-3 text-[11px] leading-relaxed whitespace-pre-wrap">
                  {systemPrompt(s, input || "{{input}}")}
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
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
