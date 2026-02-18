import { useState } from "react"
import { Modal, Pressable, ScrollView, View } from "react-native"

import { BrutalButton, BrutalCard, BrutalText } from "@/theme/neo-brutal/primitives"
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme"

import { getSortedPlayersForGame } from "../reducer"
import type { GameSnapshot } from "../types"
import { ScoreTable } from "./score-table"

interface HistoryModalProps {
  visible: boolean
  currentGame: GameSnapshot
  history: GameSnapshot[]
  selectedGameId: string | null
  onClose: () => void
  onSelectGame: (gameId: string | null) => void
  onLoadGame: (gameId: string) => void
  onDeleteGame: (gameId: string) => void
  onClearHistory: () => void
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
  const { tokens } = useNeoBrutalTheme()
  const [activeTab, setActiveTab] = useState<"rounds" | "games">("rounds")

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 12,
        }}
      >
        <BrutalCard style={{ maxHeight: "92%", gap: 10, backgroundColor: tokens.color.background }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
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
            <BrutalButton label="Close" onPress={onClose} color={tokens.color.surfaceAlt} />
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <BrutalButton
              label="Current"
              onPress={() => setActiveTab("rounds")}
              color={activeTab === "rounds" ? tokens.color.yellow : tokens.color.surfaceAlt}
            />
            <BrutalButton
              label="Previous"
              onPress={() => setActiveTab("games")}
              color={activeTab === "games" ? tokens.color.yellow : tokens.color.surfaceAlt}
            />
          </View>

          <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 8 }}>
            {activeTab === "rounds" ? (
              <ScoreTable
                title="Current Game"
                players={getSortedPlayersForGame(currentGame)}
                teams={currentGame.teams}
                currentRound={currentGame.settings.currentRound}
              />
            ) : (
              <View style={{ gap: 10 }}>
                {history.length > 0 ? (
                  <>
                    <BrutalButton
                      label="Clear All"
                      onPress={onClearHistory}
                      color={tokens.color.red}
                    />

                    {history.map((game) => {
                      const expanded = selectedGameId === game.id

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
                                onPress={() => onSelectGame(expanded ? null : game.id)}
                                style={{ flex: 1 }}
                                accessibilityRole="button"
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
                                  {new Date(game.dateIso).toLocaleDateString()} •{" "}
                                  {game.players.length} players
                                </BrutalText>
                              </Pressable>

                              <View style={{ flexDirection: "row", gap: 8 }}>
                                <BrutalButton
                                  label="Load"
                                  onPress={() => onLoadGame(game.id)}
                                  color={tokens.color.blue}
                                />
                                <BrutalButton
                                  label="Del"
                                  onPress={() => onDeleteGame(game.id)}
                                  color={tokens.color.red}
                                />
                              </View>
                            </View>
                          </BrutalCard>

                          {expanded ? (
                            <ScoreTable
                              title={`${game.name} Rounds`}
                              players={getSortedPlayersForGame(game)}
                              teams={game.teams}
                              currentRound={game.settings.currentRound}
                            />
                          ) : null}
                        </View>
                      )
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

        <Pressable onPress={onClose} style={{ flex: 1 }} accessibilityRole="button" />
      </View>
    </Modal>
  )
}
