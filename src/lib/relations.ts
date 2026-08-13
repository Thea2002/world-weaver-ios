import type { Note, Relation } from "./vault";

export const RELATION_MIN = -10;
export const RELATION_MAX = 10;

export type RelationStatus = { label: string; color: string; bg: string };

/** Maps a -10…+10 sentiment onto a Notion-style status badge. */
export function relationStatus(value: number): RelationStatus {
  if (value <= -6) return { label: "Erzfeind", color: "#bf616a", bg: "rgba(191,97,106,0.18)" };
  if (value <= -2) return { label: "Gegner", color: "#d08770", bg: "rgba(208,135,112,0.18)" };
  if (value <= 1) return { label: "Bekanntschaft", color: "#b48ead", bg: "rgba(180,142,173,0.18)" };
  if (value <= 4) return { label: "Freund", color: "#e79ec4", bg: "rgba(231,158,196,0.18)" };
  if (value <= 7) return { label: "Enger Freund", color: "#a3be8c", bg: "rgba(163,190,140,0.18)" };
  return { label: "Bester Freund", color: "#ebcb8b", bg: "rgba(235,203,139,0.2)" };
}

/** 0…10 filled hearts/segments for the status bar. */
export function relationSegments(value: number) {
  const clamped = Math.max(RELATION_MIN, Math.min(RELATION_MAX, value));
  const filled = Math.round(((clamped - RELATION_MIN) / (RELATION_MAX - RELATION_MIN)) * 10);
  return { filled, empty: 10 - filled, clamped };
}

export function relationsOf(note: Note | undefined): Relation[] {
  return note?.relations ?? [];
}

export function upsertRelation(list: Relation[], rel: Relation): Relation[] {
  const idx = list.findIndex((r) => r.target.toLowerCase() === rel.target.toLowerCase());
  if (idx < 0) return [...list, rel];
  const next = [...list];
  next[idx] = { ...next[idx], ...rel };
  return next;
}
