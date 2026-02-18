export const analyticsEvents = {
  appOpened: "app_opened",
  gameCreated: "game_created",
  gameStarted: "game_started",
  scoreChanged: "score_changed",
  roundChanged: "round_changed",
  settingsChanged: "settings_changed",
  historyLoadedGame: "history_loaded_game",
  historyDeletedGame: "history_deleted_game",
  historyCleared: "history_cleared",
} as const

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents]
