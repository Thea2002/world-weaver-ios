/** Known TTRPG / pop-culture settings the generators can stay canon-consistent with. */
export type LoreSetting = {
  id: string;
  label: string;
  emoji: string;
  /** Canon guidance injected into the system prompt. */
  guide: string;
};

export const LORE_SETTINGS: LoreSetting[] = [
  {
    id: "faerun",
    label: "Faerûn",
    emoji: "🗡️",
    guide:
      "Forgotten Realms / Faerûn (D&D 5e). Nutze kanonische Regionen (Schwertküste, Cormyr, Amn, Thay), Gottheiten (Mystra, Tyr, Lathander, Shar), Fraktionen (Harpers, Zhentarim, Lords' Alliance, Emerald Enclave), Währung in Goldmünzen (gp/sp/cp) und Jahresangaben in DR.",
  },
  {
    id: "waterdeep",
    label: "Waterdeep",
    emoji: "🏙️",
    guide:
      "Waterdeep, City of Splendors. Nutze echte Wards (Castle, Sea, Dock, Trades, North, Southern, Field), Orte wie Yawning Portal, Blackstaff Tower, Undermountain, die Masked Lords, Xanathars Gilde und Waterdhavian-Namenskonventionen.",
  },
  {
    id: "icewind-dale",
    label: "Icewind Dale",
    emoji: "❄️",
    guide:
      "Icewind Dale / Ten-Towns (Bryn Shander, Targos, Easthaven, Lonelywood …). Eiskalte Tundra, Knochenmangel an Ressourcen, Skalenfisch (knucklehead trout), Reghed-Nomaden, Duergar, Auril-Kult, Rauheit und Isolation.",
  },
  {
    id: "eberron",
    label: "Eberron",
    emoji: "⚙️",
    guide:
      "Eberron. Nutze Drachenmarken-Häuser, Warforged, Sharn/Khorvaire, Lightning Rail, Elemental Airships, Last War-Nachwirkungen, Manifest Zones, Drachenmarken statt klassischer Götter-Direktkontakte, Noir-/Pulp-Ton.",
  },
  {
    id: "exandria",
    label: "Exandria",
    emoji: "🌒",
    guide:
      "Exandria (Critical Role). Nutze Tal'Dorei/Marquet/Issylra, Prime Deities & Betrayer Gods, Residuum, Whitestone, Emon, Vasselheim; Ton: heroisch-emotional, moderne Dialoge.",
  },
  {
    id: "wildemount",
    label: "Wildemount",
    emoji: "🕯️",
    guide:
      "Wildemount (Exandria). Dwendalian Empire vs. Kryn Dynasty, Xhorhas, Dynasty-Dunamancy, Zemnian-Namen, Zensur & Kriegsparanoia im Empire, Consecuted Drow-Kultur.",
  },
  {
    id: "witcher",
    label: "Witcher",
    emoji: "🐺",
    guide:
      "The Witcher / Kontinent. Nutze Nilfgaard, Temerien, Redanien, Skellige, Hexer-Schulen, Zauberinnen-Loge, Monster-Bestiary (Ertrunkene, Nekker, Leshen), Silber/Stahl-Dualität, Kronen als Währung, moralisch graue, brutale Low-Fantasy-Stimmung.",
  },
  {
    id: "skyrim",
    label: "Skyrim / TES",
    emoji: "🐉",
    guide:
      "The Elder Scrolls / Skyrim. Nutze Holds & Städte (Whiterun, Riften, Windhelm), Nord-Kultur, Divines & Daedra, Mead, Draugr, Dwemer-Ruinen, Thieves Guild/Companions, Septims als Währung, nordisch-raue Sprache.",
  },
  {
    id: "potter",
    label: "Harry Potter",
    emoji: "⚡",
    guide:
      "Wizarding World. Nutze Hogwarts-Häuser, Diagon Alley/Hogsmeade, Galleonen/Sickel/Knuts, Zauberstäbe, Zaubertränke-Zutaten, Ministerium für Zauberei, Statut der Geheimhaltung; Ton: whimsical-britisch mit dunklen Untertönen.",
  },
  {
    id: "homebrew",
    label: "Homebrew",
    emoji: "🧪",
    guide: "Eigenes Setting ohne Kanon-Vorgaben — erfinde Namen, Götter und Fraktionen frei, aber in sich konsistent.",
  },
];

export function settingGuides(ids: string[]): string {
  const picked = LORE_SETTINGS.filter((s) => ids.includes(s.id));
  if (!picked.length) return "";
  const head =
    picked.length > 1
      ? `Setting-Crossover: verbinde ${picked.map((p) => p.label).join(" + ")} plausibel (gemeinsame Grenzregion, Portal, Reise).`
      : `Setting: ${picked[0]!.label}. Alles muss in diesem Kanon existieren können.`;
  return [head, ...picked.map((p) => `- ${p.label}: ${p.guide}`)].join("\n");
}
