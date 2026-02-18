import { ScrollView, View } from "react-native";

import {
  BrutalCard,
  BrutalHeading,
  BrutalText,
  ColorDot,
} from "@/theme/neo-brutal/primitives";
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme";

import { getPlayerTotalScore } from "../selectors";
import type { Player, Team } from "../types";

interface ScoreTableProps {
  currentRound: number;
  players: Player[];
  teams: Team[];
  title: string;
}

export function ScoreTable({
  title,
  players,
  teams,
  currentRound,
}: ScoreTableProps) {
  const { tokens } = useNeoBrutalTheme();

  return (
    <BrutalCard>
      <BrutalHeading style={{ fontSize: 16, marginBottom: tokens.spacing.sm }}>
        {title}
      </BrutalHeading>
      <ScrollView contentContainerStyle={{ minWidth: "100%" }} horizontal>
        <View style={{ minWidth: 640 }}>
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: tokens.color.border,
            }}
          >
            <Cell isHeader label="PLAYER" width={180} />
            {Array.from({ length: Math.max(currentRound, 1) }, (_, r) => (
              <Cell
                centered
                isHeader
                key={`round-${r + 1}`}
                label={`R${r + 1}`}
                width={56}
              />
            ))}
            <Cell centered isHeader label="TOTAL" width={72} />
          </View>

          {players.map((player) => {
            const team = teams.find((entry) => entry.id === player.teamId);
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
                {Array.from(
                  { length: Math.max(currentRound, 1) },
                  (_, roundIndex) => (
                    <Cell
                      centered
                      key={`${player.id}-round-${roundIndex}`}
                      label={String(player.scores[roundIndex] ?? 0)}
                      width={56}
                    />
                  )
                )}
                <Cell
                  bold
                  centered
                  label={String(getPlayerTotalScore(player))}
                  width={72}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </BrutalCard>
  );
}

function Cell({
  label,
  width,
  centered = false,
  isHeader = false,
  bold = false,
}: {
  label: string;
  width: number;
  centered?: boolean;
  isHeader?: boolean;
  bold?: boolean;
}) {
  const { tokens } = useNeoBrutalTheme();

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
          fontFamily:
            isHeader || bold
              ? tokens.typography.heading
              : tokens.typography.mono,
          fontSize: isHeader ? 12 : 13,
          textTransform: isHeader ? "uppercase" : "none",
          fontVariant: ["tabular-nums"],
        }}
      >
        {label}
      </BrutalText>
    </View>
  );
}
