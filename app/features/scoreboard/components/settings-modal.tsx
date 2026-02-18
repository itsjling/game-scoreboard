import {
  BarChart3,
  Infinity as InfinityIcon,
  List,
  type LucideIcon,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react-native";
import { type ReactNode, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { DEFAULT_SETTINGS } from "@/features/scoreboard/constants";
import { BrutalText } from "@/theme/neo-brutal/primitives";
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme";

import type { AppSettings, SortBy } from "../types";

interface SettingsModalProps {
  onChangeNumberOfRounds: (value: number) => void;
  onChangeSortBy: (value: SortBy) => void;
  onClose: () => void;
  onToggleAccumulated: (showPerRound: boolean) => void;
  onToggleTeams: (enableTeams: boolean) => void;
  settings: AppSettings;
  visible: boolean;
}

export function SettingsModal({
  visible,
  settings,
  onClose,
  onToggleTeams,
  onToggleAccumulated,
  onChangeNumberOfRounds,
  onChangeSortBy,
}: SettingsModalProps) {
  const { tokens } = useNeoBrutalTheme();
  const [draftEnableTeams, setDraftEnableTeams] = useState(
    settings.enableTeams
  );
  const [draftShowPerRound, setDraftShowPerRound] = useState(
    settings.showPerRoundScores
  );
  const [draftNumberOfRounds, setDraftNumberOfRounds] = useState(
    settings.numberOfRounds
  );
  const [draftSortBy, setDraftSortBy] = useState<SortBy>(settings.sortBy);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setDraftEnableTeams(settings.enableTeams);
    setDraftShowPerRound(settings.showPerRoundScores);
    setDraftNumberOfRounds(settings.numberOfRounds);
    setDraftSortBy(settings.sortBy);
  }, [settings, visible]);

  const applyChanges = () => {
    onToggleTeams(draftEnableTeams);
    onToggleAccumulated(draftShowPerRound);
    onChangeNumberOfRounds(draftNumberOfRounds);
    onChangeSortBy(draftSortBy);
    onClose();
  };

  const resetDraft = () => {
    setDraftEnableTeams(DEFAULT_SETTINGS.enableTeams);
    setDraftShowPerRound(DEFAULT_SETTINGS.showPerRoundScores);
    setDraftNumberOfRounds(DEFAULT_SETTINGS.numberOfRounds);
    setDraftSortBy(DEFAULT_SETTINGS.sortBy);
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#DCE1EA",
          borderWidth: 5,
          borderColor: "#000000",
        }}
      >
        <View
          style={{
            backgroundColor: "#FEE500",
            borderBottomWidth: 5,
            borderBottomColor: "#000000",
            paddingHorizontal: 18,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderWidth: 4,
                borderColor: "#000000",
                backgroundColor: "#000000",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BrutalText
                style={{
                  fontFamily: tokens.typography.heading,
                  fontSize: 24,
                  color: "#FFFFFF",
                }}
              >
                S
              </BrutalText>
            </View>
            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: 28,
                textTransform: "uppercase",
              }}
            >
              Settings
            </BrutalText>
          </View>
          <IconTile icon={X} onPress={onClose} />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            gap: 18,
            paddingBottom: 280,
          }}
        >
          <TiltLabel label="Gameplay" />
          <ShadowCard>
            <View style={{ gap: 18 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, gap: 8 }}>
                  <BrutalText style={styles.title(tokens.typography.heading)}>
                    Enable Teams
                  </BrutalText>
                  <Tag color="#D9CFEA" text="Group Play" />
                </View>
                <ToggleSquare
                  onPress={() => setDraftEnableTeams((prev) => !prev)}
                  value={draftEnableTeams}
                />
              </View>
            </View>
          </ShadowCard>

          <ShadowCard>
            <View style={{ gap: 18 }}>
              <View style={{ gap: 8 }}>
                <BrutalText style={styles.title(tokens.typography.heading)}>
                  Round Cap
                </BrutalText>
                <Tag color="#D7E0EE" text="Max Rounds" />
              </View>
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    borderWidth: 4,
                    borderColor: "#000000",
                  }}
                >
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      setDraftNumberOfRounds((prev) => Math.max(0, prev - 1))
                    }
                    style={[styles.stepButton, { backgroundColor: "#F6F6F6" }]}
                  >
                    <Minus color="#000000" size={28} strokeWidth={2.8} />
                  </Pressable>
                  <View
                    style={[styles.stepValue, { backgroundColor: "#FEE500" }]}
                  >
                    {draftNumberOfRounds === 0 ? (
                      <InfinityIcon
                        color="#000000"
                        size={32}
                        strokeWidth={2.8}
                      />
                    ) : (
                      <BrutalText
                        style={styles.stepValueText(tokens.typography.heading)}
                      >
                        {draftNumberOfRounds}
                      </BrutalText>
                    )}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setDraftNumberOfRounds((prev) => prev + 1)}
                    style={[styles.stepButton, { backgroundColor: "#F6F6F6" }]}
                  >
                    <Plus color="#000000" size={28} strokeWidth={2.8} />
                  </Pressable>
                </View>
              </View>
            </View>
          </ShadowCard>

          <TiltLabel label="Display Mode" />
          <SelectableModeCard
            body="Individual scores for current round."
            icon={List}
            onPress={() => setDraftShowPerRound(true)}
            selected={draftShowPerRound}
            title="Per-round"
          />
          <View style={{ marginBottom: 22 }}>
            <SelectableModeCard
              body="Accumulated sum of all rounds."
              icon={BarChart3}
              onPress={() => setDraftShowPerRound(false)}
              selected={!draftShowPerRound}
              title="Total Score"
            />
          </View>
        </ScrollView>

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            borderTopWidth: 5,
            borderTopColor: "#000000",
            backgroundColor: "#E6E6E8",
            padding: 16,
            gap: 16,
          }}
        >
          <ShadowButton
            color="#F8F8F8"
            icon={RotateCcw}
            label="Reset"
            onPress={resetDraft}
            textColor="#000000"
          />
          <ShadowButton
            color="#9850F6"
            label="Save Changes"
            onPress={applyChanges}
            textColor="#F4F4FF"
          />
        </View>
      </View>
    </Modal>
  );
}

function TiltLabel({ label }: { label: string }) {
  const { tokens } = useNeoBrutalTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        transform: [{ rotate: "-1.5deg" }],
        backgroundColor: "#000000",
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
      <BrutalText
        style={{
          fontFamily: tokens.typography.heading,
          fontSize: 18,
          textTransform: "uppercase",
          color: "#FFFFFF",
        }}
      >
        {label}
      </BrutalText>
    </View>
  );
}

function ShadowCard({ children }: { children: ReactNode }) {
  return (
    <View style={{ marginRight: 6, marginBottom: 6 }}>
      <View
        style={{
          position: "absolute",
          left: 6,
          top: 6,
          right: -6,
          bottom: -6,
          backgroundColor: "#000000",
        }}
      />
      <View
        style={{
          borderWidth: 5,
          borderColor: "#000000",
          backgroundColor: "#F2F2F2",
          paddingHorizontal: 16,
          paddingVertical: 18,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Tag({ text, color }: { text: string; color: string }) {
  const { tokens } = useNeoBrutalTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: color,
        borderWidth: 1,
        borderColor: "#000000",
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <BrutalText
        style={{
          fontFamily: tokens.typography.heading,
          textTransform: "uppercase",
          fontSize: 14,
          color: "#1A1A1A",
        }}
      >
        {text}
      </BrutalText>
    </View>
  );
}

function ToggleSquare({
  value,
  onPress,
}: {
  value: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={{
        borderWidth: 4,
        borderColor: "#000000",
        width: 102,
        height: 56,
        padding: 6,
        justifyContent: "center",
        alignItems: value ? "flex-start" : "flex-end",
        backgroundColor: "#FFFFFF",
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          backgroundColor: "#000000",
        }}
      />
    </Pressable>
  );
}

function SelectableModeCard({
  title,
  body,
  icon,
  selected,
  onPress,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
  selected: boolean;
  onPress: () => void;
}) {
  const { tokens } = useNeoBrutalTheme();
  const Icon = icon;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <ShadowCard>
        <View style={{ gap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                flex: 1,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderWidth: 4,
                  borderColor: "#000000",
                  backgroundColor: selected ? "#000000" : "#FFFFFF",
                }}
              />
              <BrutalText style={styles.title(tokens.typography.heading)}>
                {title}
              </BrutalText>
            </View>
            <Icon color="#000000" size={28} strokeWidth={2.4} />
          </View>
          <BrutalText
            style={{
              color: "#454545",
              fontFamily: tokens.typography.body,
              fontSize: 14,
              marginLeft: 54,
            }}
          >
            {body}
          </BrutalText>
        </View>
      </ShadowCard>
    </Pressable>
  );
}

function ShadowButton({
  label,
  color,
  onPress,
  textColor,
  icon,
}: {
  label: string;
  color: string;
  onPress: () => void;
  textColor: string;
  icon?: LucideIcon;
}) {
  const { tokens } = useNeoBrutalTheme();
  const Icon = icon;

  return (
    <View style={{ marginRight: 6, marginBottom: 6 }}>
      <View
        style={{
          position: "absolute",
          left: 6,
          top: 6,
          right: -6,
          bottom: -6,
          backgroundColor: "#000000",
        }}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={{
          borderWidth: 5,
          borderColor: "#000000",
          backgroundColor: color,
          minHeight: 84,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 12,
        }}
      >
        {Icon ? <Icon color={textColor} size={20} strokeWidth={2.6} /> : null}
        <BrutalText
          style={{
            fontFamily: tokens.typography.heading,
            textTransform: "uppercase",
            fontSize: 22,
            color: textColor,
          }}
        >
          {label}
        </BrutalText>
      </Pressable>
    </View>
  );
}

function IconTile({
  icon,
  onPress,
}: {
  icon: LucideIcon;
  onPress: () => void;
}) {
  const Icon = icon;

  return (
    <View style={{ marginRight: 4, marginBottom: 4 }}>
      <View
        style={{
          position: "absolute",
          left: 4,
          top: 4,
          right: -4,
          bottom: -4,
          backgroundColor: "#000000",
        }}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={{
          width: 72,
          height: 72,
          borderWidth: 5,
          borderColor: "#000000",
          backgroundColor: "#F8F8F8",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon color="#000000" size={32} strokeWidth={2.8} />
      </Pressable>
    </View>
  );
}

const styles = {
  title: (font: string) =>
    ({
      fontFamily: font,
      textTransform: "uppercase",
      fontSize: 20,
      color: "#000000",
    }) as const,
  stepButton: {
    width: 86,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 4,
    borderRightColor: "#000000",
  } as const,
  stepValue: {
    minWidth: 120,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 4,
    borderRightColor: "#000000",
    paddingHorizontal: 14,
  } as const,
  stepValueText: (font: string) =>
    ({
      fontFamily: font,
      fontSize: 24,
      color: "#000000",
      textTransform: "uppercase",
    }) as const,
};
