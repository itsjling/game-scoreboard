import type { ScoreboardAction, ScoreboardState, SortBy } from "./types"

export const scoreboardActions = {
  hydrate: (payload: ScoreboardState): ScoreboardAction => ({
    type: "hydrate",
    payload,
  }),
  setGameName: (name: string): ScoreboardAction => ({
    type: "set-game-name",
    payload: { name },
  }),
  regenerateGameName: (): ScoreboardAction => ({
    type: "regenerate-game-name",
  }),
  setGameStarted: (started: boolean): ScoreboardAction => ({
    type: "set-game-started",
    payload: { started },
  }),
  setEnableTeams: (enableTeams: boolean): ScoreboardAction => ({
    type: "set-enable-teams",
    payload: { enableTeams },
  }),
  setSortBy: (sortBy: SortBy): ScoreboardAction => ({
    type: "set-sort-by",
    payload: { sortBy },
  }),
  setNumberOfRounds: (numberOfRounds: number): ScoreboardAction => ({
    type: "set-number-of-rounds",
    payload: { numberOfRounds },
  }),
  setShowPerRoundScores: (showPerRoundScores: boolean): ScoreboardAction => ({
    type: "set-show-per-round-scores",
    payload: { showPerRoundScores },
  }),
  addPlayer: (name: string, color: string, teamId: string | null): ScoreboardAction => ({
    type: "add-player",
    payload: { name, color, teamId },
  }),
  setPlayerName: (playerId: string, name: string): ScoreboardAction => ({
    type: "set-player-name",
    payload: { playerId, name },
  }),
  setPlayerColor: (playerId: string, color: string): ScoreboardAction => ({
    type: "set-player-color",
    payload: { playerId, color },
  }),
  removePlayer: (playerId: string): ScoreboardAction => ({
    type: "remove-player",
    payload: { playerId },
  }),
  setPlayerTeam: (playerId: string, teamId: string | null): ScoreboardAction => ({
    type: "set-player-team",
    payload: { playerId, teamId },
  }),
  incrementPlayerScore: (playerId: string, delta: number): ScoreboardAction => ({
    type: "increment-player-score",
    payload: { playerId, delta },
  }),
  setPlayerExactScore: (playerId: string, score: number): ScoreboardAction => ({
    type: "set-player-exact-score",
    payload: { playerId, score },
  }),
  addTeam: (name: string, color: string): ScoreboardAction => ({
    type: "add-team",
    payload: { name, color },
  }),
  removeTeam: (teamId: string): ScoreboardAction => ({
    type: "remove-team",
    payload: { teamId },
  }),
  resetCurrentRound: (): ScoreboardAction => ({ type: "reset-current-round" }),
  previousRound: (): ScoreboardAction => ({ type: "previous-round" }),
  nextRound: (): ScoreboardAction => ({ type: "next-round" }),
  startNewGame: (): ScoreboardAction => ({ type: "start-new-game" }),
  resetEntireGame: (): ScoreboardAction => ({ type: "reset-entire-game" }),
  loadHistoryGame: (gameId: string): ScoreboardAction => ({
    type: "load-history-game",
    payload: { gameId },
  }),
  deleteHistoryGame: (gameId: string): ScoreboardAction => ({
    type: "delete-history-game",
    payload: { gameId },
  }),
  clearHistory: (): ScoreboardAction => ({ type: "clear-history" }),
  setSelectedHistoryGame: (gameId: string | null): ScoreboardAction => ({
    type: "set-selected-history-game",
    payload: { gameId },
  }),
}
