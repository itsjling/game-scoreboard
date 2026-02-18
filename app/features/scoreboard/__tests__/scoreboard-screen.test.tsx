import { fireEvent, render } from "@testing-library/react-native";

import { ScoreboardScreen } from "@/features/scoreboard/components/scoreboard-screen";

jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return new Proxy(
    {},
    {
      get: (_, iconName: string) => (props: any) =>
        React.createElement(Text, props, String(iconName)),
    }
  );
});

jest.mock("@/components/screen", () => {
  const { View } = require("react-native");
  return {
    Screen: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

jest.mock("@/features/scoreboard/persistence", () => ({
  loadScoreboardState: jest.fn(() => {
    const {
      createInitialScoreboardState,
    } = require("@/features/scoreboard/reducer");
    return createInitialScoreboardState();
  }),
  saveScoreboardState: jest.fn(() => true),
}));

jest.mock("@/services/analytics/posthog-client", () => ({
  analytics: {
    init: jest.fn(),
    capture: jest.fn(),
  },
}));

jest.mock("@/theme/neo-brutal/theme", () => ({
  useNeoBrutalTheme: () => ({
    themeMode: "light",
    setThemeMode: jest.fn(),
    tokens: {
      mode: "light",
      color: {
        background: "#F9F7EF",
        surface: "#FFFFFF",
        surfaceAlt: "#F2ECD9",
        ink: "#121212",
        mutedInk: "#353535",
        border: "#121212",
        danger: "#C21807",
        red: "#FF3B30",
        yellow: "#FFD60A",
        blue: "#0A84FF",
        green: "#34C759",
        purple: "#BF5AF2",
      },
      border: { width: 3, radius: 10 },
      shadow: { offsetX: 4, offsetY: 4, color: "#121212" },
      typography: {
        heading: "System",
        body: "System",
        mono: "System",
      },
      spacing: {
        xs: 6,
        sm: 10,
        md: 14,
        lg: 18,
        xl: 24,
      },
    },
  }),
}));

describe("ScoreboardScreen", () => {
  it("adds a player in edit mode", () => {
    const { getByLabelText, getByDisplayValue, getByText } = render(
      <ScoreboardScreen />
    );

    fireEvent.press(getByText("Add Player"));
    fireEvent.changeText(getByLabelText("Player name 1"), "Alex");

    expect(getByDisplayValue("Alex")).toBeTruthy();
  });

  it("renders start game action", () => {
    const { getByText } = render(<ScoreboardScreen />);
    expect(getByText("Start Game")).toBeTruthy();
  });
});
