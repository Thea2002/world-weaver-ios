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
    id: "ravenloft",
    label: "Ravenloft",
    emoji: "🌫️",
    guide: "Ravenloft / Domains of Dread. Nutze die Domänen, Darklords, Nebel, Vistani und Dark Powers; gotischer Horror, tragische Entscheidungen und klaustrophobische Isolation.",
  },
  {
    id: "barovia",
    label: "Barovia",
    emoji: "🦇",
    guide: "Barovia aus Curse of Strahd. Nutze Castle Ravenloft, Vallaki, Krezk, Village of Barovia, Strahd von Zarovich, die Zarovich-Familie und die bedrückende, sonnenlose Stimmung der Domäne.",
  },
  {
    id: "dragonlance",
    label: "Dragonlance",
    emoji: "🐲",
    guide: "Dragonlance / Krynn. Nutze Ansalon, Solamnia, Mages of High Sorcery, Dragonarmies, Kender, Draconians und die Götter Krynn; epische Kriegsfantasy mit Heldentum und Verlust.",
  },
  {
    id: "ravnica",
    label: "Ravnica",
    emoji: "🏛️",
    guide: "Ravnica, die weltumspannende Stadt. Nutze die zehn Gilden und ihre klaren Farbpaar-Identitäten, den Guildpact, Bezirke und urbane Magitech; Konflikte entstehen aus Gildeninteressen.",
  },
  {
    id: "princes-apocalypse",
    label: "Princes of the Apocalypse",
    emoji: "🌪️",
    guide: "Princes of the Apocalypse in den Dessarin Valley Forgotten Realms. Nutze die vier Elementarkulte, ihre Propheten, Sacred Stone Monastery, Rivergard Keep, Feathergale Spire und Scarlet Moon Hall.",
  },
  {
    id: "out-of-abyss",
    label: "Out of the Abyss",
    emoji: "🍄",
    guide: "Out of the Abyss im Underdark. Nutze Menzoberranzan, Gracklstugh, Neverlight Grove, Blingdenstone, Dämonenfürsten, Drow-Verfolgung und eskalierenden Wahnsinn.",
  },
  {
    id: "cthulhu",
    label: "Call of Cthulhu",
    emoji: "🐙",
    guide: "Call of Cthulhu. Nutze investigative kosmische Horror-Strukturen, Mythoswissen, Stabilitätsverlust, historische Recherche und menschliche Verletzlichkeit; keine heroische D&D-Magielogik.",
  },
  {
    id: "tomb-annihilation",
    label: "Tomb of Annihilation",
    emoji: "🦖",
    guide: "Tomb of Annihilation in Chult. Nutze Port Nyanzaru, Merchant Princes, Dinosaurier, Dschungelhexes, Untote, den Death Curse, Omu und Acereraks Tomb of the Nine Gods.",
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
