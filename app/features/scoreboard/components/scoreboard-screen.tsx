import {
  Edit3,
  GripVertical,
  type LucideIcon,
  Palette,
  Pencil,
  Play,
  Settings,
  Shuffle,
  Trash2,
  UserPlus,
} from "lucide-react-native";
import {
  type FC,
  type ReactNode,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  TextInput,
  UIManager,
  useWindowDimensions,
  View,
} from "react-native";

import { Screen } from "@/components/screen";
import { scoreboardActions } from "@/features/scoreboard/actions";
import { BRUTAL_ACCENT_COLORS } from "@/features/scoreboard/constants";
import { generateBrutalColor } from "@/features/scoreboard/name-generator";
import {
  loadScoreboardState,
  saveScoreboardState,
} from "@/features/scoreboard/persistence";
import {
  createInitialScoreboardState,
  scoreboardReducer,
} from "@/features/scoreboard/reducer";
import {
  getPlayerDisplayScore,
  getPlayersByTeam,
  getSortedPlayers,
  getTeamName,
  getTeamScores,
} from "@/features/scoreboard/selectors";
import type { GameSnapshot, Player, Team } from "@/features/scoreboard/types";
import { analyticsEvents } from "@/services/analytics/events";
import { analytics } from "@/services/analytics/posthog-client";
import { BrutalText } from "@/theme/neo-brutal/primitives";
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme";

import { HistoryModal } from "./history-modal";
import { PlayerCard } from "./player-card";
import { RoundHeader, RoundNavigation } from "./round-header";
import { SettingsModal } from "./settings-modal";
import { TeamSection } from "./team-section";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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
};

const DEFAULT_TEAMS: Array<{ name: string; color: string }> = [
  { name: "Team A", color: setupColors.yellow },
  { name: "Team B", color: setupColors.green },
];

function getNextAccentColor(current: string) {
  const currentIndex = BRUTAL_ACCENT_COLORS.findIndex(
    (accent) => accent.toLowerCase() === current.toLowerCase()
  );
  if (currentIndex < 0) {
    return BRUTAL_ACCENT_COLORS[0];
  }
  return BRUTAL_ACCENT_COLORS[(currentIndex + 1) % BRUTAL_ACCENT_COLORS.length];
}

export const ScoreboardScreen: FC = function ScoreboardScreen() {
  const { tokens } = useNeoBrutalTheme();
  const { width, height } = useWindowDimensions();
  const isCompact = width < 430;

  const [state, dispatch] = useReducer(scoreboardReducer, undefined, () =>
    loadScoreboardState()
  );

  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerColor, setNewPlayerColor] = useState(generateBrutalColor());
  const [newPlayerTeamId, setNewPlayerTeamId] = useState<string | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [isEditingGameName, setIsEditingGameName] = useState(false);
  const [draftGameName, setDraftGameName] = useState("");

  const active = state.activeGame;

  useEffect(() => {
    analytics.init();
    analytics.capture(analyticsEvents.appOpened, {
      platform: Platform.OS,
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveScoreboardState(state);
    }, 250);

    return () => clearTimeout(timeout);
  }, [state]);

  useEffect(() => {
    if (!isEditingGameName) {
      setDraftGameName(active.name);
    }
  }, [active.name, isEditingGameName]);

  useEffect(() => {
    if (!active.settings.enableTeams || active.teams.length === 0) {
      return;
    }

    const unassignedPlayers = active.players.filter(
      (player) => player.teamId === null
    );
    if (unassignedPlayers.length === 0) {
      return;
    }

    unassignedPlayers.forEach((player, index) => {
      const team = active.teams[index % active.teams.length];
      if (!team) {
        return;
      }
      dispatch(scoreboardActions.setPlayerTeam(player.id, team.id));
    });
  }, [active.players, active.settings.enableTeams, active.teams]);

  useEffect(() => {
    if (!active.settings.enableTeams) {
      setNewPlayerTeamId(null);
      return;
    }

    if (
      newPlayerTeamId &&
      active.teams.some((team) => team.id === newPlayerTeamId)
    ) {
      return;
    }

    setNewPlayerTeamId(active.teams[0]?.id ?? null);
  }, [active.settings.enableTeams, active.teams, newPlayerTeamId]);

  const sortedPlayers = useMemo(
    () => getSortedPlayers(active.players, active.settings),
    [active.players, active.settings]
  );
  const playersByTeam = useMemo(
    () => getPlayersByTeam(sortedPlayers),
    [sortedPlayers]
  );
  const teamScores = useMemo(
    () => getTeamScores(playersByTeam, active.settings),
    [playersByTeam, active.settings]
  );

  const displayScoresById = useMemo(() => {
    return active.players.reduce<Record<string, number>>((acc, player) => {
      acc[player.id] = getPlayerDisplayScore(player, active.settings);
      return acc;
    }, {});
  }, [active.players, active.settings]);

  const canGoNextRound =
    active.started &&
    (active.settings.numberOfRounds === 0 ||
      active.settings.currentRound < active.settings.numberOfRounds);

  const canStartGame = active.players.some(
    (player) => player.name.trim().length > 0
  );

  const currentGameSnapshot: GameSnapshot = useMemo(
    () => ({
      id: active.id,
      name: active.name,
      dateIso: active.dateIso,
      players: active.players,
      teams: active.teams,
      settings: active.settings,
    }),
    [active]
  );

  const initializeDefaultTeams = () => {
    if (active.teams.length > 0) {
      return;
    }

    for (const team of DEFAULT_TEAMS) {
      dispatch(scoreboardActions.addTeam(team.name, team.color));
    }
  };

  const setTeamsEnabled = (value: boolean) => {
    dispatch(scoreboardActions.setEnableTeams(value));
    analytics.capture(analyticsEvents.settingsChanged, { enableTeams: value });

    if (value) {
      initializeDefaultTeams();
    }
  };

  const addPlayer = () => {
    let teamId = newPlayerTeamId;

    if (active.settings.enableTeams && !teamId && active.teams.length > 0) {
      const teamWithFewestPlayers = [...active.teams]
        .map((team) => ({
          teamId: team.id,
          count: (playersByTeam[team.id] ?? []).length,
        }))
        .sort((a, b) => a.count - b.count)[0];

      teamId = teamWithFewestPlayers?.teamId ?? active.teams[0].id;
    }

    dispatch(
      scoreboardActions.addPlayer(newPlayerName, newPlayerColor, teamId ?? null)
    );
    setNewPlayerName("");
    setNewPlayerColor(generateBrutalColor());
  };

  const updatePlayerName = (playerId: string, name: string) => {
    dispatch(scoreboardActions.setPlayerName(playerId, name));
  };

  const updatePlayerColor = (playerId: string, color: string) => {
    dispatch(scoreboardActions.setPlayerColor(playerId, color));
  };

  const cyclePlayerTeam = (player: Player) => {
    if (active.teams.length === 0) {
      return;
    }

    const currentIndex = active.teams.findIndex(
      (team) => team.id === player.teamId
    );
    const nextIndex =
      currentIndex < 0 ? 0 : (currentIndex + 1) % active.teams.length;
    dispatch(
      scoreboardActions.setPlayerTeam(player.id, active.teams[nextIndex].id)
    );
  };

  const updateScore = (playerId: string, delta: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(scoreboardActions.incrementPlayerScore(playerId, delta));
    analytics.capture(analyticsEvents.scoreChanged, {
      gameId: active.id,
      playerId,
      delta,
      round: active.settings.currentRound,
    });
  };

  const setExactScore = (playerId: string, score: number) => {
    dispatch(scoreboardActions.setPlayerExactScore(playerId, score));
    analytics.capture(analyticsEvents.scoreChanged, {
      gameId: active.id,
      playerId,
      exactScore: score,
      round: active.settings.currentRound,
    });
  };

  const toggleStarted = () => {
    if (!(active.started || canStartGame)) {
      return;
    }

    const nextStarted = !active.started;
    dispatch(scoreboardActions.setGameStarted(nextStarted));
    analytics.capture(analyticsEvents.gameStarted, {
      started: nextStarted,
      players: active.players.length,
    });
  };

  const goPreviousRound = () => {
    dispatch(scoreboardActions.previousRound());
    analytics.capture(analyticsEvents.roundChanged, {
      direction: "prev",
      round: active.settings.currentRound - 1,
    });
  };

  const goNextRound = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(scoreboardActions.nextRound());
    analytics.capture(analyticsEvents.roundChanged, {
      direction: "next",
      round: active.settings.currentRound + 1,
    });
  };

  const saveGameName = () => {
    dispatch(
      scoreboardActions.setGameName(draftGameName.trim() || active.name)
    );
    setIsEditingGameName(false);
  };

  const setupBodyMinHeight = Math.max(height - 250, 560);

  return (
    <Screen
      backgroundColor={setupColors.background}
      contentContainerStyle={{
        paddingHorizontal: 0,
        paddingVertical: 0,
        gap: 0,
        backgroundColor: setupColors.background,
      }}
      preset="scroll"
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
                    onBlur={saveGameName}
                    onChangeText={setDraftGameName}
                    onSubmitEditing={saveGameName}
                    placeholder="Game Name"
                    selectionColor={setupColors.cyan}
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
                    value={draftGameName}
                  />
                </View>
              </ShadowFrame>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => !active.started && setIsEditingGameName(true)}
              >
                <BrutalText
                  ellipsizeMode="tail"
                  numberOfLines={2}
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
                accessibilityLabel="Edit game name"
                color={setupColors.cyan}
                icon={Pencil}
                onLongPress={() => {
                  dispatch(scoreboardActions.regenerateGameName());
                }}
                onPress={() => setIsEditingGameName((prev) => !prev)}
              />
              <SetupIconButton
                accessibilityLabel="Shuffle game name"
                color={setupColors.pink}
                icon={Shuffle}
                onLongPress={() => setHistoryVisible(true)}
                onPress={() => {
                  dispatch(scoreboardActions.regenerateGameName());
                }}
              />
            </View>
          )}
        </View>

        <View style={{ height: 5, backgroundColor: setupColors.border }} />

        {active.started ? (
          <View
            style={{
              minHeight: setupBodyMinHeight,
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                paddingHorizontal: isCompact ? 12 : 16,
                paddingVertical: 8,
                gap: 4,
              }}
            >
              <RoundHeader
                _canGoNext={canGoNextRound}
                _canGoPrevious={active.settings.currentRound > 1}
                _onNextRound={goNextRound}
                _onPreviousRound={goPreviousRound}
                currentRound={active.settings.currentRound}
                isTeamMode={active.settings.enableTeams}
                numberOfRounds={active.settings.numberOfRounds}
                onClose={toggleStarted}
                onShowHistory={() => setHistoryVisible(true)}
              />

              <View
                style={{
                  height: 4,
                  backgroundColor: "#000000",
                  marginVertical: 8,
                }}
              />

              {active.settings.enableTeams ? (
                <View style={{ gap: 0, paddingTop: 8 }}>
                  {Object.entries(playersByTeam).map(([teamKey, players]) => {
                    const teamId = teamKey === "no-team" ? null : teamKey;
                    const team = active.teams.find(
                      (entry) => entry.id === teamId
                    );

                    return (
                      <TeamSection
                        _onRemove={(playerId: string) =>
                          dispatch(scoreboardActions.removePlayer(playerId))
                        }
                        color={team?.color ?? setupColors.muted}
                        displayScoreById={displayScoresById}
                        gameStarted={active.started}
                        key={teamKey}
                        onIncrement={updateScore}
                        onSetExactScore={setExactScore}
                        players={players}
                        title={getTeamName(active.teams, teamId)}
                        totalScore={teamScores[teamKey] ?? 0}
                      />
                    );
                  })}
                </View>
              ) : (
                <View style={{ gap: 0, paddingTop: 8 }}>
                  {sortedPlayers.map((player) => (
                    <PlayerCard
                      _onRemove={(playerId: string) =>
                        dispatch(scoreboardActions.removePlayer(playerId))
                      }
                      displayScore={displayScoresById[player.id] ?? 0}
                      gameStarted={active.started}
                      key={player.id}
                      onIncrement={updateScore}
                      onSetExactScore={setExactScore}
                      player={player}
                    />
                  ))}
                </View>
              )}
            </View>

            <View
              style={{
                borderTopWidth: 4,
                borderTopColor: "#000000",
                marginTop: 16,
              }}
            >
              <RoundNavigation
                canGoNext={canGoNextRound}
                canGoPrevious={active.settings.currentRound > 1}
                onNextRound={goNextRound}
                onPreviousRound={goPreviousRound}
              />
            </View>
          </View>
        ) : (
          <View
            style={{
              minHeight: setupBodyMinHeight,
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                paddingHorizontal: isCompact ? 12 : 16,
                paddingVertical: 12,
                gap: 14,
              }}
            >
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
                      borderColor={
                        index % 2 === 0 ? setupColors.yellow : setupColors.green
                      }
                      key={team.id}
                      playerCount={playersByTeam[team.id]?.length ?? 0}
                      team={team}
                    >
                      {(playersByTeam[team.id] ?? []).map((player) => (
                        <TeamPlayerRow
                          key={player.id}
                          onLongPress={() => cyclePlayerTeam(player)}
                          onNameChange={updatePlayerName}
                          player={player}
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
                      borderColor="#979AA3"
                      playerCount={playersByTeam["no-team"]?.length ?? 0}
                      team={{
                        id: "no-team",
                        name: "No Team",
                        color: "#D4D5D8",
                      }}
                    >
                      {(playersByTeam["no-team"] ?? []).map((player) => (
                        <TeamPlayerRow
                          key={player.id}
                          onLongPress={() => cyclePlayerTeam(player)}
                          onNameChange={updatePlayerName}
                          player={player}
                        />
                      ))}
                    </TeamAssignmentBox>
                  ) : null}

                  <ShadowActionButton
                    color="#FFFFFF"
                    icon={UserPlus}
                    label="Add Player"
                    onPress={addPlayer}
                    textColor={setupColors.border}
                  />
                </>
              ) : (
                <>
                  <SectionHeading label="Current Players" />

                  {active.players.map((player, index) => (
                    <EditablePlayerRow
                      index={index}
                      key={player.id}
                      onChangeName={updatePlayerName}
                      onCycleColor={(playerId, currentColor) =>
                        updatePlayerColor(
                          playerId,
                          getNextAccentColor(currentColor)
                        )
                      }
                      onRemove={(playerId) =>
                        dispatch(scoreboardActions.removePlayer(playerId))
                      }
                      player={player}
                    />
                  ))}

                  <ShadowActionButton
                    color={setupColors.cyan}
                    icon={UserPlus}
                    label="Add Player"
                    onPress={addPlayer}
                    textColor={setupColors.border}
                  />
                </>
              )}
            </View>

            <View
              style={{ borderTopWidth: 5, borderTopColor: setupColors.border }}
            >
              <View
                style={{
                  paddingHorizontal: isCompact ? 12 : 16,
                  paddingVertical: 16,
                  gap: 16,
                }}
              >
                <ShadowActionButton
                  color="#FFFFFF"
                  icon={Settings}
                  label="Advanced Settings"
                  onPress={() => setSettingsVisible(true)}
                  textColor={setupColors.border}
                />

                <ShadowActionButton
                  color={active.started ? "#FFFFFF" : setupColors.yellow}
                  disabled={!(active.started || canStartGame)}
                  icon={active.started ? Edit3 : Play}
                  label={active.started ? "Edit Game" : "Start Game"}
                  onPress={toggleStarted}
                  textColor={setupColors.border}
                />

                {canStartGame ? null : (
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
                )}
              </View>
            </View>
          </View>
        )}
      </View>

      <SettingsModal
        onChangeNumberOfRounds={(value) => {
          dispatch(scoreboardActions.setNumberOfRounds(value));
          analytics.capture(analyticsEvents.settingsChanged, {
            numberOfRounds: value,
          });
        }}
        onChangeSortBy={(sortBy) => {
          dispatch(scoreboardActions.setSortBy(sortBy));
          analytics.capture(analyticsEvents.settingsChanged, { sortBy });
        }}
        onClose={() => setSettingsVisible(false)}
        onToggleAccumulated={(showPerRound) => {
          dispatch(scoreboardActions.setShowPerRoundScores(showPerRound));
          analytics.capture(analyticsEvents.settingsChanged, {
            showPerRoundScores: showPerRound,
          });
        }}
        onToggleTeams={(value) => setTeamsEnabled(value)}
        settings={active.settings}
        visible={settingsVisible}
      />

      <HistoryModal
        currentGame={currentGameSnapshot}
        history={state.history}
        onClearHistory={() => {
          dispatch(scoreboardActions.clearHistory());
          analytics.capture(analyticsEvents.historyCleared);
        }}
        onClose={() => setHistoryVisible(false)}
        onDeleteGame={(gameId) => {
          dispatch(scoreboardActions.deleteHistoryGame(gameId));
          analytics.capture(analyticsEvents.historyDeletedGame, { gameId });
        }}
        onLoadGame={(gameId) => {
          dispatch(scoreboardActions.loadHistoryGame(gameId));
          analytics.capture(analyticsEvents.historyLoadedGame, { gameId });
          setHistoryVisible(false);
        }}
        onSelectGame={(gameId) =>
          dispatch(scoreboardActions.setSelectedHistoryGame(gameId))
        }
        selectedGameId={state.ui.selectedHistoryGameId}
        visible={historyVisible}
      />
    </Screen>
  );
};

function SectionHeading({ label }: { label: string }) {
  const { tokens } = useNeoBrutalTheme();

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
  );
}

function EditablePlayerRow({
  player,
  index,
  onChangeName,
  onCycleColor,
  onRemove,
}: {
  player: Player;
  index: number;
  onChangeName: (playerId: string, name: string) => void;
  onCycleColor: (playerId: string, currentColor: string) => void;
  onRemove: (playerId: string) => void;
}) {
  const { tokens } = useNeoBrutalTheme();

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
          accessibilityLabel={`Change ${player.name || "player"} color`}
          accessibilityRole="button"
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
          <Palette color="#FFFFFF" size={26} strokeWidth={2.25} />
        </Pressable>

        <TextInput
          accessibilityLabel={`Player name ${index + 1}`}
          onChangeText={(value) => onChangeName(player.id, value)}
          placeholder="ENTER NAME..."
          placeholderTextColor={setupColors.inputPlaceholder}
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
          value={player.name}
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
            accessibilityLabel={`Remove ${player.name || "player"}`}
            accessibilityRole="button"
            onPress={() => onRemove(player.id)}
            style={{
              width: 32,
              height: 32,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 color={setupColors.border} size={24} strokeWidth={2.6} />
          </Pressable>
        </View>
      </View>
    </ShadowFrame>
  );
}

function TeamAssignmentBox({
  team,
  playerCount,
  borderColor,
  children,
}: {
  team: Team;
  playerCount: number;
  borderColor: string;
  children: ReactNode;
}) {
  const { tokens } = useNeoBrutalTheme();

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
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
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
  );
}

function TeamPlayerRow({
  player,
  onNameChange,
  onLongPress,
}: {
  player: Player;
  onNameChange: (playerId: string, name: string) => void;
  onLongPress: () => void;
}) {
  const { tokens } = useNeoBrutalTheme();

  return (
    <ShadowFrame>
      <Pressable
        accessibilityHint="Long press to move this player to the next team"
        accessibilityRole="button"
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
        <GripVertical color={setupColors.border} size={24} strokeWidth={2.5} />
        <TextInput
          onChangeText={(value) => onNameChange(player.id, value)}
          placeholder="ENTER NAME..."
          placeholderTextColor="rgba(0,0,0,0.35)"
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
          value={player.name}
        />
      </Pressable>
    </ShadowFrame>
  );
}

function SetupIconButton({
  icon,
  color,
  onPress,
  onLongPress,
  accessibilityLabel,
}: {
  icon: LucideIcon;
  color: string;
  onPress: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
}) {
  const Icon = icon;

  return (
    <ShadowFrame shadowOffset={4}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onLongPress={onLongPress}
        onPress={onPress}
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
        <Icon color={setupColors.border} size={24} strokeWidth={2.6} />
      </Pressable>
    </ShadowFrame>
  );
}

function ShadowActionButton({
  label,
  icon,
  color,
  textColor,
  onPress,
  disabled,
}: {
  label: string;
  icon: LucideIcon;
  color: string;
  textColor: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { tokens } = useNeoBrutalTheme();
  const Icon = icon;

  return (
    <ShadowFrame>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
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
        <Icon color={textColor} size={22} strokeWidth={2.8} />
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
  );
}

function ShadowFrame({
  children,
  shadowOffset = 5,
}: {
  children: ReactNode;
  shadowOffset?: number;
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
  );
}

export function createScoreboardStateForTests() {
  return createInitialScoreboardState();
}
