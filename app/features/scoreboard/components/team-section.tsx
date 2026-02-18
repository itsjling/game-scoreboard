import { useState } from "react";
import { Pressable, View } from "react-native";

import { BrutalText } from "@/theme/neo-brutal/primitives";
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme";

import type { Player } from "../types";
import { ScoreEditModal } from "./score-edit-modal";

interface TeamSectionProps {
  _onRemove: (playerId: string) => void;
  color: string;
  displayScoreById: Record<string, number>;
  gameStarted: boolean;
  onIncrement: (playerId: string, delta: number) => void;
  onSetExactScore: (playerId: string, score: number) => void;
  players: Player[];
  title: string;
  totalScore: number;
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
  _onRemove,
}: TeamSectionProps) {
  const { tokens } = useNeoBrutalTheme();

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Team Header */}
      <View
        style={{
          marginRight: 5,
          marginBottom: 5,
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
            backgroundColor: color,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          {/* Team Name with Icon */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* Team Icon */}
            <View
              style={{
                width: 32,
                height: 32,
                borderWidth: 3,
                borderColor: "#000000",
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BrutalText
                style={{
                  fontSize: 16,
                  fontFamily: tokens.typography.heading,
                }}
              >
                👥
              </BrutalText>
            </View>

            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: 24,
                fontStyle: "italic",
                textTransform: "uppercase",
                color: "#000000",
              }}
            >
              {title}
            </BrutalText>
          </View>

          {/* Total Score */}
          <View
            style={{
              backgroundColor: "#000000",
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: 32,
                color: "#FFFFFF",
                fontVariant: ["tabular-nums"],
              }}
            >
              {totalScore}
            </BrutalText>
          </View>
        </View>
      </View>

      {/* Player Rows */}
      <View style={{ paddingHorizontal: 12, gap: 8 }}>
        {players.map((player) => (
          <TeamPlayerRow
            displayScore={displayScoreById[player.id] ?? 0}
            gameStarted={gameStarted}
            key={player.id}
            onIncrement={onIncrement}
            onSetExactScore={onSetExactScore}
            player={player}
          />
        ))}
      </View>
    </View>
  );
}

interface TeamPlayerRowProps {
  displayScore: number;
  gameStarted: boolean;
  onIncrement: (playerId: string, delta: number) => void;
  onSetExactScore: (playerId: string, score: number) => void;
  player: Player;
}

function TeamPlayerRow({
  player,
  displayScore,
  gameStarted,
  onIncrement,
  onSetExactScore,
}: TeamPlayerRowProps) {
  const { tokens } = useNeoBrutalTheme();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleOpenEdit = () => {
    if (gameStarted) {
      setShowEditModal(true);
    }
  };

  const handleApplyScore = (newScore: number) => {
    onSetExactScore(player.id, newScore);
    setShowEditModal(false);
  };

  return (
    <>
      <View
        style={{
          marginRight: 5,
          marginBottom: 5,
        }}
      >
        {/* Shadow */}
        <View
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            right: -4,
            bottom: -4,
            backgroundColor: "#000000",
          }}
        />

        <View
          style={{
            borderWidth: 4,
            borderColor: "#000000",
            backgroundColor: "#FFFFFF",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 48,
              height: 48,
              borderWidth: 3,
              borderColor: "#000000",
              backgroundColor: player.color,
              alignItems: "center",
              justifyContent: "center",
              margin: 8,
            }}
          >
            <BrutalText
              style={{
                fontSize: 20,
                fontFamily: tokens.typography.heading,
                color: "#000000",
              }}
            >
              {player.name.charAt(0).toUpperCase() || "?"}
            </BrutalText>
          </View>

          {/* Name */}
          <View style={{ flex: 1, paddingVertical: 12 }}>
            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: 18,
                textTransform: "uppercase",
                color: "#000000",
              }}
            >
              {player.name}
            </BrutalText>
          </View>

          {/* Minus Button */}
          <Pressable
            accessibilityLabel={`Decrease ${player.name} score`}
            accessibilityRole="button"
            disabled={!gameStarted}
            onPress={() => onIncrement(player.id, -1)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 20,
              borderLeftWidth: 3,
              borderLeftColor: "#000000",
              opacity: gameStarted ? 1 : 0.3,
            }}
          >
            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: 24,
                color: "#000000",
              }}
            >
              −
            </BrutalText>
          </Pressable>

          {/* Score Display */}
          <Pressable
            accessibilityLabel={`Edit ${player.name} score`}
            accessibilityRole="button"
            disabled={!gameStarted}
            onPress={handleOpenEdit}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 20,
              borderLeftWidth: 3,
              borderLeftColor: "#000000",
              opacity: gameStarted ? 1 : 0.3,
            }}
          >
            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: 24,
                color: "#000000",
                fontVariant: ["tabular-nums"],
              }}
            >
              {displayScore}
            </BrutalText>
          </Pressable>

          {/* Plus Button */}
          <Pressable
            accessibilityLabel={`Increase ${player.name} score`}
            accessibilityRole="button"
            disabled={!gameStarted}
            onPress={() => onIncrement(player.id, 1)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 20,
              borderLeftWidth: 3,
              borderLeftColor: "#000000",
              backgroundColor: "#000000",
              opacity: gameStarted ? 1 : 0.3,
            }}
          >
            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: 24,
                color: "#FFFFFF",
              }}
            >
              +
            </BrutalText>
          </Pressable>
        </View>
      </View>

      {/* Score Edit Modal */}
      <ScoreEditModal
        currentScore={displayScore}
        onApply={handleApplyScore}
        onClose={() => setShowEditModal(false)}
        player={player}
        visible={showEditModal}
      />
    </>
  );
}
