import { ScrollView, View } from "react-native"

import { BrutalCard, BrutalHeading, BrutalText, ColorDot } from "@/theme/neo-brutal/primitives"
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme"

import { getPlayerTotalScore } from "../selectors"
import type { Player, Team } from "../types"

interface ScoreTableProps {
  title: string
  players: Player[]
  teams: Team[]
  currentRound: number
}

export function ScoreTable({ title, players, teams, currentRound }: ScoreTableProps) {
  const { tokens } = useNeoBrutalTheme()

  return (
    <BrutalCard>
      <BrutalHeading style={{ fontSize: 16, marginBottom: tokens.spacing.sm }}>
        {title}
      </BrutalHeading>
      <ScrollView horizontal contentContainerStyle={{ minWidth: "100%" }}>
        <View style={{ minWidth: 640 }}>
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: tokens.color.border,
            }}
          >
            <Cell label="PLAYER" width={180} isHeader />
            {Array.from({ length: Math.max(currentRound, 1) }, (_, index) => (
              <Cell
                key={`round-header-${index}`}
                label={`R${index + 1}`}
                width={56}
                isHeader
                centered
              />
            ))}
            <Cell label="TOTAL" width={72} isHeader centered />
          </View>

          {players.map((player) => {
            const team = teams.find((entry) => entry.id === player.teamId)
            return (
              <View
                key={player.id}
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: tokens.color.border,
                }}
              >
                <View
                  style={{
                    width: 180,
                    paddingHorizontal: 8,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <ColorDot color={team?.color ?? player.color} />
                  <BrutalText numberOfLines={1} selectable>
                    {player.name}
                  </BrutalText>
                </View>
                {Array.from({ length: Math.max(currentRound, 1) }, (_, roundIndex) => (
                  <Cell
                    key={`${player.id}-round-${roundIndex}`}
                    label={String(player.scores[roundIndex] ?? 0)}
                    width={56}
                    centered
                  />
                ))}
                <Cell label={String(getPlayerTotalScore(player))} width={72} centered bold />
              </View>
            )
          })}
        </View>
      </ScrollView>
    </BrutalCard>
  )
}

function Cell({
  label,
  width,
  centered = false,
  isHeader = false,
  bold = false,
}: {
  label: string
  width: number
  centered?: boolean
  isHeader?: boolean
  bold?: boolean
}) {
  const { tokens } = useNeoBrutalTheme()

  return (
    <View
      style={{
        width,
        paddingHorizontal: 8,
        paddingVertical: 8,
        justifyContent: "center",
        alignItems: centered ? "center" : "flex-start",
      }}
    >
      <BrutalText
        selectable
        style={{
          fontFamily: isHeader || bold ? tokens.typography.heading : tokens.typography.mono,
          fontSize: isHeader ? 12 : 13,
          textTransform: isHeader ? "uppercase" : "none",
          fontVariant: ["tabular-nums"],
        }}
      >
        {label}
      </BrutalText>
    </View>
  )
}
