import { ArrowLeft, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { getSortedPlayersForGame } from "../reducer";
import type { GameSnapshot } from "../types";
import { ScoreTable } from "./score-table";

interface HistoryModalProps {
  currentGame: GameSnapshot;
  history: GameSnapshot[];
  onClearHistory: () => void;
  onClose: () => void;
  onDeleteGame: (gameId: string) => void;
  onLoadGame: (gameId: string) => void;
  onSelectGame: (gameId: string | null) => void;
  selectedGameId: string | null;
  visible: boolean;
}

const setupColors = {
  background: "#E7E7E8",
  surface: "#F4F4F5",
  border: "#000000",
  sectionText: "#61646C",
  yellow: "#FDE100",
  green: "#8EEB2E",
  red: "#FF4444",
  blue: "#59C7E8",
};

export function HistoryModal({
  visible,
  currentGame,
  history,
  selectedGameId,
  onClose,
  onSelectGame,
  onLoadGame,
  onDeleteGame,
  onClearHistory,
}: HistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"rounds" | "games">("rounds");

  if (!visible) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: setupColors.background,
        zIndex: 100,
      }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 5,
          borderBottomColor: setupColors.border,
          backgroundColor: setupColors.surface,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ShadowFrame>
            <Pressable
              accessibilityLabel="Close history"
              accessibilityRole="button"
              onPress={onClose}
              style={{
                borderWidth: 4,
                borderColor: setupColors.border,
                backgroundColor: setupColors.yellow,
                paddingHorizontal: 14,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowLeft
                color={setupColors.border}
                size={20}
                strokeWidth={2.5}
              />
              <Text
                style={{
                  fontFamily: "geistBold",
                  fontSize: 16,
                  textTransform: "uppercase",
                  color: setupColors.border,
                }}
              >
                Back
              </Text>
            </Pressable>
          </ShadowFrame>

          <Text
            style={{
              fontFamily: "geistBold",
              fontSize: 24,
              textTransform: "uppercase",
              color: setupColors.border,
              fontStyle: "italic",
            }}
          >
            History
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 10,
        }}
      >
        <ShadowFrame>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveTab("rounds")}
            style={{
              borderWidth: 4,
              borderColor: setupColors.border,
              backgroundColor:
                activeTab === "rounds"
                  ? setupColors.yellow
                  : setupColors.surface,
              paddingHorizontal: 16,
              paddingVertical: 10,
              minWidth: 120,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "geistBold",
                fontSize: 14,
                textTransform: "uppercase",
                color: setupColors.border,
              }}
            >
              Current
            </Text>
          </Pressable>
        </ShadowFrame>

        <ShadowFrame>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveTab("games")}
            style={{
              borderWidth: 4,
              borderColor: setupColors.border,
              backgroundColor:
                activeTab === "games" ? setupColors.green : setupColors.surface,
              paddingHorizontal: 16,
              paddingVertical: 10,
              minWidth: 120,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "geistBold",
                fontSize: 14,
                textTransform: "uppercase",
                color: setupColors.border,
              }}
            >
              Previous
            </Text>
          </Pressable>
        </ShadowFrame>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          paddingBottom: 40,
        }}
      >
        {activeTab === "rounds" ? (
          <ScoreTable
            currentRound={currentGame.settings.currentRound}
            players={getSortedPlayersForGame(currentGame)}
            teams={currentGame.teams}
            title="Current Game"
          />
        ) : (
          <View style={{ gap: 12 }}>
            {history.length > 0 ? (
              <>
                <ShadowFrame>
                  <Pressable
                    accessibilityRole="button"
                    onPress={onClearHistory}
                    style={{
                      borderWidth: 4,
                      borderColor: setupColors.border,
                      backgroundColor: setupColors.red,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Trash2 color="#FFFFFF" size={18} strokeWidth={2.5} />
                    <Text
                      style={{
                        fontFamily: "geistBold",
                        fontSize: 16,
                        textTransform: "uppercase",
                        color: "#FFFFFF",
                      }}
                    >
                      Clear All History
                    </Text>
                  </Pressable>
                </ShadowFrame>

                {history.map((game) => {
                  const expanded = selectedGameId === game.id;

                  return (
                    <View key={game.id} style={{ gap: 10 }}>
                      <ShadowFrame>
                        <View
                          style={{
                            borderWidth: 4,
                            borderColor: setupColors.border,
                            backgroundColor: setupColors.surface,
                            padding: 12,
                          }}
                        >
                          <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                              onSelectGame(expanded ? null : game.id)
                            }
                            style={{ marginBottom: 10 }}
                          >
                            <Text
                              selectable
                              style={{
                                fontFamily: "geistBold",
                                fontSize: 18,
                                textTransform: "uppercase",
                                color: setupColors.border,
                              }}
                            >
                              {game.name}
                            </Text>
                            <Text
                              selectable
                              style={{
                                fontFamily: "geistRegular",
                                fontSize: 13,
                                color: setupColors.sectionText,
                                marginTop: 2,
                              }}
                            >
                              {new Date(game.dateIso).toLocaleDateString()} •{" "}
                              {game.players.length} players
                            </Text>
                          </Pressable>

                          <View
                            style={{
                              flexDirection: "row",
                              gap: 10,
                              borderTopWidth: 4,
                              borderTopColor: setupColors.border,
                              paddingTop: 10,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <ShadowFrame shadowOffset={3}>
                                <Pressable
                                  accessibilityRole="button"
                                  onPress={() => onLoadGame(game.id)}
                                  style={{
                                    borderWidth: 3,
                                    borderColor: setupColors.border,
                                    backgroundColor: setupColors.blue,
                                    paddingVertical: 10,
                                    alignItems: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontFamily: "geistBold",
                                      fontSize: 14,
                                      textTransform: "uppercase",
                                      color: setupColors.border,
                                    }}
                                  >
                                    Load
                                  </Text>
                                </Pressable>
                              </ShadowFrame>
                            </View>

                            <View style={{ flex: 1 }}>
                              <ShadowFrame shadowOffset={3}>
                                <Pressable
                                  accessibilityRole="button"
                                  onPress={() => onDeleteGame(game.id)}
                                  style={{
                                    borderWidth: 3,
                                    borderColor: setupColors.border,
                                    backgroundColor: setupColors.red,
                                    paddingVertical: 10,
                                    alignItems: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontFamily: "geistBold",
                                      fontSize: 14,
                                      textTransform: "uppercase",
                                      color: "#FFFFFF",
                                    }}
                                  >
                                    Delete
                                  </Text>
                                </Pressable>
                              </ShadowFrame>
                            </View>
                          </View>
                        </View>
                      </ShadowFrame>

                      {expanded ? (
                        <View style={{ marginLeft: 12 }}>
                          <ScoreTable
                            currentRound={game.settings.currentRound}
                            players={getSortedPlayersForGame(game)}
                            teams={game.teams}
                            title={`${game.name} Rounds`}
                          />
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </>
            ) : (
              <ShadowFrame>
                <View
                  style={{
                    borderWidth: 4,
                    borderColor: setupColors.border,
                    backgroundColor: setupColors.surface,
                    padding: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "geistBold",
                      fontSize: 18,
                      textTransform: "uppercase",
                      color: setupColors.sectionText,
                    }}
                  >
                    No previous games
                  </Text>
                </View>
              </ShadowFrame>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ShadowFrame({
  children,
  shadowOffset = 5,
}: {
  children: React.ReactNode;
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
