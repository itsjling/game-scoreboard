export type SortBy = "name" | "score-asc" | "score-desc";

export interface Player {
  color: string;
  id: string;
  name: string;
  scores: number[];
  teamId: string | null;
}

export interface Team {
  color: string;
  id: string;
  name: string;
}

export interface AppSettings {
  currentRound: number;
  enableTeams: boolean;
  numberOfRounds: number;
  showPerRoundScores: boolean;
  sortBy: SortBy;
}

export interface ActiveGame {
  dateIso: string;
  id: string;
  name: string;
  players: Player[];
  settings: AppSettings;
  started: boolean;
  teams: Team[];
}

export interface GameSnapshot {
  dateIso: string;
  id: string;
  name: string;
  players: Player[];
  settings: AppSettings;
  teams: Team[];
}

export interface ScoreboardUIState {
  selectedHistoryGameId: string | null;
}

export interface ScoreboardState {
  activeGame: ActiveGame;
  history: GameSnapshot[];
  schemaVersion: 2;
  ui: ScoreboardUIState;
}

export type ScoreboardAction =
  | { type: "hydrate"; payload: ScoreboardState }
  | { type: "set-game-name"; payload: { name: string } }
  | { type: "regenerate-game-name" }
  | { type: "set-game-started"; payload: { started: boolean } }
  | { type: "set-enable-teams"; payload: { enableTeams: boolean } }
  | { type: "set-sort-by"; payload: { sortBy: SortBy } }
  | { type: "set-number-of-rounds"; payload: { numberOfRounds: number } }
  | {
      type: "set-show-per-round-scores";
      payload: { showPerRoundScores: boolean };
    }
  | {
      type: "add-player";
      payload: { name: string; color: string; teamId: string | null };
    }
  | { type: "set-player-name"; payload: { playerId: string; name: string } }
  | { type: "set-player-color"; payload: { playerId: string; color: string } }
  | { type: "remove-player"; payload: { playerId: string } }
  | {
      type: "set-player-team";
      payload: { playerId: string; teamId: string | null };
    }
  | {
      type: "increment-player-score";
      payload: { playerId: string; delta: number };
    }
  | {
      type: "set-player-exact-score";
      payload: { playerId: string; score: number };
    }
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
  | { type: "set-selected-history-game"; payload: { gameId: string | null } };
