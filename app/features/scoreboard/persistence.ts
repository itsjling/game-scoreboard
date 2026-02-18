import { load, save } from "@/utils/storage"

import { SCOREBOARD_SCHEMA_VERSION, SCOREBOARD_STORAGE_KEY } from "./constants"
import { createInitialScoreboardState } from "./reducer"
import type { ScoreboardState } from "./types"

function isScoreboardState(value: unknown): value is ScoreboardState {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<ScoreboardState>
  return (
    candidate.schemaVersion === SCOREBOARD_SCHEMA_VERSION &&
    !!candidate.activeGame &&
    Array.isArray(candidate.history) &&
    !!candidate.ui
  )
}

export function migrateScoreboardState(value: unknown): ScoreboardState {
  if (isScoreboardState(value)) {
    return value
  }
  return createInitialScoreboardState()
}

export function loadScoreboardState(): ScoreboardState {
  const loaded = load<unknown>(SCOREBOARD_STORAGE_KEY)
  return migrateScoreboardState(loaded)
}

export function saveScoreboardState(state: ScoreboardState): boolean {
  return save(SCOREBOARD_STORAGE_KEY, state)
}
