import { FC, ReactNode, useEffect, useMemo, useReducer, useState } from "react"
import {
  LayoutAnimation,
  Platform,
  Pressable,
  TextInput,
  UIManager,
  View,
  useWindowDimensions,
} from "react-native"
import {
  Edit3,
  GripVertical,
  Palette,
  Pencil,
  Play,
  Settings,
  Shuffle,
  Trash2,
  UserPlus,
  type LucideIcon,
} from "lucide-react-native"

import { Screen } from "@/components/Screen"
import { scoreboardActions } from "@/features/scoreboard/actions"
import { BRUTAL_ACCENT_COLORS } from "@/features/scoreboard/constants"
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
import type { GameSnapshot, Player, Team } from "@/features/scoreboard/types"
import { analyticsEvents } from "@/services/analytics/events"
import { analytics } from "@/services/analytics/posthog-client"
import { BrutalText } from "@/theme/neo-brutal/primitives"
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme"

import { HistoryModal } from "./history-modal"
import { PlayerCard } from "./player-card"
import { RoundHeader, RoundNavigation } from "./round-header"
import { SettingsModal } from "./settings-modal"
import { TeamSection } from "./team-section"

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const setupColors = {
  background: "#E7E7E8",
  surface: "#F4F4F5",
  border: "#000000",
  sectionText: "#61646C",
  inputPlaceholder: "#9BA2B0",
  cyan: "#59C7E8",
  pink: "#F059C8",
  yellow: "#FDE100",
  green: "#8EEB2E",
  muted: "#BFC1C7",
}

const DEFAULT_TEAMS: Array<{ name: string; color: string }> = [
  { name: "Team A", color: setupColors.yellow },
  { name: "Team B", color: setupColors.green },
]

function getNextAccentColor(current: string) {
  const currentIndex = BRUTAL_ACCENT_COLORS.findIndex(
    (accent) => accent.toLowerCase() === current.toLowerCase(),
  )
  if (currentIndex < 0) {
    return BRUTAL_ACCENT_COLORS[0]
  }
  return BRUTAL_ACCENT_COLORS[(currentIndex + 1) % BRUTAL_ACCENT_COLORS.length]
}

export const ScoreboardScreen: FC = function ScoreboardScreen() {
  const { tokens } = useNeoBrutalTheme()
  const { width, height } = useWindowDimensions()
  const isCompact = width < 430

  const [state, dispatch] = useReducer(scoreboardReducer, undefined, () => loadScoreboardState())

  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerColor, setNewPlayerColor] = useState(generateBrutalColor())
  const [newPlayerTeamId, setNewPlayerTeamId] = useState<string | null>(null)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [isEditingGameName, setIsEditingGameName] = useState(false)
  const [draftGameName, setDraftGameName] = useState("")

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

  useEffect(() => {
    if (!isEditingGameName) {
      setDraftGameName(active.name)
    }
  }, [active.name, isEditingGameName])

  useEffect(() => {
    if (!active.settings.enableTeams || active.teams.length === 0) {
      return
    }

    const unassignedPlayers = active.players.filter((player) => player.teamId === null)
    if (unassignedPlayers.length === 0) {
      return
    }

    unassignedPlayers.forEach((player, index) => {
      const team = active.teams[index % active.teams.length]
      if (!team) {
        return
      }
      dispatch(scoreboardActions.setPlayerTeam(player.id, team.id))
    })
  }, [active.players, active.settings.enableTeams, active.teams])

  useEffect(() => {
    if (!active.settings.enableTeams) {
      setNewPlayerTeamId(null)
      return
    }

    if (newPlayerTeamId && active.teams.some((team) => team.id === newPlayerTeamId)) {
      return
    }

    setNewPlayerTeamId(active.teams[0]?.id ?? null)
  }, [active.settings.enableTeams, active.teams, newPlayerTeamId])

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

  const canStartGame = active.players.some((player) => player.name.trim().length > 0)

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

  const initializeDefaultTeams = () => {
    if (active.teams.length > 0) {
      return
    }

    DEFAULT_TEAMS.forEach((team) => {
      dispatch(scoreboardActions.addTeam(team.name, team.color))
    })
  }

  const setTeamsEnabled = (value: boolean) => {
    dispatch(scoreboardActions.setEnableTeams(value))
    analytics.capture(analyticsEvents.settingsChanged, { enableTeams: value })

    if (value) {
      initializeDefaultTeams()
    }
  }

  const addPlayer = () => {
    let teamId = newPlayerTeamId

    if (active.settings.enableTeams && !teamId && active.teams.length > 0) {
      const teamWithFewestPlayers = [...active.teams]
        .map((team) => ({ teamId: team.id, count: (playersByTeam[team.id] ?? []).length }))
        .sort((a, b) => a.count - b.count)[0]

      teamId = teamWithFewestPlayers?.teamId ?? active.teams[0].id
    }

    dispatch(scoreboardActions.addPlayer(newPlayerName, newPlayerColor, teamId ?? null))
    setNewPlayerName("")
    setNewPlayerColor(generateBrutalColor())
  }

  const updatePlayerName = (playerId: string, name: string) => {
    dispatch(scoreboardActions.setPlayerName(playerId, name))
  }

  const updatePlayerColor = (playerId: string, color: string) => {
    dispatch(scoreboardActions.setPlayerColor(playerId, color))
  }

  const cyclePlayerTeam = (player: Player) => {
    if (active.teams.length === 0) {
      return
    }

    const currentIndex = active.teams.findIndex((team) => team.id === player.teamId)
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % active.teams.length
    dispatch(scoreboardActions.setPlayerTeam(player.id, active.teams[nextIndex].id))
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

  const toggleStarted = () => {
    if (!active.started && !canStartGame) {
      return
    }

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

  const saveGameName = () => {
    dispatch(scoreboardActions.setGameName(draftGameName.trim() || active.name))
    setIsEditingGameName(false)
  }

  const setupBodyMinHeight = Math.max(height - 250, 560)

  return (
    <Screen
      preset="scroll"
      backgroundColor={setupColors.background}
      contentContainerStyle={{
        paddingHorizontal: 0,
        paddingVertical: 0,
        gap: 0,
        backgroundColor: setupColors.background,
      }}
      ScrollViewProps={{ contentInsetAdjustmentBehavior: "automatic" }}
    >
      <View style={{ backgroundColor: setupColors.background }}>
        <View
          style={{
            paddingHorizontal: isCompact ? 16 : 18,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <View style={{ flex: 1 }}>
            {isEditingGameName && !active.started ? (
              <ShadowFrame>
                <View
                  style={{
                    borderWidth: 4,
                    borderColor: setupColors.border,
                    backgroundColor: setupColors.surface,
                    minHeight: 56,
                    justifyContent: "center",
                  }}
                >
                  <TextInput
                    accessibilityLabel="Game name"
                    value={draftGameName}
                    onChangeText={setDraftGameName}
                    onSubmitEditing={saveGameName}
                    onBlur={saveGameName}
                    selectionColor={setupColors.cyan}
                    placeholder="Game Name"
                    style={{
                      borderWidth: 0,
                      backgroundColor: "transparent",
                      paddingHorizontal: 14,
                      color: setupColors.border,
                      fontFamily: tokens.typography.body,
                      textTransform: "uppercase",
                      fontSize: isCompact ? 24 : 28,
                      minHeight: 48,
                    }}
                  />
                </View>
              </ShadowFrame>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => !active.started && setIsEditingGameName(true)}
              >
                <BrutalText
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={{
                    fontFamily: tokens.typography.heading,
                    fontSize: isCompact ? 30 : 34,
                    lineHeight: isCompact ? 32 : 36,
                    fontStyle: "italic",
                    textTransform: "uppercase",
                    color: setupColors.border,
                  }}
                >
                  {active.name}
                </BrutalText>
              </Pressable>
            )}
          </View>

          {!active.started && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <SetupIconButton
                icon={Pencil}
                color={setupColors.cyan}
                accessibilityLabel="Edit game name"
                onPress={() => setIsEditingGameName((prev) => !prev)}
                onLongPress={() => {
                  dispatch(scoreboardActions.regenerateGameName())
                }}
              />
              <SetupIconButton
                icon={Shuffle}
                color={setupColors.pink}
                accessibilityLabel="Shuffle game name"
                onPress={() => {
                  dispatch(scoreboardActions.regenerateGameName())
                }}
                onLongPress={() => setHistoryVisible(true)}
              />
            </View>
          )}
        </View>

        <View style={{ height: 5, backgroundColor: setupColors.border }} />

        {active.started ? (
          <View style={{ minHeight: setupBodyMinHeight, justifyContent: "space-between" }}>
            <View style={{ paddingHorizontal: isCompact ? 12 : 16, paddingVertical: 8, gap: 4 }}>
              <RoundHeader
                currentRound={active.settings.currentRound}
                numberOfRounds={active.settings.numberOfRounds}
                _canGoPrevious={active.settings.currentRound > 1}
                _canGoNext={canGoNextRound}
                isTeamMode={active.settings.enableTeams}
                _onPreviousRound={goPreviousRound}
                _onNextRound={goNextRound}
                onShowHistory={() => setHistoryVisible(true)}
                onClose={toggleStarted}
              />

              <View style={{ height: 4, backgroundColor: "#000000", marginVertical: 8 }} />

              {active.settings.enableTeams ? (
                <View style={{ gap: 0, paddingTop: 8 }}>
                  {Object.entries(playersByTeam).map(([teamKey, players]) => {
                    const teamId = teamKey === "no-team" ? null : teamKey
                    const team = active.teams.find((entry) => entry.id === teamId)

                    return (
                      <TeamSection
                        key={teamKey}
                        title={getTeamName(active.teams, teamId)}
                        color={team?.color ?? setupColors.muted}
                        totalScore={teamScores[teamKey] ?? 0}
                        players={players}
                        displayScoreById={displayScoresById}
                        gameStarted={active.started}
                        onIncrement={updateScore}
                        onSetExactScore={setExactScore}
                        _onRemove={(playerId: string) =>
                          dispatch(scoreboardActions.removePlayer(playerId))
                        }
                      />
                    )
                  })}
                </View>
              ) : (
                <View style={{ gap: 0, paddingTop: 8 }}>
                  {sortedPlayers.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      displayScore={displayScoresById[player.id] ?? 0}
                      gameStarted={active.started}
                      onIncrement={updateScore}
                      onSetExactScore={setExactScore}
                      _onRemove={(playerId: string) =>
                        dispatch(scoreboardActions.removePlayer(playerId))
                      }
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={{ borderTopWidth: 4, borderTopColor: "#000000", marginTop: 16 }}>
              <RoundNavigation
                canGoPrevious={active.settings.currentRound > 1}
                canGoNext={canGoNextRound}
                onPreviousRound={goPreviousRound}
                onNextRound={goNextRound}
              />
            </View>
          </View>
        ) : (
          <View style={{ minHeight: setupBodyMinHeight, justifyContent: "space-between" }}>
            <View style={{ paddingHorizontal: isCompact ? 12 : 16, paddingVertical: 12, gap: 14 }}>
              {active.settings.enableTeams ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <SectionHeading label="Team Assignment" />
                    <View
                      style={{
                        borderWidth: 4,
                        borderColor: setupColors.border,
                        backgroundColor: setupColors.border,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <BrutalText
                        style={{
                          fontFamily: tokens.typography.heading,
                          color: "#FFFFFF",
                          textTransform: "uppercase",
                          fontSize: 18,
                        }}
                      >
                        Teams Mode On
                      </BrutalText>
                    </View>
                  </View>

                  {active.teams.map((team, index) => (
                    <TeamAssignmentBox
                      key={team.id}
                      team={team}
                      playerCount={playersByTeam[team.id]?.length ?? 0}
                      borderColor={index % 2 === 0 ? setupColors.yellow : setupColors.green}
                    >
                      {(playersByTeam[team.id] ?? []).map((player) => (
                        <TeamPlayerRow
                          key={player.id}
                          player={player}
                          onNameChange={updatePlayerName}
                          onLongPress={() => cyclePlayerTeam(player)}
                        />
                      ))}
                      {(playersByTeam[team.id] ?? []).length === 0 ? (
                        <View
                          style={{
                            borderWidth: 4,
                            borderStyle: "dashed",
                            borderColor: setupColors.muted,
                            paddingVertical: 18,
                            alignItems: "center",
                          }}
                        >
                          <BrutalText
                            style={{
                              fontFamily: tokens.typography.heading,
                              textTransform: "uppercase",
                              color: setupColors.muted,
                              fontSize: 22,
                            }}
                          >
                            Drop Player Here
                          </BrutalText>
                        </View>
                      ) : null}
                    </TeamAssignmentBox>
                  ))}

                  {(playersByTeam["no-team"] ?? []).length > 0 ? (
                    <TeamAssignmentBox
                      team={{ id: "no-team", name: "No Team", color: "#D4D5D8" }}
                      playerCount={playersByTeam["no-team"]?.length ?? 0}
                      borderColor="#979AA3"
                    >
                      {(playersByTeam["no-team"] ?? []).map((player) => (
                        <TeamPlayerRow
                          key={player.id}
                          player={player}
                          onNameChange={updatePlayerName}
                          onLongPress={() => cyclePlayerTeam(player)}
                        />
                      ))}
                    </TeamAssignmentBox>
                  ) : null}

                  <ShadowActionButton
                    label="Add Player"
                    icon={UserPlus}
                    color="#FFFFFF"
                    textColor={setupColors.border}
                    onPress={addPlayer}
                  />
                </>
              ) : (
                <>
                  <SectionHeading label="Current Players" />

                  {active.players.map((player, index) => (
                    <EditablePlayerRow
                      key={player.id}
                      player={player}
                      index={index}
                      onChangeName={updatePlayerName}
                      onCycleColor={(playerId, currentColor) =>
                        updatePlayerColor(playerId, getNextAccentColor(currentColor))
                      }
                      onRemove={(playerId) => dispatch(scoreboardActions.removePlayer(playerId))}
                    />
                  ))}

                  <ShadowActionButton
                    label="Add Player"
                    icon={UserPlus}
                    color={setupColors.cyan}
                    textColor={setupColors.border}
                    onPress={addPlayer}
                  />
                </>
              )}
            </View>

            <View style={{ borderTopWidth: 5, borderTopColor: setupColors.border }}>
              <View
                style={{ paddingHorizontal: isCompact ? 12 : 16, paddingVertical: 16, gap: 16 }}
              >
                <ShadowActionButton
                  label="Advanced Settings"
                  icon={Settings}
                  color="#FFFFFF"
                  textColor={setupColors.border}
                  onPress={() => setSettingsVisible(true)}
                />

                <ShadowActionButton
                  label={active.started ? "Edit Game" : "Start Game"}
                  icon={active.started ? Edit3 : Play}
                  color={active.started ? "#FFFFFF" : setupColors.yellow}
                  textColor={setupColors.border}
                  disabled={!active.started && !canStartGame}
                  onPress={toggleStarted}
                />

                {!canStartGame ? (
                  <BrutalText
                    style={{
                      textAlign: "center",
                      fontFamily: tokens.typography.heading,
                      textTransform: "uppercase",
                      color: setupColors.sectionText,
                      fontSize: 17,
                    }}
                  >
                    Add at least one player to start
                  </BrutalText>
                ) : null}
              </View>
            </View>
          </View>
        )}
      </View>

      <SettingsModal
        visible={settingsVisible}
        settings={active.settings}
        onClose={() => setSettingsVisible(false)}
        onToggleTeams={(value) => setTeamsEnabled(value)}
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

function SectionHeading({ label }: { label: string }) {
  const { tokens } = useNeoBrutalTheme()

  return (
    <BrutalText
      style={{
        fontFamily: tokens.typography.heading,
        fontSize: 20,
        letterSpacing: 2.2,
        color: setupColors.sectionText,
        textTransform: "uppercase",
      }}
    >
      {label}
    </BrutalText>
  )
}

function EditablePlayerRow({
  player,
  index,
  onChangeName,
  onCycleColor,
  onRemove,
}: {
  player: Player
  index: number
  onChangeName: (playerId: string, name: string) => void
  onCycleColor: (playerId: string, currentColor: string) => void
  onRemove: (playerId: string) => void
}) {
  const { tokens } = useNeoBrutalTheme()

  return (
    <ShadowFrame>
      <View
        style={{
          borderWidth: 4,
          borderColor: setupColors.border,
          backgroundColor: setupColors.surface,
          minHeight: 88,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 10,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Change ${player.name || "player"} color`}
          onPress={() => onCycleColor(player.id, player.color)}
          style={{
            width: 56,
            height: 56,
            borderWidth: 4,
            borderColor: setupColors.border,
            backgroundColor: player.color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Palette size={26} color="#FFFFFF" strokeWidth={2.25} />
        </Pressable>

        <TextInput
          accessibilityLabel={`Player name ${index + 1}`}
          placeholder="ENTER NAME..."
          placeholderTextColor={setupColors.inputPlaceholder}
          value={player.name}
          onChangeText={(value) => onChangeName(player.id, value)}
          style={{
            flex: 1,
            flexShrink: 1,
            minWidth: 0,
            color: setupColors.border,
            fontFamily: tokens.typography.heading,
            fontSize: 20,
            textTransform: "uppercase",
            minHeight: 52,
            paddingVertical: 0,
          }}
        />

        <View
          style={{
            borderLeftWidth: 4,
            borderLeftColor: setupColors.border,
            marginLeft: 4,
            paddingLeft: 8,
            paddingRight: 4,
            minWidth: 48,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${player.name || "player"}`}
            onPress={() => onRemove(player.id)}
            style={{
              width: 32,
              height: 32,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 size={24} color={setupColors.border} strokeWidth={2.6} />
          </Pressable>
        </View>
      </View>
    </ShadowFrame>
  )
}

function TeamAssignmentBox({
  team,
  playerCount,
  borderColor,
  children,
}: {
  team: Team
  playerCount: number
  borderColor: string
  children: ReactNode
}) {
  const { tokens } = useNeoBrutalTheme()

  return (
    <View
      style={{
        borderWidth: 5,
        borderColor,
        padding: 6,
      }}
    >
      <ShadowFrame>
        <View
          style={{
            borderWidth: 4,
            borderColor: setupColors.border,
            backgroundColor: setupColors.surface,
            paddingHorizontal: 10,
            paddingVertical: 10,
            gap: 10,
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: 24,
                fontStyle: "italic",
                color: setupColors.border,
                textTransform: "uppercase",
              }}
            >
              {team.name}
            </BrutalText>
            <View
              style={{
                borderWidth: 4,
                borderColor: setupColors.border,
                backgroundColor: setupColors.border,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <BrutalText
                style={{
                  fontFamily: tokens.typography.heading,
                  color: "#FFFFFF",
                  fontSize: 18,
                  textTransform: "uppercase",
                }}
              >
                {playerCount} {playerCount === 1 ? "Player" : "Players"}
              </BrutalText>
            </View>
          </View>
          {children}
        </View>
      </ShadowFrame>
    </View>
  )
}

function TeamPlayerRow({
  player,
  onNameChange,
  onLongPress,
}: {
  player: Player
  onNameChange: (playerId: string, name: string) => void
  onLongPress: () => void
}) {
  const { tokens } = useNeoBrutalTheme()

  return (
    <ShadowFrame>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Long press to move this player to the next team"
        onLongPress={onLongPress}
        style={{
          borderWidth: 4,
          borderColor: setupColors.border,
          backgroundColor: player.color,
          minHeight: 78,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 10,
        }}
      >
        <GripVertical size={24} color={setupColors.border} strokeWidth={2.5} />
        <TextInput
          placeholder="ENTER NAME..."
          placeholderTextColor="rgba(0,0,0,0.35)"
          value={player.name}
          onChangeText={(value) => onNameChange(player.id, value)}
          style={{
            flex: 1,
            flexShrink: 1,
            minWidth: 0,
            color: setupColors.border,
            fontFamily: tokens.typography.heading,
            fontSize: 20,
            textTransform: "uppercase",
            minHeight: 46,
            paddingVertical: 0,
          }}
        />
      </Pressable>
    </ShadowFrame>
  )
}

function SetupIconButton({
  icon,
  color,
  onPress,
  onLongPress,
  accessibilityLabel,
}: {
  icon: LucideIcon
  color: string
  onPress: () => void
  onLongPress?: () => void
  accessibilityLabel: string
}) {
  const Icon = icon

  return (
    <ShadowFrame shadowOffset={4}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        style={{
          width: 58,
          height: 58,
          borderWidth: 4,
          borderColor: setupColors.border,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={24} color={setupColors.border} strokeWidth={2.6} />
      </Pressable>
    </ShadowFrame>
  )
}

function ShadowActionButton({
  label,
  icon,
  color,
  textColor,
  onPress,
  disabled,
}: {
  label: string
  icon: LucideIcon
  color: string
  textColor: string
  onPress: () => void
  disabled?: boolean
}) {
  const { tokens } = useNeoBrutalTheme()
  const Icon = icon

  return (
    <ShadowFrame>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        style={{
          borderWidth: 4,
          borderColor: setupColors.border,
          backgroundColor: color,
          minHeight: 74,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <Icon size={22} color={textColor} strokeWidth={2.8} />
        <BrutalText
          style={{
            fontFamily: tokens.typography.heading,
            textTransform: "uppercase",
            fontSize: 20,
            color: textColor,
          }}
        >
          {label}
        </BrutalText>
      </Pressable>
    </ShadowFrame>
  )
}

function ShadowFrame({
  children,
  shadowOffset = 5,
}: {
  children: ReactNode
  shadowOffset?: number
}) {
  return (
    <View style={{ marginRight: shadowOffset, marginBottom: shadowOffset }}>
      <View
        style={{
          position: "absolute",
          top: shadowOffset,
          left: shadowOffset,
          right: -shadowOffset,
          bottom: -shadowOffset,
          backgroundColor: setupColors.border,
        }}
      />
      {children}
    </View>
  )
}

export function createScoreboardStateForTests() {
  return createInitialScoreboardState()
}
