import { View } from "react-native"

import { BrutalButton, BrutalText } from "@/theme/neo-brutal/primitives"
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme"

interface RoundHeaderProps {
  currentRound: number
  numberOfRounds: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPreviousRound: () => void
  onNextRound: () => void
}

export function RoundHeader({
  currentRound,
  numberOfRounds,
  canGoPrevious,
  canGoNext,
  onPreviousRound,
  onNextRound,
}: RoundHeaderProps) {
  const { tokens } = useNeoBrutalTheme()

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 0,
      }}
    >
      <BrutalButton
        label="Previous"
        onPress={onPreviousRound}
        disabled={!canGoPrevious}
        color={tokens.color.surfaceAlt}
        style={{ flex: 1 }}
      />

      <BrutalText
        selectable
        style={{
          fontFamily: tokens.typography.heading,
          textTransform: "uppercase",
          fontSize: 12,
          minWidth: 96,
          textAlign: "center",
          paddingVertical: 15,
          backgroundColor: tokens.color.surface,
        }}
      >
        {numberOfRounds > 0 ? `R ${currentRound}/${numberOfRounds}` : `Round ${currentRound}`}
      </BrutalText>

      <BrutalButton
        label="Next"
        onPress={onNextRound}
        disabled={!canGoNext}
        color={tokens.color.surfaceAlt}
        style={{ flex: 1 }}
      />
    </View>
  )
}
