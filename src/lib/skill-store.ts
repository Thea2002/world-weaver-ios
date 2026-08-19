import { useCallback, useEffect, useState } from "react";
import type { Skill } from "./skills";

export type SkillOverride = { prompt?: string; template?: string };

const KEY = "mythic:skill-overrides";
const listeners = new Set<() => void>();

function read(): Record<string, SkillOverride> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, SkillOverride>;
  } catch {
    return {};
  }
}

/** Applies a stored override so edited prompts/templates are used for generation. */
export function withOverride(skill: Skill, all: Record<string, SkillOverride>): Skill {
  const o = all[skill.id];
  if (!o) return skill;
  return {
    ...skill,
    prompt: o.prompt?.trim() ? o.prompt : skill.prompt,
    template: o.template?.trim()
      ? (i: string) => o.template!.replace(/\{\{\s*(?:input|auto_title|titel|title)\s*\}\}/gi, i)
      : skill.template,
  };
}

export function useSkillOverrides() {
  const [overrides, setOverrides] = useState<Record<string, SkillOverride>>({});

  useEffect(() => {
    const sync = () => setOverrides(read());
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  const setOverride = useCallback((id: string, value: SkillOverride | null) => {
    const all = read();
    if (value) all[id] = value;
    else delete all[id];
    localStorage.setItem(KEY, JSON.stringify(all));
    listeners.forEach((l) => l());
  }, []);

  const resolve = useCallback((skill: Skill) => withOverride(skill, overrides), [overrides]);

  return { overrides, setOverride, resolve };
}
