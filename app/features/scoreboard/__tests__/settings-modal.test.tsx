import { fireEvent, render } from "@testing-library/react-native";

import { SettingsModal } from "@/features/scoreboard/components/settings-modal";
import type { AppSettings, SortBy } from "@/features/scoreboard/types";

jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return new Proxy(
    {},
    {
      get: (_, iconName: string) => (props: object) =>
        React.createElement(Text, props, iconName),
    }
  );
});

jest.mock("@/theme/neo-brutal/theme", () => ({
  useNeoBrutalTheme: () => ({
    tokens: {
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
      typography: {
        heading: "System",
        body: "System",
        mono: "System",
      },
      spacing: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 },
    },
  }),
}));

const settings: AppSettings = {
  currentRound: 1,
  enableTeams: false,
  numberOfRounds: 0,
  showPerRoundScores: true,
  sortBy: "score-desc",
};

const sortOptions: Array<{ label: string; value: SortBy }> = [
  { label: "Name", value: "name" },
  { label: "High score first", value: "score-desc" },
  { label: "Low score first", value: "score-asc" },
];

describe("SettingsModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(
    sortOptions
  )("keeps $label as a draft choice until save, then saves $value", ({
    label,
    value,
  }) => {
    const onChangeSortBy = jest.fn();
    const { getByRole, getByText } = render(
      <SettingsModal
        onChangeNumberOfRounds={jest.fn()}
        onChangeSortBy={onChangeSortBy}
        onClose={jest.fn()}
        onToggleAccumulated={jest.fn()}
        onToggleTeams={jest.fn()}
        settings={settings}
        visible
      />
    );

    expect(
      getByRole("radio", { name: "High score first", selected: true })
    ).toBeTruthy();

    fireEvent.press(getByRole("radio", { name: label }));

    expect(onChangeSortBy).not.toHaveBeenCalled();
    expect(getByRole("radio", { name: label, selected: true })).toBeTruthy();

    fireEvent.press(getByText("Save Changes"));

    expect(onChangeSortBy).toHaveBeenCalledWith(value);
  });

  it("resets the sort draft to name before saving", () => {
    const onChangeSortBy = jest.fn();
    const { getByRole, getByText } = render(
      <SettingsModal
        onChangeNumberOfRounds={jest.fn()}
        onChangeSortBy={onChangeSortBy}
        onClose={jest.fn()}
        onToggleAccumulated={jest.fn()}
        onToggleTeams={jest.fn()}
        settings={settings}
        visible
      />
    );

    fireEvent.press(getByRole("radio", { name: "Low score first" }));
    fireEvent.press(getByText("Reset"));

    expect(getByRole("radio", { name: "Name", selected: true })).toBeTruthy();
    expect(onChangeSortBy).not.toHaveBeenCalled();

    fireEvent.press(getByText("Save Changes"));

    expect(onChangeSortBy).toHaveBeenCalledWith("name");
  });

  it("discards an unsaved sort choice when reopened", () => {
    const props = {
      onChangeNumberOfRounds: jest.fn(),
      onChangeSortBy: jest.fn(),
      onClose: jest.fn(),
      onToggleAccumulated: jest.fn(),
      onToggleTeams: jest.fn(),
      settings,
    };
    const { getByRole, rerender } = render(
      <SettingsModal {...props} visible />
    );

    fireEvent.press(getByRole("radio", { name: "Low score first" }));
    fireEvent.press(getByRole("button", { name: "Close settings" }));
    rerender(<SettingsModal {...props} visible={false} />);
    rerender(<SettingsModal {...props} visible />);

    expect(
      getByRole("radio", { name: "High score first", selected: true })
    ).toBeTruthy();
    expect(props.onChangeSortBy).not.toHaveBeenCalled();
  });
});
