import { fireEvent, render, screen } from "@testing-library/react-native";

import type { GameSnapshot } from "../../types";
import { HistoryModal } from "../history-modal";

const TWO_PLAYERS_REGEX = /2 players/;
const ONE_PLAYER_REGEX = /1 players/;

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  ArrowLeft: "ArrowLeft",
  Trash2: "Trash2",
}));

// Mock ScoreTable since it depends on theme context
jest.mock("../score-table", () => ({
  ScoreTable: ({
    title,
    currentRound,
  }: {
    title: string;
    currentRound: number;
  }) => {
    const { Text } = require("react-native");
    return (
      <Text testID="score-table">
        {title} - Round {currentRound}
      </Text>
    );
  },
}));

const makeGame = (
  overrides: Partial<GameSnapshot> & { id: string; name: string }
): GameSnapshot => ({
  dateIso: new Date("2025-06-01T12:00:00Z").toISOString(),
  players: [
    {
      id: "player_1",
      name: "Alice",
      color: "#FF3B30",
      scores: [10, 5],
      teamId: null,
    },
    {
      id: "player_2",
      name: "Bob",
      color: "#0A84FF",
      scores: [8, 7],
      teamId: null,
    },
  ],
  teams: [],
  settings: {
    currentRound: 2,
    enableTeams: false,
    numberOfRounds: 0,
    showPerRoundScores: true,
    sortBy: "name",
  },
  ...overrides,
});

const currentGame = makeGame({ id: "current_1", name: "Current Match" });

const historyGames: GameSnapshot[] = [
  makeGame({ id: "game_1", name: "Round Robin" }),
  makeGame({
    id: "game_2",
    name: "Finals",
    dateIso: new Date("2025-07-15T18:00:00Z").toISOString(),
    players: [
      {
        id: "player_3",
        name: "Charlie",
        color: "#34C759",
        scores: [20],
        teamId: null,
      },
    ],
    settings: {
      currentRound: 1,
      enableTeams: false,
      numberOfRounds: 3,
      showPerRoundScores: true,
      sortBy: "name",
    },
  }),
];

const defaultProps = {
  visible: true,
  currentGame,
  history: historyGames,
  selectedGameId: null,
  onClose: jest.fn(),
  onSelectGame: jest.fn(),
  onLoadGame: jest.fn(),
  onDeleteGame: jest.fn(),
  onClearHistory: jest.fn(),
};

describe("HistoryModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("visibility", () => {
    it("renders nothing when visible is false", () => {
      const { toJSON } = render(
        <HistoryModal {...defaultProps} visible={false} />
      );
      expect(toJSON()).toBeNull();
    });

    it("renders content when visible is true", () => {
      render(<HistoryModal {...defaultProps} />);
      expect(screen.getByText("History")).toBeTruthy();
    });
  });

  describe("header", () => {
    it("displays the History title", () => {
      render(<HistoryModal {...defaultProps} />);
      expect(screen.getByText("History")).toBeTruthy();
    });

    it("displays the Back button", () => {
      render(<HistoryModal {...defaultProps} />);
      expect(screen.getByText("Back")).toBeTruthy();
    });

    it("calls onClose when Back button is pressed", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByLabelText("Close history"));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("tab navigation", () => {
    it("displays Current and Previous tabs", () => {
      render(<HistoryModal {...defaultProps} />);
      expect(screen.getByText("Current")).toBeTruthy();
      expect(screen.getByText("Previous")).toBeTruthy();
    });

    it("shows current game ScoreTable by default (rounds tab)", () => {
      render(<HistoryModal {...defaultProps} />);
      expect(screen.getByText("Current Game - Round 2")).toBeTruthy();
    });

    it("switches to games tab when Previous is pressed", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));
      expect(screen.getByText("Round Robin")).toBeTruthy();
      expect(screen.getByText("Finals")).toBeTruthy();
    });

    it("switches back to rounds tab when Current is pressed", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));
      expect(screen.getByText("Round Robin")).toBeTruthy();

      fireEvent.press(screen.getByText("Current"));
      expect(screen.getByText("Current Game - Round 2")).toBeTruthy();
    });
  });

  describe("games tab — history list", () => {
    it("displays all game entries with names", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      expect(screen.getByText("Round Robin")).toBeTruthy();
      expect(screen.getByText("Finals")).toBeTruthy();
    });

    it("displays date and player count for each game", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      expect(screen.getByText(TWO_PLAYERS_REGEX)).toBeTruthy();
      expect(screen.getByText(ONE_PLAYER_REGEX)).toBeTruthy();
    });

    it("shows Load and Delete buttons for each game", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      const loadButtons = screen.getAllByText("Load");
      const deleteButtons = screen.getAllByText("Delete");
      expect(loadButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });

    it("shows Clear All History button", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      expect(screen.getByText("Clear All History")).toBeTruthy();
    });
  });

  describe("games tab — empty state", () => {
    it("shows 'No previous games' when history is empty", () => {
      render(<HistoryModal {...defaultProps} history={[]} />);
      fireEvent.press(screen.getByText("Previous"));

      expect(screen.getByText("No previous games")).toBeTruthy();
    });

    it("does not show Clear All History when history is empty", () => {
      render(<HistoryModal {...defaultProps} history={[]} />);
      fireEvent.press(screen.getByText("Previous"));

      expect(screen.queryByText("Clear All History")).toBeNull();
    });

    it("does not show Load or Delete buttons when history is empty", () => {
      render(<HistoryModal {...defaultProps} history={[]} />);
      fireEvent.press(screen.getByText("Previous"));

      expect(screen.queryByText("Load")).toBeNull();
      expect(screen.queryByText("Delete")).toBeNull();
    });
  });

  describe("game actions", () => {
    it("calls onLoadGame with game id when Load is pressed", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      const loadButtons = screen.getAllByText("Load");
      fireEvent.press(loadButtons[0]);
      expect(defaultProps.onLoadGame).toHaveBeenCalledWith("game_1");
    });

    it("calls onDeleteGame with game id when Delete is pressed", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.press(deleteButtons[0]);
      expect(defaultProps.onDeleteGame).toHaveBeenCalledWith("game_1");
    });

    it("calls onDeleteGame with correct id for second game", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.press(deleteButtons[1]);
      expect(defaultProps.onDeleteGame).toHaveBeenCalledWith("game_2");
    });

    it("calls onClearHistory when Clear All History is pressed", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      fireEvent.press(screen.getByText("Clear All History"));
      expect(defaultProps.onClearHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe("game expansion / selection", () => {
    it("calls onSelectGame with game id when game entry is pressed", () => {
      render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      fireEvent.press(screen.getByText("Round Robin"));
      expect(defaultProps.onSelectGame).toHaveBeenCalledWith("game_1");
    });

    it("calls onSelectGame with null when expanded game is pressed again", () => {
      render(<HistoryModal {...defaultProps} selectedGameId="game_1" />);
      fireEvent.press(screen.getByText("Previous"));

      fireEvent.press(screen.getByText("Round Robin"));
      expect(defaultProps.onSelectGame).toHaveBeenCalledWith(null);
    });

    it("shows ScoreTable for expanded game", () => {
      render(<HistoryModal {...defaultProps} selectedGameId="game_1" />);
      fireEvent.press(screen.getByText("Previous"));

      expect(screen.getByText("Round Robin Rounds - Round 2")).toBeTruthy();
    });

    it("does not show ScoreTable for collapsed games", () => {
      render(<HistoryModal {...defaultProps} selectedGameId="game_1" />);
      fireEvent.press(screen.getByText("Previous"));

      expect(screen.queryByText("Finals Rounds - Round 1")).toBeNull();
    });
  });

  describe("delete removes entries from rendered list", () => {
    it("renders fewer entries when history prop shrinks after delete", () => {
      const { rerender } = render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      expect(screen.getAllByText("Load")).toHaveLength(2);

      rerender(<HistoryModal {...defaultProps} history={[historyGames[0]]} />);

      expect(screen.getAllByText("Load")).toHaveLength(1);
      expect(screen.getByText("Round Robin")).toBeTruthy();
      expect(screen.queryByText("Finals")).toBeNull();
    });

    it("shows empty state when all games are deleted", () => {
      const { rerender } = render(<HistoryModal {...defaultProps} />);
      fireEvent.press(screen.getByText("Previous"));

      expect(screen.getAllByText("Delete")).toHaveLength(2);

      rerender(<HistoryModal {...defaultProps} history={[]} />);

      expect(screen.getByText("No previous games")).toBeTruthy();
      expect(screen.queryByText("Clear All History")).toBeNull();
    });
  });
});
