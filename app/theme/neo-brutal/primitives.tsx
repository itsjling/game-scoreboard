import { ReactNode } from "react"
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from "react-native"

import { useNeoBrutalTheme } from "./theme"

interface BrutalCardProps extends ViewProps {
  outlined?: boolean
  compact?: boolean
}

export function BrutalCard({
  style,
  outlined = false,
  compact = false,
  ...props
}: BrutalCardProps) {
  const { tokens } = useNeoBrutalTheme()
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: outlined ? tokens.color.surfaceAlt : tokens.color.surface,
          borderColor: tokens.color.border,
          borderWidth: outlined ? tokens.border.width : 0,
          borderRadius: tokens.border.radius,
          padding: compact ? tokens.spacing.sm : tokens.spacing.md,
        },
        style,
      ]}
    />
  )
}

export interface BrutalButtonProps extends Omit<PressableProps, "style"> {
  label: string
  color?: string
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export function BrutalButton({ label, style, color, textStyle, ...props }: BrutalButtonProps) {
  const { tokens } = useNeoBrutalTheme()
  const fill = color ?? tokens.color.yellow
  const labelColor = getReadableTextColor(fill, tokens.color.ink, tokens.color.background)

  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [
        {
          borderWidth: 0,
          borderRadius: tokens.border.radius,
          backgroundColor: fill,
          minHeight: 50,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: tokens.spacing.lg,
          opacity: props.disabled ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
      disabled={props.disabled}
    >
      <Text
        style={[
          {
            fontFamily: tokens.typography.heading,
            color: labelColor,
            fontSize: 14,
            letterSpacing: 0.3,
            textTransform: "uppercase",
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export function BrutalInput({ style, placeholderTextColor, ...props }: TextInputProps) {
  const { tokens } = useNeoBrutalTheme()
  return (
    <TextInput
      {...props}
      placeholderTextColor={placeholderTextColor ?? tokens.color.mutedInk}
      style={[
        {
          borderColor: tokens.color.border,
          borderWidth: 1,
          borderRadius: tokens.border.radius,
          backgroundColor: tokens.color.surface,
          color: tokens.color.ink,
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.sm,
          fontFamily: tokens.typography.body,
          minHeight: 50,
        },
        style,
      ]}
    />
  )
}

export function BrutalText({ style, ...props }: TextProps) {
  const { tokens } = useNeoBrutalTheme()
  return (
    <Text
      {...props}
      style={[{ color: tokens.color.ink, fontFamily: tokens.typography.body }, style]}
    />
  )
}

export function BrutalHeading({ style, ...props }: TextProps) {
  const { tokens } = useNeoBrutalTheme()
  return (
    <Text
      {...props}
      style={[
        {
          color: tokens.color.ink,
          fontFamily: tokens.typography.heading,
          fontSize: 22,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        style,
      ]}
    />
  )
}

export function ScorePill({ value, style }: { value: number; style?: StyleProp<ViewStyle> }) {
  const { tokens } = useNeoBrutalTheme()
  return (
    <View
      style={[
        styles.scorePill,
        {
          backgroundColor: tokens.color.yellow,
        },
        style,
      ]}
    >
      <Text
        selectable
        style={{
          fontFamily: tokens.typography.mono,
          color: getReadableTextColor(
            tokens.color.yellow,
            tokens.color.ink,
            tokens.color.background,
          ),
          fontSize: 17,
          fontVariant: ["tabular-nums"],
          fontWeight: "700",
        }}
      >
        {value}
      </Text>
    </View>
  )
}

export function ColorDot({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: color,
      }}
    />
  )
}

export function BrutalSection({ title, children }: { title: string; children: ReactNode }) {
  const { tokens } = useNeoBrutalTheme()
  return (
    <BrutalCard compact style={{ gap: tokens.spacing.xs }}>
      <BrutalText
        selectable
        style={{
          fontFamily: tokens.typography.heading,
          fontSize: 16,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </BrutalText>
      {children}
    </BrutalCard>
  )
}

const styles = StyleSheet.create({
  scorePill: {
    minWidth: 52,
    height: 36,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
})

function getReadableTextColor(background: string, dark: string, light: string) {
  const hex = background.replace("#", "")
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return dark
  }

  const r = Number.parseInt(hex.slice(0, 2), 16) / 255
  const g = Number.parseInt(hex.slice(2, 4), 16) / 255
  const b = Number.parseInt(hex.slice(4, 6), 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance < 0.58 ? light : dark
}
