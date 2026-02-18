import { Pressable, View } from "react-native";

import { BrutalText } from "@/theme/neo-brutal/primitives";
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme";

interface RoundHeaderProps {
  _canGoNext: boolean;
  _canGoPrevious: boolean;
  _onNextRound: () => void;
  _onPreviousRound: () => void;
  currentRound: number;
  isTeamMode?: boolean;
  numberOfRounds: number;
  onClose?: () => void;
  onShowHistory?: () => void;
}

export function RoundHeader({
  currentRound,
  numberOfRounds,
  _canGoPrevious,
  _canGoNext,
  isTeamMode = false,
  _onPreviousRound,
  _onNextRound,
  onShowHistory,
  onClose,
}: RoundHeaderProps) {
  const { tokens } = useNeoBrutalTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        gap: 12,
      }}
    >
      {/* Close/Back Button */}
      <Pressable
        accessibilityLabel="Close game"
        accessibilityRole="button"
        onPress={onClose}
        style={{
          width: 50,
          height: 50,
          borderWidth: 4,
          borderColor: "#000000",
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BrutalText
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 28,
            color: "#000000",
          }}
        >
          ×
        </BrutalText>
      </Pressable>

      {/* Center Content */}
      <View style={{ alignItems: "center", flex: 1 }}>
        <BrutalText
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 28,
            textTransform: "uppercase",
            color: "#000000",
          }}
        >
          Round {currentRound}
          {numberOfRounds > 0 ? `/${numberOfRounds}` : ""}
        </BrutalText>

        {/* Phase Badge */}
        <View
          style={{
            backgroundColor: "#FFD700",
            paddingHorizontal: 12,
            paddingVertical: 4,
            marginTop: 4,
            borderWidth: 3,
            borderColor: "#000000",
          }}
        >
          <BrutalText
            style={{
              fontFamily: tokens.typography.heading,
              fontSize: 12,
              textTransform: "uppercase",
              color: "#000000",
              letterSpacing: 1,
            }}
          >
            {isTeamMode ? "Team Scoring" : "Scoring Phase"}
          </BrutalText>
        </View>
      </View>

      {/* History Button */}
      <Pressable
        accessibilityLabel="Show history"
        accessibilityRole="button"
        onPress={onShowHistory}
        style={{
          width: 50,
          height: 50,
          borderWidth: 4,
          borderColor: "#000000",
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BrutalText
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 20,
            color: "#000000",
          }}
        >
          ↺
        </BrutalText>
      </Pressable>
    </View>
  );
}

export function RoundNavigation({
  canGoPrevious,
  canGoNext,
  onPreviousRound,
  onNextRound,
}: {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPreviousRound: () => void;
  onNextRound: () => void;
}) {
  const { tokens } = useNeoBrutalTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    >
      {/* Previous Button */}
      <Pressable
        accessibilityLabel="Previous round"
        accessibilityRole="button"
        disabled={!canGoPrevious}
        onPress={onPreviousRound}
        style={{
          flex: 1,
          borderWidth: 4,
          borderColor: "#000000",
          backgroundColor: "#FFFFFF",
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: canGoPrevious ? 1 : 0.5,
        }}
      >
        <BrutalText
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 20,
            color: "#000000",
          }}
        >
          ←
        </BrutalText>
        <BrutalText
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 18,
            textTransform: "uppercase",
            color: "#000000",
          }}
        >
          Prev
        </BrutalText>
      </Pressable>

      {/* Next Button */}
      <Pressable
        accessibilityLabel="Next round"
        accessibilityRole="button"
        disabled={!canGoNext}
        onPress={onNextRound}
        style={{
          flex: 1,
          borderWidth: 4,
          borderColor: "#000000",
          backgroundColor: "#FFD700",
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: canGoNext ? 1 : 0.5,
        }}
      >
        <BrutalText
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 18,
            textTransform: "uppercase",
            color: "#000000",
          }}
        >
          Next
        </BrutalText>
        <BrutalText
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 20,
            color: "#000000",
          }}
        >
          →
        </BrutalText>
      </Pressable>
    </View>
  );
}
