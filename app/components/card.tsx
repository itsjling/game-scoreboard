import { type ComponentType, Fragment, type ReactElement } from "react";
import {
  type StyleProp,
  type TextStyle,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle, ThemedStyleArray } from "@/theme/types";

import { Text, type TextProps } from "./Text";

type Presets = "default" | "reversed";

interface CardProps extends TouchableOpacityProps {
  /**
   * Custom content component.
   * Overrides all other `content*` props.
   */
  ContentComponent?: ReactElement;
  /**
   * Pass any additional props directly to the content Text component.
   */
  ContentTextProps?: TextProps;
  /**
   * The content text to display if not using `contentTx`.
   */
  content?: TextProps["text"];
  /**
   * Style overrides for content text.
   */
  contentStyle?: StyleProp<TextStyle>;
  /**
   * Content text which is looked up via i18n.
   */
  contentTx?: TextProps["tx"];
  /**
   * Optional content options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  contentTxOptions?: TextProps["txOptions"];
  /**
   * Custom footer component.
   * Overrides all other `footer*` props.
   */
  FooterComponent?: ReactElement;
  /**
   * Pass any additional props directly to the footer Text component.
   */
  FooterTextProps?: TextProps;
  /**
   * The footer text to display if not using `footerTx`.
   */
  footer?: TextProps["text"];
  /**
   * Style overrides for footer text.
   */
  footerStyle?: StyleProp<TextStyle>;
  /**
   * Footer text which is looked up via i18n.
   */
  footerTx?: TextProps["tx"];
  /**
   * Optional footer options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  footerTxOptions?: TextProps["txOptions"];
  /**
   * Custom heading component.
   * Overrides all other `heading*` props.
   */
  HeadingComponent?: ReactElement;
  /**
   * Pass any additional props directly to the heading Text component.
   */
  HeadingTextProps?: TextProps;
  /**
   * The heading text to display if not using `headingTx`.
   */
  heading?: TextProps["text"];
  /**
   * Style overrides for heading text.
   */
  headingStyle?: StyleProp<TextStyle>;
  /**
   * Heading text which is looked up via i18n.
   */
  headingTx?: TextProps["tx"];
  /**
   * Optional heading options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  headingTxOptions?: TextProps["txOptions"];
  /**
   * Custom component added to the left of the card body.
   */
  LeftComponent?: ReactElement;
  /**
   * One of the different types of text presets.
   */
  preset?: Presets;
  /**
   * Custom component added to the right of the card body.
   */
  RightComponent?: ReactElement;
  /**
   * How the content should be aligned vertically. This is especially (but not exclusively) useful
   * when the card is a fixed height but the content is dynamic.
   *
   * `top` (default) - aligns all content to the top.
   * `center` - aligns all content to the center.
   * `space-between` - spreads out the content evenly.
   * `force-footer-bottom` - aligns all content to the top, but forces the footer to the bottom.
   */
  verticalAlignment?:
    | "top"
    | "center"
    | "space-between"
    | "force-footer-bottom";
}

/**
 * Cards are useful for displaying related information in a contained way.
 * If a ListItem displays content horizontally, a Card can be used to display content vertically.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Card/}
 * @param {CardProps} props - The props for the `Card` component.
 * @returns {JSX.Element} The rendered `Card` component.
 */
function computeCardStyleProps(
  themed: <T>(style: T) => StyleProp<T>,
  preset: Presets,
  spacing: { xxxs: number; md: number },
  isHeadingPresent: boolean,
  isContentPresent: boolean,
  isFooterPresent: boolean,
  verticalAlignment: "top" | "center" | "space-between" | "force-footer-bottom",
  leftComponent?: ReactElement,
  rightComponent?: ReactElement
) {
  const $headingStyle = [
    themed($headingPresets[preset]),
    (isFooterPresent || isContentPresent) && { marginBottom: spacing.xxxs },
  ];
  const $contentStyle = [
    themed($contentPresets[preset]),
    isHeadingPresent && { marginTop: spacing.xxxs },
    isFooterPresent && { marginBottom: spacing.xxxs },
  ];
  const $footerStyle = [
    themed($footerPresets[preset]),
    (isHeadingPresent || isContentPresent) && { marginTop: spacing.xxxs },
  ];
  const $alignmentWrapperStyle = [
    $alignmentWrapper,
    { justifyContent: $alignmentWrapperFlexOptions[verticalAlignment] },
    leftComponent && { marginStart: spacing.md },
    rightComponent && { marginEnd: spacing.md },
  ];
  return { $headingStyle, $contentStyle, $footerStyle, $alignmentWrapperStyle };
}

export function Card(props: CardProps) {
  const {
    content,
    contentTx,
    contentTxOptions,
    footer,
    footerTx,
    footerTxOptions,
    heading,
    headingTx,
    headingTxOptions,
    ContentComponent,
    HeadingComponent,
    FooterComponent,
    LeftComponent,
    RightComponent,
    verticalAlignment = "top",
    style: $containerStyleOverride,
    contentStyle: $contentStyleOverride,
    headingStyle: $headingStyleOverride,
    footerStyle: $footerStyleOverride,
    ContentTextProps,
    HeadingTextProps,
    FooterTextProps,
    ...WrapperProps
  } = props;

  const { themed, theme } = useAppTheme();
  const { spacing } = theme;

  const preset: Presets = props.preset ?? "default";
  const isPressable = !!WrapperProps.onPress;
  const isHeadingPresent = !!(HeadingComponent || heading || headingTx);
  const isContentPresent = !!(ContentComponent || content || contentTx);
  const isFooterPresent = !!(FooterComponent || footer || footerTx);

  const Wrapper = (isPressable ? TouchableOpacity : View) as ComponentType<
    TouchableOpacityProps | ViewProps
  >;
  const HeaderContentWrapper =
    verticalAlignment === "force-footer-bottom" ? View : Fragment;

  const $containerStyle: StyleProp<ViewStyle> = [
    themed($containerPresets[preset]),
    $containerStyleOverride,
  ];

  const { $headingStyle, $contentStyle, $footerStyle, $alignmentWrapperStyle } =
    computeCardStyleProps(
      themed,
      preset,
      spacing,
      isHeadingPresent,
      isContentPresent,
      isFooterPresent,
      verticalAlignment,
      LeftComponent,
      RightComponent
    );

  return (
    <Wrapper
      accessibilityRole={isPressable ? "button" : undefined}
      activeOpacity={0.8}
      style={$containerStyle}
      {...WrapperProps}
    >
      {LeftComponent}

      <View style={$alignmentWrapperStyle}>
        <HeaderContentWrapper>
          {HeadingComponent ||
            (isHeadingPresent && (
              <Text
                text={heading}
                tx={headingTx}
                txOptions={headingTxOptions}
                weight="bold"
                {...HeadingTextProps}
                style={$headingStyle}
              />
            ))}

          {ContentComponent ||
            (isContentPresent && (
              <Text
                text={content}
                tx={contentTx}
                txOptions={contentTxOptions}
                weight="normal"
                {...ContentTextProps}
                style={$contentStyle}
              />
            ))}
        </HeaderContentWrapper>

        {FooterComponent ||
          (isFooterPresent && (
            <Text
              size="xs"
              text={footer}
              tx={footerTx}
              txOptions={footerTxOptions}
              weight="normal"
              {...FooterTextProps}
              style={$footerStyle}
            />
          ))}
      </View>

      {RightComponent}
    </Wrapper>
  );
}

const $containerBase: ThemedStyle<ViewStyle> = (theme) => ({
  borderRadius: theme.spacing.md,
  padding: theme.spacing.xs,
  borderWidth: 1,
  shadowColor: theme.colors.palette.neutral800,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 12.81,
  elevation: 16,
  minHeight: 96,
});

const $alignmentWrapper: ViewStyle = {
  flex: 1,
  alignSelf: "stretch",
};

const $alignmentWrapperFlexOptions = {
  top: "flex-start",
  center: "center",
  "space-between": "space-between",
  "force-footer-bottom": "space-between",
} as const;

const $containerPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  default: [
    $styles.row,
    $containerBase,
    (theme) => ({
      backgroundColor: theme.colors.palette.neutral100,
      borderColor: theme.colors.palette.neutral300,
    }),
  ],
  reversed: [
    $styles.row,
    $containerBase,
    (theme) => ({
      backgroundColor: theme.colors.palette.neutral800,
      borderColor: theme.colors.palette.neutral500,
    }),
  ],
};

const $headingPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [],
  reversed: [(theme) => ({ color: theme.colors.palette.neutral100 })],
};

const $contentPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [],
  reversed: [(theme) => ({ color: theme.colors.palette.neutral100 })],
};

const $footerPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [],
  reversed: [(theme) => ({ color: theme.colors.palette.neutral100 })],
};
