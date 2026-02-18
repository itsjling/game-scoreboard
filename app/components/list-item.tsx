import { forwardRef, type ReactElement } from "react";
import {
  type StyleProp,
  type TextStyle,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

import { Icon, type IconTypes } from "./icon";
import { Text, type TextProps } from "./text";

export interface ListItemProps extends TouchableOpacityProps {
  /**
   * Whether to show the bottom separator.
   * Default: false
   */
  bottomSeparator?: boolean;
  /**
   * Children components.
   */
  children?: TextProps["children"];
  /**
   * Optional View container style override.
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * How tall the list item should be.
   * Default: 56
   */
  height?: number;
  /**
   * Left action custom ReactElement.
   * Overrides `leftIcon`.
   */
  LeftComponent?: ReactElement;
  /**
   * Icon that should appear on the left.
   */
  leftIcon?: IconTypes;
  /**
   * An optional tint color for the left icon
   */
  leftIconColor?: string;
  /**
   * Right action custom ReactElement.
   * Overrides `rightIcon`.
   */
  RightComponent?: ReactElement;
  /**
   * Icon that should appear on the right.
   */
  rightIcon?: IconTypes;
  /**
   * An optional tint color for the right icon
   */
  rightIconColor?: string;
  /**
   * Optional TouchableOpacity style override.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Pass any additional props directly to the Text component.
   */
  TextProps?: TextProps;
  /**
   * Text to display if not using `tx` or nested components.
   */
  text?: TextProps["text"];
  /**
   * Optional text style override.
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Whether to show the top separator.
   * Default: false
   */
  topSeparator?: boolean;
  /**
   * Text which is looked up via i18n.
   */
  tx?: TextProps["tx"];
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TextProps["txOptions"];
}

interface ListItemActionProps {
  Component?: ReactElement;
  icon?: IconTypes;
  iconColor?: string;
  side: "left" | "right";
  size: number;
}

/**
 * A styled row component that can be used in FlatList, SectionList, or by itself.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/ListItem/}
 * @param {ListItemProps} props - The props for the `ListItem` component.
 * @returns {JSX.Element} The rendered `ListItem` component.
 */
export const ListItem = forwardRef<View, ListItemProps>(function ListItem(
  props: ListItemProps,
  ref
) {
  const {
    bottomSeparator,
    children,
    height = 56,
    LeftComponent,
    leftIcon,
    leftIconColor,
    RightComponent,
    rightIcon,
    rightIconColor,
    style,
    text,
    TextProps,
    topSeparator,
    tx,
    txOptions,
    textStyle: $textStyleOverride,
    containerStyle: $containerStyleOverride,
    ...TouchableOpacityProps
  } = props;
  const { themed } = useAppTheme();

  const isTouchable =
    TouchableOpacityProps.onPress !== undefined ||
    TouchableOpacityProps.onPressIn !== undefined ||
    TouchableOpacityProps.onPressOut !== undefined ||
    TouchableOpacityProps.onLongPress !== undefined;

  const $textStyles = [$textStyle, $textStyleOverride, TextProps?.style];

  const $containerStyles = [
    topSeparator && $separatorTop,
    bottomSeparator && $separatorBottom,
    $containerStyleOverride,
  ];

  const $touchableStyles = [
    $styles.row,
    $touchableStyle,
    { minHeight: height },
    style,
  ];

  const Wrapper = isTouchable ? TouchableOpacity : View;

  return (
    <View ref={ref} style={themed($containerStyles)}>
      <Wrapper {...TouchableOpacityProps} style={$touchableStyles}>
        <ListItemAction
          Component={LeftComponent}
          icon={leftIcon}
          iconColor={leftIconColor}
          side="left"
          size={height}
        />

        <Text
          {...TextProps}
          style={themed($textStyles)}
          text={text}
          tx={tx}
          txOptions={txOptions}
        >
          {children}
        </Text>

        <ListItemAction
          Component={RightComponent}
          icon={rightIcon}
          iconColor={rightIconColor}
          side="right"
          size={height}
        />
      </Wrapper>
    </View>
  );
});

/**
 * @param {ListItemActionProps} props - The props for the `ListItemAction` component.
 * @returns {JSX.Element | null} The rendered `ListItemAction` component.
 */
function ListItemAction(props: ListItemActionProps) {
  const { icon, Component, iconColor, size, side } = props;
  const { themed } = useAppTheme();

  const $iconContainerStyles = [$iconContainer];

  if (Component) {
    return Component;
  }

  if (icon !== undefined) {
    return (
      <Icon
        color={iconColor}
        containerStyle={themed([
          $iconContainerStyles,
          side === "left" && $iconContainerLeft,
          side === "right" && $iconContainerRight,
          { height: size },
        ])}
        icon={icon}
        size={24}
      />
    );
  }

  return null;
}

const $separatorTop: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderTopWidth: 1,
  borderTopColor: colors.separator,
});

const $separatorBottom: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $textStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xs,
  alignSelf: "center",
  flexGrow: 1,
  flexShrink: 1,
});

const $touchableStyle: ViewStyle = {
  alignItems: "flex-start",
};

const $iconContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  flexGrow: 0,
};
const $iconContainerLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginEnd: spacing.md,
});

const $iconContainerRight: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginStart: spacing.md,
});
