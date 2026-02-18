// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import {
  Geist_700Bold as geistBold,
  Geist_300Light as geistLight,
  Geist_500Medium as geistMedium,
  Geist_400Regular as geistRegular,
  Geist_600SemiBold as geistSemiBold,
} from "@expo-google-fonts/geist";
import { Platform } from "react-native";

export const customFontsToLoad = {
  geistLight,
  geistRegular,
  geistMedium,
  geistSemiBold,
  geistBold,
};

const fonts = {
  geist: {
    // Cross-platform Google font.
    light: "geistLight",
    normal: "geistRegular",
    medium: "geistMedium",
    semiBold: "geistSemiBold",
    bold: "geistBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
};

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.geist,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({
    ios: fonts.helveticaNeue,
    android: fonts.sansSerif,
  }),
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
};
