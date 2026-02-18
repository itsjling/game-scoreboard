import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import {
  BrutalButton,
  BrutalCard,
  BrutalText,
} from "@/theme/neo-brutal/primitives";
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme";

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
  const { tokens } = useNeoBrutalTheme();
  const [activeTab, setActiveTab] = useState<"rounds" | "games">("rounds");

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 12,
        }}
      >
        <BrutalCard
          style={{
            maxHeight: "92%",
            gap: 10,
            backgroundColor: tokens.color.background,
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
                textTransform: "uppercase",
                fontSize: 18,
              }}
            >
              Score History
            </BrutalText>
            <BrutalButton
              color={tokens.color.surfaceAlt}
              label="Close"
              onPress={onClose}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <BrutalButton
              color={
                activeTab === "rounds"
                  ? tokens.color.yellow
                  : tokens.color.surfaceAlt
              }
              label="Current"
              onPress={() => setActiveTab("rounds")}
            />
            <BrutalButton
              color={
                activeTab === "games"
                  ? tokens.color.yellow
                  : tokens.color.surfaceAlt
              }
              label="Previous"
              onPress={() => setActiveTab("games")}
            />
          </View>

          <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 8 }}>
            {activeTab === "rounds" ? (
              <ScoreTable
                currentRound={currentGame.settings.currentRound}
                players={getSortedPlayersForGame(currentGame)}
                teams={currentGame.teams}
                title="Current Game"
              />
            ) : (
              <View style={{ gap: 10 }}>
                {history.length > 0 ? (
                  <>
                    <BrutalButton
                      color={tokens.color.red}
                      label="Clear All"
                      onPress={onClearHistory}
                    />

                    {history.map((game) => {
                      const expanded = selectedGameId === game.id;

                      return (
                        <View key={game.id} style={{ gap: 8 }}>
                          <BrutalCard>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Pressable
                                accessibilityRole="button"
                                onPress={() =>
                                  onSelectGame(expanded ? null : game.id)
                                }
                                style={{ flex: 1 }}
                              >
                                <BrutalText
                                  selectable
                                  style={{
                                    fontFamily: tokens.typography.heading,
                                    fontSize: 16,
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {game.name}
                                </BrutalText>
                                <BrutalText selectable style={{ fontSize: 12 }}>
                                  {new Date(game.dateIso).toLocaleDateString()}{" "}
                                  • {game.players.length} players
                                </BrutalText>
                              </Pressable>

                              <View style={{ flexDirection: "row", gap: 8 }}>
                                <BrutalButton
                                  color={tokens.color.blue}
                                  label="Load"
                                  onPress={() => onLoadGame(game.id)}
                                />
                                <BrutalButton
                                  color={tokens.color.red}
                                  label="Del"
                                  onPress={() => onDeleteGame(game.id)}
                                />
                              </View>
                            </View>
                          </BrutalCard>

                          {expanded ? (
                            <ScoreTable
                              currentRound={game.settings.currentRound}
                              players={getSortedPlayersForGame(game)}
                              teams={game.teams}
                              title={`${game.name} Rounds`}
                            />
                          ) : null}
                        </View>
                      );
                    })}
                  </>
                ) : (
                  <BrutalCard>
                    <BrutalText selectable>No previous games</BrutalText>
                  </BrutalCard>
                )}
              </View>
            )}
          </ScrollView>
        </BrutalCard>

        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={{ flex: 1 }}
        />
      </View>
    </Modal>
  );
}
