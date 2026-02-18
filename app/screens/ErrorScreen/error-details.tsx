import type { ErrorInfo } from "react";
import { ScrollView, type TextStyle, View, type ViewStyle } from "react-native";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { Screen } from "@/components/screen";
import { Text } from "@/components/text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface ErrorDetailsProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset(): void;
}

/**
 * Renders the error details screen.
 * @param {ErrorDetailsProps} props - The props for the `ErrorDetails` component.
 * @returns {JSX.Element} The rendered `ErrorDetails` component.
 */
export function ErrorDetails(props: ErrorDetailsProps) {
  const { themed } = useAppTheme();
  return (
    <Screen
      contentContainerStyle={themed($contentContainer)}
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
    >
      <View style={$topSection}>
        <Icon icon="ladybug" size={64} />
        <Text
          preset="subheading"
          style={themed($heading)}
          tx="errorScreen:title"
        />
        <Text tx="errorScreen:friendlySubtitle" />
      </View>

      <ScrollView
        contentContainerStyle={themed($errorSectionContentContainer)}
        style={themed($errorSection)}
      >
        <Text
          style={themed($errorContent)}
          text={`${props.error}`.trim()}
          weight="bold"
        />
        <Text
          selectable
          style={themed($errorBacktrace)}
          text={`${props.errorInfo?.componentStack ?? ""}`.trim()}
        />
      </ScrollView>

      <Button
        onPress={props.onReset}
        preset="reversed"
        style={themed($resetButton)}
        tx="errorScreen:reset"
      />
    </Screen>
  );
}

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  flex: 1,
});

const $topSection: ViewStyle = {
  flex: 1,
  alignItems: "center",
};

const $heading: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
});

const $errorSection: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 2,
  backgroundColor: colors.separator,
  marginVertical: spacing.md,
  borderRadius: 6,
});

const $errorSectionContentContainer: ThemedStyle<ViewStyle> = ({
  spacing,
}) => ({
  padding: spacing.md,
});

const $errorContent: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
});

const $errorBacktrace: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  color: colors.textDim,
});

const $resetButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  paddingHorizontal: spacing.xxl,
});
