import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Config from "@/config";
import { ErrorBoundary } from "@/screens/ErrorScreen/error-boundary";
import { ScoreboardScreen } from "@/screens/scoreboard-screen";
import { useAppTheme } from "@/theme/context";

import type { AppStackParamList, NavigationProps } from "./navigation-types";
import { navigationRef, useBackButtonHandler } from "./navigation-utilities";

const exitRoutes = Config.exitRoutes;
const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => {
  const {
    theme: { colors },
  } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen component={ScoreboardScreen} name="Scoreboard" />
    </Stack.Navigator>
  );
};

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme();

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName));

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  );
};
