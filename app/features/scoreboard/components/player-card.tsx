import { useState } from "react"
import { Pressable, View, useWindowDimensions } from "react-native"

import { BrutalText } from "@/theme/neo-brutal/primitives"
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme"

import type { Player } from "../types"
import { ScoreEditModal } from "./score-edit-modal"

interface PlayerCardProps {
  player: Player
  displayScore: number
  gameStarted: boolean
  onIncrement: (playerId: string, delta: number) => void
  onSetExactScore: (playerId: string, score: number) => void
  _onRemove: (playerId: string) => void
  _onStartEditing?: (playerId: string) => void
}

export function PlayerCard({
  player,
  displayScore,
  gameStarted,
  onIncrement,
  onSetExactScore,
  _onRemove,
  _onStartEditing,
}: PlayerCardProps) {
  const { tokens } = useNeoBrutalTheme()
  const { width } = useWindowDimensions()
  const isCompact = width < 430

  const [showEditModal, setShowEditModal] = useState(false)

  const handleOpenEdit = () => {
    if (gameStarted) {
      setShowEditModal(true)
      _onStartEditing?.(player.id)
    }
  }

  const handleApplyScore = (newScore: number) => {
    onSetExactScore(player.id, newScore)
    setShowEditModal(false)
  }

  return (
    <>
      <View
        style={{
          marginBottom: 16,
          marginRight: 5,
        }}
      >
        {/* Shadow */}
        <View
          style={{
            position: "absolute",
            top: 5,
            left: 5,
            right: -5,
            bottom: -5,
            backgroundColor: "#000000",
          }}
        />

        <View
          style={{
            borderWidth: 4,
            borderColor: "#000000",
            backgroundColor: player.color,
          }}
        >
          {/* Header Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              gap: 12,
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: 56,
                height: 56,
                borderWidth: 4,
                borderColor: "#000000",
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BrutalText
                style={{
                  fontSize: 28,
                  fontFamily: tokens.typography.heading,
                }}
              >
                {player.name.charAt(0).toUpperCase() || "?"}
              </BrutalText>
            </View>

            {/* Name */}
            <View style={{ flex: 1 }}>
              <BrutalText
                style={{
                  fontFamily: tokens.typography.heading,
                  fontSize: 20,
                  textTransform: "uppercase",
                  color: "#000000",
                }}
              >
                {player.name}
              </BrutalText>
            </View>

            {/* Score */}
            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: isCompact ? 40 : 48,
                color: "#000000",
                fontVariant: ["tabular-nums"],
              }}
            >
              {displayScore}
            </BrutalText>
          </View>

          {/* Score Controls Row */}
          <View
            style={{
              flexDirection: "row",
              borderTopWidth: 4,
              borderTopColor: "#000000",
              backgroundColor: "#FFFFFF",
            }}
          >
            {/* Minus Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Decrease ${player.name} score`}
              onPress={() => onIncrement(player.id, -1)}
              disabled={!gameStarted}
              style={{
                flex: 1,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                borderRightWidth: 2,
                borderRightColor: "#000000",
                opacity: gameStarted ? 1 : 0.3,
              }}
            >
              <BrutalText
                style={{
                  fontFamily: tokens.typography.heading,
                  fontSize: 28,
                  color: "#000000",
                }}
              >
                −
              </BrutalText>
            </Pressable>

            {/* Score Display */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${player.name} score`}
              onPress={handleOpenEdit}
              disabled={!gameStarted}
              style={{
                flex: 2,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                borderRightWidth: 2,
                borderRightColor: "#000000",
                opacity: gameStarted ? 1 : 0.3,
              }}
            >
              <BrutalText
                style={{
                  fontFamily: tokens.typography.heading,
                  fontSize: 28,
                  color: "#000000",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {displayScore}
              </BrutalText>
            </Pressable>

            {/* Plus Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Increase ${player.name} score`}
              onPress={() => onIncrement(player.id, 1)}
              disabled={!gameStarted}
              style={{
                flex: 1,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                opacity: gameStarted ? 1 : 0.3,
              }}
            >
              <BrutalText
                style={{
                  fontFamily: tokens.typography.heading,
                  fontSize: 28,
                  color: "#000000",
                }}
              >
                +
              </BrutalText>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Score Edit Modal */}
      <ScoreEditModal
        visible={showEditModal}
        player={player}
        currentScore={displayScore}
        onClose={() => setShowEditModal(false)}
        onApply={handleApplyScore}
      />
    </>
  )
}
