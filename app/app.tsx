/* eslint-disable import/first */
if (__DEV__) {
  require("./devtools/reactotron-config.ts");
}
import "./utils/gesture-handler";

import { useFonts } from "expo-font";
import { createURL } from "expo-linking";
import { useEffect, useState } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import { initI18n } from "./i18n";
import { AppNavigator } from "./navigators/app-navigator";
import { useNavigationPersistence } from "./navigators/navigation-utilities";
import { ThemeProvider } from "./theme/context";
import { customFontsToLoad } from "./theme/typography";
import { loadDateFnsLocale } from "./utils/format-date";
import { storage } from "./utils/storage";

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE";

const prefix = createURL("/");
const config = {
  screens: {
    Scoreboard: "",
  },
};

export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY);

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad);
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale());
  }, []);

  if (
    !(
      isNavigationStateRestored &&
      isI18nInitialized &&
      (areFontsLoaded || fontLoadError)
    )
  ) {
    return null;
  }

  const linking = {
    prefixes: [prefix],
    config,
  };

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <ThemeProvider>
          <AppNavigator
            initialState={initialNavigationState}
            linking={linking}
            onStateChange={onNavigationStateChange}
          />
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
