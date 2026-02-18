# Scoreboard Parity Spec (Archived from Legacy Web App)

This document preserves the functional behavior from the previous TanStack web implementation so the Ignite rewrite remains behaviorally equivalent.

## Core Game Flow

- Single primary screen with two modes:
  - `Edit Game` mode: configure game name, teams, players, settings.
  - `Start Game` mode: lock setup and allow active score tracking.
- Game name can be edited manually before game start and can be regenerated randomly.
- Toggling start state switches between setup and scoring interactions.

## Players

- Add player with name required.
- Player has:
  - unique id
  - display name
  - color
  - score array per round
  - optional team id
- Remove player is allowed in edit mode.
- Score controls in started mode:
  - decrement by 1
  - increment by 1
  - direct numeric edit
- Direct numeric edit behavior:
  - in per-round mode, sets current round value directly
  - in accumulated mode, computes delta against total and applies to current round

## Teams

- Optional team mode toggle in settings/setup.
- Add team with unique name and color.
- Remove team detaches players from that team.
- If teams enabled:
  - players grouped under team sections
  - team totals displayed
  - unassigned players appear in a no-team section

## Rounds and Score Presentation

- Settings include number of rounds:
  - `0` means unlimited rounds
  - otherwise round navigation constrained by max rounds
- Current round starts at 1.
- Previous round unavailable at round 1.
- Next round creates missing score entries for players.
- Score display mode toggle:
  - `showPerRoundScores = true`: show score only for current round
  - `false`: show accumulated total up to current round
- Reset current round sets all players' current-round score to 0.

## Sorting

- Sort players by:
  - name ascending
  - score ascending (based on current display mode)
  - score descending (based on current display mode)

## History

- Current game can be persisted into game history when creating new game.
- Existing current game id in history is updated instead of duplicated.
- History records include:
  - game id
  - name
  - date ISO
  - players snapshot
  - teams snapshot
  - settings snapshot
- History UI supports:
  - current game round-by-round table
  - previous games list
  - expand one game to inspect score table
  - load game into active state
  - delete single game
  - clear all history

## Reset/New Game

- `New Game`:
  - archives current game snapshot if it has players
  - creates new game id and random name
  - clears players and teams
  - resets current round to 1
  - switches to edit mode
- `Reset Game`:
  - clears players and teams
  - resets settings to defaults
  - resets game id and random name
  - switches to edit mode

## Persistence

- Legacy app persisted all state to browser localStorage under `cardGameState`.
- Rewritten app intentionally uses a new storage key and no automatic migration.
