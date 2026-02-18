import { View } from "react-native"

import { BrutalText, ColorDot } from "@/theme/neo-brutal/primitives"
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme"

import { PlayerCard } from "./player-card"
import type { Player } from "../types"

interface TeamSectionProps {
  title: string
  color: string
  totalScore: number
  players: Player[]
  displayScoreById: Record<string, number>
  gameStarted: boolean
  onIncrement: (playerId: string, delta: number) => void
  onSetExactScore: (playerId: string, score: number) => void
  onRemove: (playerId: string) => void
}

export function TeamSection({
  title,
  color,
  totalScore,
  players,
  displayScoreById,
  gameStarted,
  onIncrement,
  onSetExactScore,
  onRemove,
}: TeamSectionProps) {
  const { tokens } = useNeoBrutalTheme()

  return (
    <View style={{ gap: 0 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ColorDot color={color} />
          <BrutalText
            selectable
            style={{
              fontFamily: tokens.typography.heading,
              textTransform: "uppercase",
              fontSize: 15,
            }}
          >
            {title}
          </BrutalText>
        </View>
        <BrutalText
          selectable
          style={{
            fontFamily: tokens.typography.mono,
            fontVariant: ["tabular-nums"],
            fontSize: 16,
          }}
        >
          {totalScore}
        </BrutalText>
      </View>

      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          displayScore={displayScoreById[player.id] ?? 0}
          gameStarted={gameStarted}
          onIncrement={onIncrement}
          onSetExactScore={onSetExactScore}
          onRemove={onRemove}
        />
      ))}
    </View>
  )
}
