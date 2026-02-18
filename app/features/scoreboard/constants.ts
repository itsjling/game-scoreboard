import type { AppSettings } from "./types"

export const SCOREBOARD_SCHEMA_VERSION = 2 as const
export const SCOREBOARD_STORAGE_KEY = "scoreboard.v2.state"

export const DEFAULT_SETTINGS: AppSettings = {
  enableTeams: false,
  sortBy: "name",
  numberOfRounds: 0,
  currentRound: 1,
  showPerRoundScores: true,
}

export const BRUTAL_ACCENT_COLORS = [
  "#FF3B30",
  "#FFD60A",
  "#0A84FF",
  "#34C759",
  "#FF9F0A",
  "#BF5AF2",
] as const
