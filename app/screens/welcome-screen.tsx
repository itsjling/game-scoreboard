import type { FC } from "react";
import {
  Image,
  type ImageStyle,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import { Screen } from "@/components/screen";
import { Text } from "@/components/text";
import { isRTL } from "@/i18n";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { useSafeAreaInsetsStyle } from "@/utils/use-safe-area-insets-style";

const welcomeLogo = require("@assets/images/logo.png");
const welcomeFace = require("@assets/images/welcome-face.png");

export const WelcomeScreen: FC = function WelcomeScreen() {
  const { themed, theme } = useAppTheme();

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"]);

  return (
    <Screen contentContainerStyle={$styles.flex1} preset="fixed">
      <View style={themed($topContainer)}>
        <Image
          resizeMode="contain"
          source={welcomeLogo}
          style={themed($welcomeLogo)}
        />
        <Text
          preset="heading"
          style={themed($welcomeHeading)}
          testID="welcome-heading"
          tx="welcomeScreen:readyForLaunch"
        />
        <Text preset="subheading" tx="welcomeScreen:exciting" />
        <Image
          resizeMode="contain"
          source={welcomeFace}
          style={$welcomeFace}
          tintColor={theme.colors.palette.neutral900}
        />
      </View>

      <View style={themed([$bottomContainer, $bottomContainerInsets])}>
        <Text size="md" tx="welcomeScreen:postscript" />
      </View>
    </Screen>
  );
};

const $topContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
});

const $bottomContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  justifyContent: "space-around",
});

const $welcomeLogo: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
});

const $welcomeFace: ImageStyle = {
  height: 169,
  width: 269,
  position: "absolute",
  bottom: -47,
  right: -80,
  transform: [{ scaleX: isRTL ? -1 : 1 }],
};

const $welcomeHeading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
});
