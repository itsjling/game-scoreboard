import { ReactNode } from "react"
import { Modal, Pressable, ScrollView, Switch, TextInput, View } from "react-native"

import { BrutalButton, BrutalCard, BrutalSection, BrutalText } from "@/theme/neo-brutal/primitives"
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme"

import type { AppSettings } from "../types"

interface SettingsModalProps {
  visible: boolean
  settings: AppSettings
  onClose: () => void
  onToggleAccumulated: (showPerRound: boolean) => void
  onChangeSortBy: (value: AppSettings["sortBy"]) => void
  onChangeNumberOfRounds: (value: number) => void
  onResetRound: () => void
  onNewGame: () => void
  onResetGame: () => void
  themeMode: "light" | "dark"
  onChangeThemeMode: (value: "light" | "dark") => void
}

export function SettingsModal({
  visible,
  settings,
  onClose,
  onToggleAccumulated,
  onChangeSortBy,
  onChangeNumberOfRounds,
  onResetRound,
  onNewGame,
  onResetGame,
  themeMode,
  onChangeThemeMode,
}: SettingsModalProps) {
  const { tokens } = useNeoBrutalTheme()

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        }}
      >
        <BrutalCard
          style={{
            borderRadius: 0,
            borderTopLeftRadius: tokens.border.radius,
            borderTopRightRadius: tokens.border.radius,
            maxHeight: "85%",
            backgroundColor: tokens.color.background,
            gap: tokens.spacing.md,
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: 22,
                textTransform: "uppercase",
              }}
            >
              Settings
            </BrutalText>
            <BrutalButton label="Close" onPress={onClose} color={tokens.color.surfaceAlt} />
          </View>

          <ScrollView contentContainerStyle={{ gap: tokens.spacing.md, paddingBottom: 8 }}>
            <BrutalSection title="Score Display">
              <Row
                label="Show accumulated scores"
                control={
                  <Switch
                    value={!settings.showPerRoundScores}
                    onValueChange={(value) => onToggleAccumulated(!value)}
                  />
                }
              />
            </BrutalSection>

            <BrutalSection title="Sort Players">
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <BrutalButton
                  label="Name"
                  onPress={() => onChangeSortBy("name")}
                  color={settings.sortBy === "name" ? tokens.color.yellow : tokens.color.surfaceAlt}
                />
                <BrutalButton
                  label="High"
                  onPress={() => onChangeSortBy("score-desc")}
                  color={
                    settings.sortBy === "score-desc" ? tokens.color.yellow : tokens.color.surfaceAlt
                  }
                />
                <BrutalButton
                  label="Low"
                  onPress={() => onChangeSortBy("score-asc")}
                  color={
                    settings.sortBy === "score-asc" ? tokens.color.yellow : tokens.color.surfaceAlt
                  }
                />
              </View>
            </BrutalSection>

            <BrutalSection title="Rounds">
              <BrutalText selectable style={{ fontSize: 13 }}>
                Number of rounds (0 = unlimited)
              </BrutalText>
              <TextInput
                keyboardType="number-pad"
                value={String(settings.numberOfRounds)}
                onChangeText={(value) =>
                  onChangeNumberOfRounds(Number.parseInt(value || "0", 10) || 0)
                }
                style={{
                  borderColor: tokens.color.border,
                  borderWidth: tokens.border.width,
                  borderRadius: tokens.border.radius,
                  backgroundColor: tokens.color.surface,
                  color: tokens.color.ink,
                  minHeight: 44,
                  paddingHorizontal: 12,
                  fontFamily: tokens.typography.mono,
                }}
              />
            </BrutalSection>

            <BrutalSection title="Theme">
              <View style={{ flexDirection: "row", gap: 8 }}>
                <BrutalButton
                  label="Light"
                  onPress={() => onChangeThemeMode("light")}
                  color={themeMode === "light" ? tokens.color.yellow : tokens.color.surfaceAlt}
                />
                <BrutalButton
                  label="Dark"
                  onPress={() => onChangeThemeMode("dark")}
                  color={themeMode === "dark" ? tokens.color.yellow : tokens.color.surfaceAlt}
                />
              </View>
            </BrutalSection>

            <BrutalSection title="Danger Zone">
              <View style={{ gap: 8 }}>
                <BrutalButton
                  label="Reset Round"
                  onPress={onResetRound}
                  color={tokens.color.surfaceAlt}
                />
                <BrutalButton label="New Game" onPress={onNewGame} color={tokens.color.blue} />
                <BrutalButton
                  label="Reset Game"
                  onPress={onResetGame}
                  color={tokens.color.red}
                  textStyle={{ color: tokens.mode === "dark" ? tokens.color.ink : "#121212" }}
                />
              </View>
            </BrutalSection>
          </ScrollView>
        </BrutalCard>

        <Pressable onPress={onClose} style={{ flex: 1 }} accessibilityRole="button" />
      </View>
    </Modal>
  )
}

function Row({ label, control }: { label: string; control: ReactNode }) {
  const { tokens } = useNeoBrutalTheme()

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <BrutalText
        selectable
        style={{ fontFamily: tokens.typography.heading, textTransform: "uppercase" }}
      >
        {label}
      </BrutalText>
      {control}
    </View>
  )
}
