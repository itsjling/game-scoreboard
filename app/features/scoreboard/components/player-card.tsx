import { useEffect, useState } from "react"
import { Pressable, View, useWindowDimensions } from "react-native"

import {
  BrutalButton,
  BrutalInput,
  BrutalText,
  ColorDot,
  ScorePill,
} from "@/theme/neo-brutal/primitives"
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme"

import type { Player } from "../types"

interface PlayerCardProps {
  player: Player
  displayScore: number
  gameStarted: boolean
  onIncrement: (playerId: string, delta: number) => void
  onSetExactScore: (playerId: string, score: number) => void
  onRemove: (playerId: string) => void
}

export function PlayerCard({
  player,
  displayScore,
  gameStarted,
  onIncrement,
  onSetExactScore,
  onRemove,
}: PlayerCardProps) {
  const { tokens } = useNeoBrutalTheme()
  const { width } = useWindowDimensions()
  const isCompact = width < 430

  const [editingScore, setEditingScore] = useState(String(displayScore))
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setEditingScore(String(displayScore))
  }, [displayScore])

  const submitScore = () => {
    const parsed = Number.parseInt(editingScore, 10)
    onSetExactScore(player.id, Number.isFinite(parsed) ? parsed : 0)
    setIsEditing(false)
  }

  return (
    <View
      style={{
        borderLeftWidth: 8,
        borderLeftColor: player.color,
        paddingLeft: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: tokens.color.border,
        gap: 0,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 10 }}>
        <ColorDot color={player.color} />
        <BrutalText
          selectable
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 16,
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          {player.name}
        </BrutalText>
      </View>

      <View
        style={{
          flexDirection: isCompact ? "column" : "row",
          alignItems: isCompact ? "stretch" : "center",
          gap: 0,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
          <BrutalButton
            label="-1"
            accessibilityLabel={`Decrease ${player.name} score`}
            onPress={() => onIncrement(player.id, -1)}
            disabled={!gameStarted}
            color={tokens.color.surfaceAlt}
            style={{ minWidth: 50, marginRight: 0 }}
          />

          {isEditing ? (
            <BrutalInput
              value={editingScore}
              autoFocus
              keyboardType="number-pad"
              returnKeyType="done"
              onChangeText={setEditingScore}
              onSubmitEditing={submitScore}
              onBlur={submitScore}
              style={{ width: 76, textAlign: "center", fontFamily: tokens.typography.mono }}
            />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${player.name} score`}
              onPress={() => gameStarted && setIsEditing(true)}
              style={{ opacity: gameStarted ? 1 : 0.45 }}
            >
              <ScorePill value={displayScore} />
            </Pressable>
          )}

          <BrutalButton
            label="+1"
            accessibilityLabel={`Increase ${player.name} score`}
            onPress={() => onIncrement(player.id, 1)}
            disabled={!gameStarted}
            color={tokens.color.surfaceAlt}
            style={{ minWidth: 50, marginLeft: 0 }}
          />
        </View>

        <BrutalButton
          label="Del"
          accessibilityLabel={`Remove ${player.name}`}
          onPress={() => onRemove(player.id)}
          disabled={gameStarted}
          color={tokens.color.red}
          style={{ minWidth: 56, alignSelf: isCompact ? "flex-end" : "auto" }}
          textStyle={{ color: tokens.mode === "dark" ? tokens.color.ink : "#121212" }}
        />
      </View>
    </View>
  )
}
