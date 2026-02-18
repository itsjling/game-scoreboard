export type SortBy = "name" | "score-asc" | "score-desc"

export interface Player {
  id: string
  name: string
  color: string
  scores: number[]
  teamId: string | null
}

export interface Team {
  id: string
  name: string
  color: string
}

export interface AppSettings {
  enableTeams: boolean
  sortBy: SortBy
  numberOfRounds: number
  currentRound: number
  showPerRoundScores: boolean
}

export interface ActiveGame {
  id: string
  name: string
  dateIso: string
  players: Player[]
  teams: Team[]
  settings: AppSettings
  started: boolean
}

export interface GameSnapshot {
  id: string
  name: string
  dateIso: string
  players: Player[]
  teams: Team[]
  settings: AppSettings
}

export interface ScoreboardUIState {
  selectedHistoryGameId: string | null
}

export interface ScoreboardState {
  activeGame: ActiveGame
  history: GameSnapshot[]
  ui: ScoreboardUIState
  schemaVersion: 2
}

export type ScoreboardAction =
  | { type: "hydrate"; payload: ScoreboardState }
  | { type: "set-game-name"; payload: { name: string } }
  | { type: "regenerate-game-name" }
  | { type: "set-game-started"; payload: { started: boolean } }
  | { type: "set-enable-teams"; payload: { enableTeams: boolean } }
  | { type: "set-sort-by"; payload: { sortBy: SortBy } }
  | { type: "set-number-of-rounds"; payload: { numberOfRounds: number } }
  | { type: "set-show-per-round-scores"; payload: { showPerRoundScores: boolean } }
  | { type: "add-player"; payload: { name: string; color: string; teamId: string | null } }
  | { type: "set-player-name"; payload: { playerId: string; name: string } }
  | { type: "set-player-color"; payload: { playerId: string; color: string } }
  | { type: "remove-player"; payload: { playerId: string } }
  | { type: "set-player-team"; payload: { playerId: string; teamId: string | null } }
  | { type: "increment-player-score"; payload: { playerId: string; delta: number } }
  | { type: "set-player-exact-score"; payload: { playerId: string; score: number } }
  | { type: "add-team"; payload: { name: string; color: string } }
  | { type: "remove-team"; payload: { teamId: string } }
  | { type: "reset-current-round" }
  | { type: "previous-round" }
  | { type: "next-round" }
  | { type: "start-new-game" }
  | { type: "reset-entire-game" }
  | { type: "load-history-game"; payload: { gameId: string } }
  | { type: "delete-history-game"; payload: { gameId: string } }
  | { type: "clear-history" }
  | { type: "set-selected-history-game"; payload: { gameId: string | null } }
