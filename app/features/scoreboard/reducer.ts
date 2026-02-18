import { DEFAULT_SETTINGS, SCOREBOARD_SCHEMA_VERSION } from "./constants"
import { createEntityId, generateGameName } from "./name-generator"
import {
  getHistoryGameById,
  getPlayerDisplayScore,
  getPlayersByTeam,
  getSortedPlayers,
  getTeamColor,
} from "./selectors"
import type {
  ActiveGame,
  AppSettings,
  GameSnapshot,
  Player,
  ScoreboardAction,
  ScoreboardState,
} from "./types"

function createInitialActiveGame(): ActiveGame {
  const gameId = createEntityId("game")
  return {
    id: gameId,
    name: generateGameName(),
    dateIso: new Date().toISOString(),
    players: [],
    teams: [],
    settings: { ...DEFAULT_SETTINGS },
    started: false,
  }
}

export function createInitialScoreboardState(): ScoreboardState {
  return {
    activeGame: createInitialActiveGame(),
    history: [],
    ui: {
      selectedHistoryGameId: null,
    },
    schemaVersion: SCOREBOARD_SCHEMA_VERSION,
  }
}

function ensureScoreLength(player: Player, currentRound: number): Player {
  if (player.scores.length >= currentRound) {
    return player
  }
  return {
    ...player,
    scores: [...player.scores, ...Array(currentRound - player.scores.length).fill(0)],
  }
}

function snapshotFromActiveGame(game: ActiveGame): GameSnapshot {
  return {
    id: game.id,
    name: game.name,
    dateIso: new Date().toISOString(),
    players: game.players,
    teams: game.teams,
    settings: game.settings,
  }
}

function upsertHistory(history: GameSnapshot[], snapshot: GameSnapshot): GameSnapshot[] {
  const index = history.findIndex((entry) => entry.id === snapshot.id)
  if (index >= 0) {
    const clone = [...history]
    clone[index] = snapshot
    return clone
  }
  return [...history, snapshot]
}

function withActiveGame(state: ScoreboardState, activeGame: ActiveGame): ScoreboardState {
  return {
    ...state,
    activeGame,
  }
}

function computeDisplayDelta(
  players: Player[],
  settings: AppSettings,
  playerId: string,
  targetScore: number,
): number {
  const player = players.find((entry) => entry.id === playerId)
  if (!player) {
    return 0
  }
  const currentDisplayScore = getPlayerDisplayScore(player, settings)
  return targetScore - currentDisplayScore
}

export function scoreboardReducer(
  state: ScoreboardState,
  action: ScoreboardAction,
): ScoreboardState {
  const active = state.activeGame

  switch (action.type) {
    case "hydrate":
      return action.payload

    case "set-game-name":
      return withActiveGame(state, {
        ...active,
        name: action.payload.name,
      })

    case "regenerate-game-name":
      return withActiveGame(state, {
        ...active,
        name: generateGameName(),
      })

    case "set-game-started":
      return withActiveGame(state, {
        ...active,
        started: action.payload.started,
      })

    case "set-enable-teams":
      return withActiveGame(state, {
        ...active,
        settings: {
          ...active.settings,
          enableTeams: action.payload.enableTeams,
        },
      })

    case "set-sort-by":
      return withActiveGame(state, {
        ...active,
        settings: {
          ...active.settings,
          sortBy: action.payload.sortBy,
        },
      })

    case "set-number-of-rounds": {
      const numberOfRounds = Math.max(0, action.payload.numberOfRounds)
      const currentRound =
        numberOfRounds > 0
          ? Math.min(active.settings.currentRound, numberOfRounds)
          : active.settings.currentRound

      return withActiveGame(state, {
        ...active,
        settings: {
          ...active.settings,
          numberOfRounds,
          currentRound,
        },
      })
    }

    case "set-show-per-round-scores":
      return withActiveGame(state, {
        ...active,
        settings: {
          ...active.settings,
          showPerRoundScores: action.payload.showPerRoundScores,
        },
      })

    case "add-player": {
      const name = action.payload.name.trim()
      if (!name) {
        return state
      }

      const player: Player = {
        id: createEntityId("player"),
        name,
        color:
          active.settings.enableTeams && action.payload.teamId
            ? getTeamColor(active.teams, action.payload.teamId)
            : action.payload.color,
        scores: Array(active.settings.currentRound).fill(0),
        teamId: active.settings.enableTeams ? action.payload.teamId : null,
      }

      return withActiveGame(state, {
        ...active,
        players: [...active.players, player],
      })
    }

    case "remove-player":
      return withActiveGame(state, {
        ...active,
        players: active.players.filter((player) => player.id !== action.payload.playerId),
      })

    case "set-player-team":
      return withActiveGame(state, {
        ...active,
        players: active.players.map((player) => {
          if (player.id !== action.payload.playerId) {
            return player
          }
          const teamColor = getTeamColor(active.teams, action.payload.teamId)
          return {
            ...player,
            teamId: action.payload.teamId,
            color: action.payload.teamId ? teamColor : player.color,
          }
        }),
      })

    case "increment-player-score":
      return withActiveGame(state, {
        ...active,
        players: active.players.map((player) => {
          if (player.id !== action.payload.playerId) {
            return player
          }
          const hydrated = ensureScoreLength(player, active.settings.currentRound)
          const scores = [...hydrated.scores]
          scores[active.settings.currentRound - 1] =
            (scores[active.settings.currentRound - 1] ?? 0) + action.payload.delta
          return {
            ...hydrated,
            scores,
          }
        }),
      })

    case "set-player-exact-score": {
      if (!active.settings.showPerRoundScores) {
        const delta = computeDisplayDelta(
          active.players,
          active.settings,
          action.payload.playerId,
          action.payload.score,
        )
        return scoreboardReducer(state, {
          type: "increment-player-score",
          payload: {
            playerId: action.payload.playerId,
            delta,
          },
        })
      }

      return withActiveGame(state, {
        ...active,
        players: active.players.map((player) => {
          if (player.id !== action.payload.playerId) {
            return player
          }
          const hydrated = ensureScoreLength(player, active.settings.currentRound)
          const scores = [...hydrated.scores]
          scores[active.settings.currentRound - 1] = action.payload.score
          return {
            ...hydrated,
            scores,
          }
        }),
      })
    }

    case "add-team": {
      const teamName = action.payload.name.trim()
      if (
        !teamName ||
        active.teams.some((team) => team.name.toLowerCase() === teamName.toLowerCase())
      ) {
        return state
      }
      return withActiveGame(state, {
        ...active,
        teams: [
          ...active.teams,
          {
            id: createEntityId("team"),
            name: teamName,
            color: action.payload.color,
          },
        ],
      })
    }

    case "remove-team":
      return withActiveGame(state, {
        ...active,
        teams: active.teams.filter((team) => team.id !== action.payload.teamId),
        players: active.players.map((player) =>
          player.teamId === action.payload.teamId ? { ...player, teamId: null } : player,
        ),
      })

    case "reset-current-round":
      return withActiveGame(state, {
        ...active,
        players: active.players.map((player) => {
          const hydrated = ensureScoreLength(player, active.settings.currentRound)
          const scores = [...hydrated.scores]
          scores[active.settings.currentRound - 1] = 0
          return {
            ...hydrated,
            scores,
          }
        }),
      })

    case "previous-round": {
      if (active.settings.currentRound <= 1) {
        return state
      }
      return withActiveGame(state, {
        ...active,
        settings: {
          ...active.settings,
          currentRound: active.settings.currentRound - 1,
        },
      })
    }

    case "next-round": {
      const canAdvance =
        active.settings.numberOfRounds === 0 ||
        active.settings.currentRound < active.settings.numberOfRounds
      if (!canAdvance) {
        return state
      }

      const nextRound = active.settings.currentRound + 1
      return withActiveGame(state, {
        ...active,
        settings: {
          ...active.settings,
          currentRound: nextRound,
        },
        players: active.players.map((player) => ensureScoreLength(player, nextRound)),
      })
    }

    case "start-new-game": {
      const currentHistory =
        active.players.length > 0
          ? upsertHistory(state.history, snapshotFromActiveGame(active))
          : state.history

      return {
        ...state,
        history: currentHistory,
        activeGame: {
          ...createInitialActiveGame(),
          settings: {
            ...active.settings,
            currentRound: 1,
          },
        },
        ui: {
          ...state.ui,
          selectedHistoryGameId: null,
        },
      }
    }

    case "reset-entire-game":
      return {
        ...state,
        activeGame: createInitialActiveGame(),
      }

    case "load-history-game": {
      const historyGame = getHistoryGameById(state, action.payload.gameId)
      if (!historyGame) {
        return state
      }

      return {
        ...state,
        activeGame: {
          ...historyGame,
          settings: {
            ...historyGame.settings,
            currentRound: 1,
          },
          started: false,
        },
      }
    }

    case "delete-history-game":
      return {
        ...state,
        history: state.history.filter((game) => game.id !== action.payload.gameId),
        ui: {
          ...state.ui,
          selectedHistoryGameId:
            state.ui.selectedHistoryGameId === action.payload.gameId
              ? null
              : state.ui.selectedHistoryGameId,
        },
      }

    case "clear-history":
      return {
        ...state,
        history: [],
        ui: {
          ...state.ui,
          selectedHistoryGameId: null,
        },
      }

    case "set-selected-history-game":
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedHistoryGameId: action.payload.gameId,
        },
      }

    default:
      return state
  }
}

export function getSortedPlayersForGame(game: GameSnapshot): Player[] {
  return getSortedPlayers(game.players, {
    ...game.settings,
    showPerRoundScores: false,
  })
}

export function getPlayersByTeamForGame(game: GameSnapshot) {
  return getPlayersByTeam(getSortedPlayersForGame(game))
}
