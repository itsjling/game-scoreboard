import type { NavigationContainer } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";

export interface AppStackParamList {
  Scoreboard: undefined;
}

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

export interface NavigationProps
  extends Partial<
    ComponentProps<typeof NavigationContainer<AppStackParamList>>
  > {}
