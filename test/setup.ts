// we always make sure 'react-native' gets included first
// biome-ignore lint/performance/noNamespaceImport: needed for module mocking
import * as ReactNative from "react-native";

import mockFile from "./mock-file";

// libraries to mock
jest.doMock("react-native", () =>
  Object.setPrototypeOf(
    {
      Image: {
        ...ReactNative.Image,
        resolveAssetSource: jest.fn((_source) => mockFile),
        getSize: jest.fn(
          (
            _uri: string,
            success: (width: number, height: number) => void,
            _failure?: (_error: unknown) => void
          ) => success(100, 100)
        ),
      },
    },
    ReactNative
  )
);

jest.mock("i18next", () => ({
  currentLocale: "en",
  t: (key: string, params: Record<string, string>) =>
    `${key} ${JSON.stringify(params)}`,
  translate: (key: string, params: Record<string, string>) =>
    `${key} ${JSON.stringify(params)}`,
}));

jest.mock("expo-localization", () => ({
  ...jest.requireActual("expo-localization"),
  getLocales: () => [{ languageTag: "en-US", textDirection: "ltr" }],
}));

jest.mock("../app/i18n/index.ts", () => {
  const mockT = (key: string, params: Record<string, string>) => {
    return `${key} ${JSON.stringify(params)}`;
  };
  return {
    i18n: {
      isInitialized: true,
      language: "en",
      numberToCurrency: jest.fn(),
      t: mockT,
    },
  };
});

declare const tron: unknown;

declare global {
  let __TEST__: boolean;
}
