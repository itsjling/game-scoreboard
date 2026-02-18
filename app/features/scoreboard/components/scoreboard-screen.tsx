import { FC, useEffect, useMemo, useReducer, useState } from "react"
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  Switch,
  UIManager,
  View,
  useWindowDimensions,
} from "react-native"

import { Screen } from "@/components/Screen"
import { scoreboardActions } from "@/features/scoreboard/actions"
import { generateBrutalColor } from "@/features/scoreboard/name-generator"
import { loadScoreboardState, saveScoreboardState } from "@/features/scoreboard/persistence"
import { createInitialScoreboardState, scoreboardReducer } from "@/features/scoreboard/reducer"
import {
  getPlayerDisplayScore,
  getPlayersByTeam,
  getSortedPlayers,
  getTeamName,
  getTeamScores,
} from "@/features/scoreboard/selectors"
import type { GameSnapshot } from "@/features/scoreboard/types"
import { analyticsEvents } from "@/services/analytics/events"
import { analytics } from "@/services/analytics/posthog-client"
import {
  BrutalButton,
  BrutalHeading,
  BrutalInput,
  BrutalSection,
  BrutalText,
  ColorDot,
} from "@/theme/neo-brutal/primitives"
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme"

import { HistoryModal } from "./history-modal"
import { PlayerCard } from "./player-card"
import { RoundHeader } from "./round-header"
import { SettingsModal } from "./settings-modal"
import { TeamSection } from "./team-section"

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export const ScoreboardScreen: FC = function ScoreboardScreen() {
  const { tokens, themeMode, setThemeMode } = useNeoBrutalTheme()
  const { width } = useWindowDimensions()
  const isCompact = width < 430

  const [state, dispatch] = useReducer(scoreboardReducer, undefined, () => loadScoreboardState())

  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerColor, setNewPlayerColor] = useState(generateBrutalColor())
  const [newPlayerTeamId, setNewPlayerTeamId] = useState<string | null>(null)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamColor, setNewTeamColor] = useState(generateBrutalColor())
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)

  const active = state.activeGame

  useEffect(() => {
    analytics.init()
    analytics.capture(analyticsEvents.appOpened, {
      platform: Platform.OS,
    })
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveScoreboardState(state)
    }, 250)

    return () => clearTimeout(timeout)
  }, [state])

  const sortedPlayers = useMemo(
    () => getSortedPlayers(active.players, active.settings),
    [active.players, active.settings],
  )
  const playersByTeam = useMemo(() => getPlayersByTeam(sortedPlayers), [sortedPlayers])
  const teamScores = useMemo(
    () => getTeamScores(playersByTeam, active.settings),
    [playersByTeam, active.settings],
  )

  const displayScoresById = useMemo(() => {
    return active.players.reduce<Record<string, number>>((acc, player) => {
      acc[player.id] = getPlayerDisplayScore(player, active.settings)
      return acc
    }, {})
  }, [active.players, active.settings])

  const canGoNextRound =
    active.started &&
    (active.settings.numberOfRounds === 0 ||
      active.settings.currentRound < active.settings.numberOfRounds)

  const currentGameSnapshot: GameSnapshot = useMemo(
    () => ({
      id: active.id,
      name: active.name,
      dateIso: active.dateIso,
      players: active.players,
      teams: active.teams,
      settings: active.settings,
    }),
    [active],
  )

  const addPlayer = () => {
    dispatch(scoreboardActions.addPlayer(newPlayerName, newPlayerColor, newPlayerTeamId))
    setNewPlayerName("")
    setNewPlayerColor(generateBrutalColor())
  }

  const addTeam = () => {
    dispatch(scoreboardActions.addTeam(newTeamName, newTeamColor))
    setNewTeamName("")
    setNewTeamColor(generateBrutalColor())
  }

  const updateScore = (playerId: string, delta: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    dispatch(scoreboardActions.incrementPlayerScore(playerId, delta))
    analytics.capture(analyticsEvents.scoreChanged, {
      gameId: active.id,
      playerId,
      delta,
      round: active.settings.currentRound,
    })
  }

  const setExactScore = (playerId: string, score: number) => {
    dispatch(scoreboardActions.setPlayerExactScore(playerId, score))
    analytics.capture(analyticsEvents.scoreChanged, {
      gameId: active.id,
      playerId,
      exactScore: score,
      round: active.settings.currentRound,
    })
  }

  const startNewGame = () => {
    dispatch(scoreboardActions.startNewGame())
    analytics.capture(analyticsEvents.gameCreated)
  }

  const resetGame = () => {
    dispatch(scoreboardActions.resetEntireGame())
    analytics.capture(analyticsEvents.gameCreated, {
      reason: "reset",
    })
  }

  const toggleStarted = () => {
    const nextStarted = !active.started
    dispatch(scoreboardActions.setGameStarted(nextStarted))
    analytics.capture(analyticsEvents.gameStarted, {
      started: nextStarted,
      players: active.players.length,
    })
  }

  const goPreviousRound = () => {
    dispatch(scoreboardActions.previousRound())
    analytics.capture(analyticsEvents.roundChanged, {
      direction: "prev",
      round: active.settings.currentRound - 1,
    })
  }

  const goNextRound = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    dispatch(scoreboardActions.nextRound())
    analytics.capture(analyticsEvents.roundChanged, {
      direction: "next",
      round: active.settings.currentRound + 1,
    })
  }

  return (
    <Screen
      preset="scroll"
      backgroundColor={tokens.color.background}
      contentContainerStyle={{
        paddingHorizontal: 0,
        paddingVertical: 0,
        gap: 0,
        backgroundColor: tokens.color.background,
      }}
      ScrollViewProps={{ contentInsetAdjustmentBehavior: "automatic" }}
    >
      <View
        style={{
          gap: 0,
          paddingHorizontal: isCompact ? 12 : 16,
          paddingVertical: 10,
          backgroundColor: tokens.color.yellow,
        }}
      >
        {active.started ? (
          <BrutalHeading
            numberOfLines={1}
            style={{ fontSize: isCompact ? 24 : 28, color: tokens.color.background }}
          >
            {active.name}
          </BrutalHeading>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0, paddingBottom: 10 }}>
            <BrutalInput
              value={active.name}
              onChangeText={(value) => dispatch(scoreboardActions.setGameName(value))}
              placeholder="Game Name"
              accessibilityLabel="Game name"
              style={{ flex: 1, backgroundColor: tokens.color.surface }}
            />
            <BrutalButton
              label="Rand"
              onPress={() => dispatch(scoreboardActions.regenerateGameName())}
              color={tokens.color.purple}
            />
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 0 }}>
          <BrutalButton
            label="History"
            onPress={() => setHistoryVisible(true)}
            color={tokens.color.surfaceAlt}
            style={{ flex: 1 }}
          />
          <BrutalButton
            label="Settings"
            onPress={() => setSettingsVisible(true)}
            color={tokens.color.surface}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: isCompact ? 12 : 16, paddingVertical: 8, gap: 4 }}>
        {active.started ? (
          <RoundHeader
            currentRound={active.settings.currentRound}
            numberOfRounds={active.settings.numberOfRounds}
            canGoPrevious={active.settings.currentRound > 1}
            canGoNext={canGoNextRound}
            onPreviousRound={goPreviousRound}
            onNextRound={goNextRound}
          />
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 14,
                backgroundColor: tokens.color.surface,
              }}
            >
              <BrutalText
                style={{
                  fontFamily: tokens.typography.heading,
                  textTransform: "uppercase",
                  fontSize: 14,
                  flex: 1,
                }}
              >
                Group players into teams
              </BrutalText>
              <Switch
                value={active.settings.enableTeams}
                onValueChange={(value) => {
                  dispatch(scoreboardActions.setEnableTeams(value))
                  analytics.capture(analyticsEvents.settingsChanged, { enableTeams: value })
                }}
              />
            </View>

            {active.settings.enableTeams ? (
              <BrutalSection title="Team Setup">
                <View style={{ flexDirection: isCompact ? "column" : "row", gap: 0 }}>
                  <View style={{ flexDirection: "row", gap: 0, flex: 1 }}>
                    <BrutalInput
                      value={newTeamName}
                      onChangeText={setNewTeamName}
                      placeholder="Team name"
                      style={{ flex: 1 }}
                      accessibilityLabel="Team name"
                    />
                    <BrutalInput
                      value={newTeamColor}
                      onChangeText={setNewTeamColor}
                      autoCapitalize="characters"
                      style={{ width: 102, fontFamily: tokens.typography.mono }}
                      accessibilityLabel="Team color hex"
                    />
                  </View>
                  <BrutalButton
                    label="Add"
                    onPress={addTeam}
                    color={tokens.color.green}
                    style={{ width: isCompact ? "100%" : 72 }}
                  />
                </View>

                {active.teams.length > 0 ? (
                  <View style={{ gap: 0 }}>
                    {active.teams.map((team) => (
                      <View
                        key={team.id}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: tokens.color.border,
                          paddingVertical: 10,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}
                        >
                          <ColorDot color={team.color} />
                          <BrutalText
                            selectable
                            style={{
                              fontFamily: tokens.typography.heading,
                              textTransform: "uppercase",
                            }}
                          >
                            {team.name}
                          </BrutalText>
                        </View>
                        <BrutalButton
                          label="Remove"
                          onPress={() => dispatch(scoreboardActions.removeTeam(team.id))}
                          color={tokens.color.red}
                        />
                      </View>
                    ))}
                  </View>
                ) : null}
              </BrutalSection>
            ) : null}

            <BrutalSection title="Add Player">
              <View style={{ flexDirection: isCompact ? "column" : "row", gap: 0 }}>
                <View style={{ flexDirection: "row", gap: 0, flex: 1 }}>
                  <BrutalInput
                    value={newPlayerName}
                    onChangeText={setNewPlayerName}
                    placeholder="Player name"
                    style={{ flex: 1 }}
                    accessibilityLabel="Player name"
                  />

                  {!active.settings.enableTeams ? (
                    <BrutalInput
                      value={newPlayerColor}
                      onChangeText={setNewPlayerColor}
                      autoCapitalize="characters"
                      style={{ width: 102, fontFamily: tokens.typography.mono }}
                      accessibilityLabel="Player color hex"
                    />
                  ) : null}
                </View>

                <BrutalButton
                  label="Add"
                  onPress={addPlayer}
                  color={tokens.color.green}
                  style={{ width: isCompact ? "100%" : 72 }}
                />
              </View>

              {active.settings.enableTeams && active.teams.length > 0 ? (
                <View style={{ gap: 0 }}>
                  <BrutalText
                    style={{ fontFamily: tokens.typography.heading, textTransform: "uppercase" }}
                  >
                    Team assignment
                  </BrutalText>
                  <ScrollView horizontal contentContainerStyle={{ gap: 0 }}>
                    <BrutalButton
                      label="No Team"
                      onPress={() => setNewPlayerTeamId(null)}
                      color={
                        newPlayerTeamId === null ? tokens.color.yellow : tokens.color.surfaceAlt
                      }
                    />
                    {active.teams.map((team) => (
                      <BrutalButton
                        key={team.id}
                        label={team.name}
                        onPress={() => setNewPlayerTeamId(team.id)}
                        color={newPlayerTeamId === team.id ? team.color : tokens.color.surfaceAlt}
                      />
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </BrutalSection>
          </>
        )}

        {active.settings.enableTeams ? (
          <View style={{ gap: 0 }}>
            {Object.entries(playersByTeam).map(([teamKey, players]) => {
              const teamId = teamKey === "no-team" ? null : teamKey
              const team = active.teams.find((entry) => entry.id === teamId)

              return (
                <TeamSection
                  key={teamKey}
                  title={getTeamName(active.teams, teamId)}
                  color={team?.color ?? tokens.color.mutedInk}
                  totalScore={teamScores[teamKey] ?? 0}
                  players={players}
                  displayScoreById={displayScoresById}
                  gameStarted={active.started}
                  onIncrement={updateScore}
                  onSetExactScore={setExactScore}
                  onRemove={(playerId) => dispatch(scoreboardActions.removePlayer(playerId))}
                />
              )
            })}
          </View>
        ) : (
          <View style={{ gap: 0 }}>
            {sortedPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                displayScore={displayScoresById[player.id] ?? 0}
                gameStarted={active.started}
                onIncrement={updateScore}
                onSetExactScore={setExactScore}
                onRemove={(playerId) => dispatch(scoreboardActions.removePlayer(playerId))}
              />
            ))}
          </View>
        )}

        <View style={{ gap: 0, paddingTop: 0 }}>
          <BrutalButton
            label={active.started ? "Edit Game" : "Start Game"}
            onPress={toggleStarted}
            color={active.started ? tokens.color.surfaceAlt : tokens.color.yellow}
          />
          {active.players.length === 0 ? (
            <BrutalText
              selectable
              style={{
                textAlign: "center",
                fontFamily: tokens.typography.heading,
                fontSize: 12,
              }}
            >
              Add players to start tracking scores
            </BrutalText>
          ) : null}
        </View>
      </View>

      <SettingsModal
        visible={settingsVisible}
        settings={active.settings}
        onClose={() => setSettingsVisible(false)}
        onToggleAccumulated={(showPerRound) => {
          dispatch(scoreboardActions.setShowPerRoundScores(showPerRound))
          analytics.capture(analyticsEvents.settingsChanged, {
            showPerRoundScores: showPerRound,
          })
        }}
        onChangeSortBy={(sortBy) => {
          dispatch(scoreboardActions.setSortBy(sortBy))
          analytics.capture(analyticsEvents.settingsChanged, { sortBy })
        }}
        onChangeNumberOfRounds={(value) => {
          dispatch(scoreboardActions.setNumberOfRounds(value))
          analytics.capture(analyticsEvents.settingsChanged, { numberOfRounds: value })
        }}
        onResetRound={() => dispatch(scoreboardActions.resetCurrentRound())}
        onNewGame={startNewGame}
        onResetGame={resetGame}
        themeMode={themeMode}
        onChangeThemeMode={(mode) => setThemeMode(mode)}
      />

      <HistoryModal
        visible={historyVisible}
        currentGame={currentGameSnapshot}
        history={state.history}
        selectedGameId={state.ui.selectedHistoryGameId}
        onClose={() => setHistoryVisible(false)}
        onSelectGame={(gameId) => dispatch(scoreboardActions.setSelectedHistoryGame(gameId))}
        onLoadGame={(gameId) => {
          dispatch(scoreboardActions.loadHistoryGame(gameId))
          analytics.capture(analyticsEvents.historyLoadedGame, { gameId })
          setHistoryVisible(false)
        }}
        onDeleteGame={(gameId) => {
          dispatch(scoreboardActions.deleteHistoryGame(gameId))
          analytics.capture(analyticsEvents.historyDeletedGame, { gameId })
        }}
        onClearHistory={() => {
          dispatch(scoreboardActions.clearHistory())
          analytics.capture(analyticsEvents.historyCleared)
        }}
      />
    </Screen>
  )
}

export function createScoreboardStateForTests() {
  return createInitialScoreboardState()
}
