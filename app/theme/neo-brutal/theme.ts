import { useMemo } from "react";

import { useAppTheme } from "@/theme/context";

import { neoBrutalDarkTokens, neoBrutalLightTokens } from "./tokens";

export function useNeoBrutalTheme() {
  const { themeContext, setThemeContextOverride } = useAppTheme();

  const tokens = useMemo(() => {
    return themeContext === "dark" ? neoBrutalDarkTokens : neoBrutalLightTokens;
  }, [themeContext]);

  return {
    tokens,
    themeMode: themeContext,
    setThemeMode: setThemeContextOverride,
  };
}
