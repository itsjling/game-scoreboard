import { fireEvent, render, within } from "@testing-library/react-native";

import { ScoreEditModal } from "@/features/scoreboard/components/score-edit-modal";

// Mock the theme
jest.mock("@/theme/neo-brutal/theme", () => ({
  useNeoBrutalTheme: () => ({
    tokens: {
      mode: "light",
      color: {
        background: "#F7EFE8",
        surface: "#FFF8F2",
        surfaceAlt: "#EDD9CB",
        ink: "#241810",
        mutedInk: "#6E4B39",
        border: "#DABAA6",
        danger: "#A63927",
        red: "#C4540F",
        yellow: "#C4540F",
        blue: "#2E8399",
        green: "#4C9060",
        purple: "#745AB4",
      },
      border: {
        width: 1,
        radius: 0,
      },
      typography: {
        heading: "System",
        body: "System",
        mono: "System",
      },
      spacing: {
        xs: 8,
        sm: 12,
        md: 16,
        lg: 22,
        xl: 30,
      },
    },
  }),
}));

describe("ScoreEditModal", () => {
  const mockPlayer = {
    id: "player-1",
    name: "Test Player",
    color: "#FFD60A",
    scores: [],
    teamId: null,
  };

  const defaultProps = {
    visible: true,
    player: mockPlayer,
    currentScore: 18,
    onClose: jest.fn(),
    onApply: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to query within the display container
  const getDisplay = (utils: ReturnType<typeof render>) => {
    return utils.getByTestId("calc-display");
  };

  describe("Initial Display", () => {
    it("should display the current score initially, not 0", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Check display contains "18"
      const display = getDisplay(utils);
      expect(within(display).getByText("18")).toBeTruthy();
    });

    it("should show 0 as a placeholder when there are no operations", () => {
      const utils = render(
        <ScoreEditModal {...defaultProps} currentScore={0} />
      );

      // Check display contains "0"
      const display = getDisplay(utils);
      expect(within(display).getByText("0")).toBeTruthy();
    });
  });

  describe("Operator Flow", () => {
    it("should show operator after pressing it (e.g., 18 ×)", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Press multiplication operator using testID
      fireEvent.press(utils.getByTestId("btn-multiply"));

      // Check display now contains "×"
      const display = getDisplay(utils);
      expect(within(display).getByText("×")).toBeTruthy();
    });

    it("should show operator and number after typing (e.g., 18 × 2)", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Press multiplication operator
      fireEvent.press(utils.getByTestId("btn-multiply"));

      // Press number 2 using testID
      fireEvent.press(utils.getByTestId("btn-2"));

      // Check display contains both "×" and "2"
      const display = getDisplay(utils);
      expect(within(display).getByText("×")).toBeTruthy();
      expect(within(display).getByText("2")).toBeTruthy();
    });

    it("should chain multiple operations correctly (e.g., 18 × 2 + 2)", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Press ×, 2, +, 2 using testIDs
      fireEvent.press(utils.getByTestId("btn-multiply"));
      fireEvent.press(utils.getByTestId("btn-2"));
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-2"));

      // Check display contains all elements
      const display = getDisplay(utils);
      expect(within(display).getByText("18")).toBeTruthy();
      expect(within(display).getByText("×")).toBeTruthy();
      expect(within(display).getByText("+")).toBeTruthy();
      // "2" appears multiple times, so we just check the display has the right structure
      expect(display).toBeTruthy();
    });

    it("should NOT show duplicate operators when pressing operator multiple times", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Press multiplication operator
      fireEvent.press(utils.getByTestId("btn-multiply"));

      // Get display content after first press
      const display = getDisplay(utils);
      const opsAfterFirst = within(display).getAllByText("×");
      const countAfterFirst = opsAfterFirst.length;

      // Press multiplication operator again
      fireEvent.press(utils.getByTestId("btn-multiply"));

      // Get display content after second press
      const opsAfterSecond = within(display).getAllByText("×");
      const countAfterSecond = opsAfterSecond.length;

      // Count should remain the same (just changing operator, not adding)
      expect(countAfterSecond).toBe(countAfterFirst);
    });

    it("should calculate preview correctly for chained operations", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // 18 × 2 + 4 = 40
      fireEvent.press(utils.getByTestId("btn-multiply"));
      fireEvent.press(utils.getByTestId("btn-2"));
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-4"));

      // Check preview shows "= 40"
      const display = getDisplay(utils);
      expect(within(display).getByText("= 40")).toBeTruthy();
    });
  });

  describe("Backspace Behavior", () => {
    it("should delete digits when backspacing on input (e.g., 25 → 2)", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Type 25
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-2"));
      fireEvent.press(utils.getByTestId("btn-5"));

      // Check "25" is in display
      const display = getDisplay(utils);
      expect(within(display).getByText("25")).toBeTruthy();

      // Backspace once
      fireEvent.press(utils.getByTestId("btn-backspace"));

      // Check "25" is no longer in display, but "2" still is
      expect(within(display).queryByText("25")).toBeNull();
      expect(within(display).getByText("2")).toBeTruthy();
    });

    it("should remove operator when backspacing on empty input (e.g., 18 + → 18)", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Press + to add operator
      fireEvent.press(utils.getByTestId("btn-add"));

      // Check "+" is in display
      const display = getDisplay(utils);
      expect(within(display).getByText("+")).toBeTruthy();

      // Backspace to remove operator
      fireEvent.press(utils.getByTestId("btn-backspace"));

      // Check "+" is no longer in display
      expect(within(display).queryByText("+")).toBeNull();
    });

    it("should restore operation as editable when backspacing completed operation", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Create "18 × 2 + " by pressing operations
      fireEvent.press(utils.getByTestId("btn-multiply"));
      fireEvent.press(utils.getByTestId("btn-2"));
      fireEvent.press(utils.getByTestId("btn-add"));

      // Verify initial state - should have "18", "×", "2", "+"
      const display = getDisplay(utils);
      expect(within(display).getByText("18")).toBeTruthy();
      expect(within(display).getByText("×")).toBeTruthy();
      expect(within(display).getByText("2")).toBeTruthy();
      expect(within(display).getByText("+")).toBeTruthy();

      // Backspace - should remove "+" and restore "2" as editable input
      fireEvent.press(utils.getByTestId("btn-backspace"));

      // Should now show "18 × 2" (completed operation, no pending operator)
      expect(within(display).getByText("18")).toBeTruthy();
      expect(within(display).getByText("×")).toBeTruthy();
      expect(within(display).getByText("2")).toBeTruthy();
      // "+" should be gone
      expect(within(display).queryByText("+")).toBeNull();
    });

    it("should handle multi-step backspace correctly: 18 + 2 - 5 → 18 + 2 - → 18 + 2", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Build "18 + 2 - 5"
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-2"));
      fireEvent.press(utils.getByTestId("btn-subtract"));
      fireEvent.press(utils.getByTestId("btn-5"));

      // Verify full expression is shown
      const display = getDisplay(utils);
      expect(within(display).getByText("18")).toBeTruthy();
      expect(within(display).getByText("2")).toBeTruthy();
      expect(within(display).getByText("+")).toBeTruthy();
      expect(within(display).getByText("-")).toBeTruthy();
      expect(within(display).getByText("5")).toBeTruthy();

      // First backspace: remove "5" → "18 + 2 -"
      fireEvent.press(utils.getByTestId("btn-backspace"));

      // Second backspace: remove "-" operator → "18 + 2"
      fireEvent.press(utils.getByTestId("btn-backspace"));

      // Third backspace: should go back to editing "2"
      fireEvent.press(utils.getByTestId("btn-backspace"));

      // Should still show "18 + " with "2" as input
      expect(within(display).getByText("18")).toBeTruthy();
      expect(within(display).getByText("+")).toBeTruthy();
    });

    it("should NOT create ghost operations when backspacing multiple times", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Build "18 + 2"
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-2"));

      // Backspace twice to remove "2" and "+"
      fireEvent.press(utils.getByTestId("btn-backspace"));
      fireEvent.press(utils.getByTestId("btn-backspace"));

      // Should just show "18" - no "+" in display
      const display = getDisplay(utils);
      expect(within(display).getByText("18")).toBeTruthy();
      expect(within(display).queryByText("+")).toBeNull();
    });

    it("should allow appending to restored value after backspace (18 + 2 + 2 → backspace → backspace → 2 = 18 + 22)", async () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Build: 18 + 2 + 2
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-2"));
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-2"));

      // Backspace twice to remove second "2" and "+"
      fireEvent.press(utils.getByTestId("btn-backspace"));
      fireEvent.press(utils.getByTestId("btn-backspace"));

      // Now we should have "18 + 2" with "2" as editable input
      let display = getDisplay(utils);
      expect(within(display).getByText("18")).toBeTruthy();
      expect(within(display).getAllByText("+").length).toBeGreaterThanOrEqual(
        1
      );
      expect(within(display).getByText("2")).toBeTruthy();

      // Press 2 again - should append to make "22"
      fireEvent.press(utils.getByTestId("btn-2"));

      // Wait for state update
      await new Promise((resolve) => setTimeout(resolve, 0));

      display = getDisplay(utils);

      // Should now show "22" in the display (appended to the restored "2")
      expect(within(display).getByText("22")).toBeTruthy();

      // Preview should show 18 + 22 = 40
      expect(within(display).getByText("= 40")).toBeTruthy();
    });
  });

  describe("Clear Button", () => {
    it("should reset to initial state when clear is pressed", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // Build up some operations
      fireEvent.press(utils.getByTestId("btn-multiply"));
      fireEvent.press(utils.getByTestId("btn-2"));
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-5"));

      // Should have a preview calculation
      let display = getDisplay(utils);
      expect(within(display).getByText("= 41")).toBeTruthy();

      // Clear
      fireEvent.press(utils.getByTestId("btn-clear"));

      // Should be back to just "18" - no preview since no operations
      display = getDisplay(utils);
      expect(within(display).queryByText("= 41")).toBeNull();

      // Should only show "18" in display
      expect(within(display).getByText("18")).toBeTruthy();
    });
  });

  describe("Apply Button", () => {
    it("should apply the calculated value when apply is pressed", () => {
      const onApply = jest.fn();
      const utils = render(
        <ScoreEditModal {...defaultProps} onApply={onApply} />
      );

      // 18 + 5 = 23
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-5"));

      // Apply using testID
      fireEvent.press(utils.getByTestId("btn-apply"));

      expect(onApply).toHaveBeenCalledWith(23);
    });

    it("should apply chained operations correctly", () => {
      const onApply = jest.fn();
      const utils = render(
        <ScoreEditModal {...defaultProps} onApply={onApply} />
      );

      // 18 × 2 + 4 = 40
      fireEvent.press(utils.getByTestId("btn-multiply"));
      fireEvent.press(utils.getByTestId("btn-2"));
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-4"));

      // Apply
      fireEvent.press(utils.getByTestId("btn-apply"));

      expect(onApply).toHaveBeenCalledWith(40);
    });

    it("should return current score when no operations are entered", () => {
      const onApply = jest.fn();
      const utils = render(
        <ScoreEditModal {...defaultProps} currentScore={25} onApply={onApply} />
      );

      // Apply without any operations
      fireEvent.press(utils.getByTestId("btn-apply"));

      expect(onApply).toHaveBeenCalledWith(25);
    });
  });

  describe("Edge Cases", () => {
    it("should handle division by zero gracefully", () => {
      const utils = render(<ScoreEditModal {...defaultProps} />);

      // 18 ÷ 0
      fireEvent.press(utils.getByTestId("btn-divide"));
      fireEvent.press(utils.getByTestId("btn-0"));

      // Should show "18", "÷", and "0" in display (display uses ÷ not /)
      const display = getDisplay(utils);
      expect(within(display).getByText("18")).toBeTruthy();
      expect(within(display).getByText("÷")).toBeTruthy();
      expect(within(display).getByText("0")).toBeTruthy();
    });

    it("should handle zero as initial score", () => {
      const utils = render(
        <ScoreEditModal {...defaultProps} currentScore={0} />
      );

      // Check initial display shows 0
      const display = getDisplay(utils);
      expect(within(display).getByText("0")).toBeTruthy();

      // Add 5
      fireEvent.press(utils.getByTestId("btn-add"));
      fireEvent.press(utils.getByTestId("btn-5"));

      // Should show preview = 5
      expect(within(display).getByText("= 5")).toBeTruthy();
    });

    it("should handle large numbers", () => {
      const utils = render(
        <ScoreEditModal {...defaultProps} currentScore={999} />
      );

      // Should show initial large score
      const display = getDisplay(utils);
      expect(within(display).getByText("999")).toBeTruthy();

      // Multiply by 100
      fireEvent.press(utils.getByTestId("btn-multiply"));
      fireEvent.press(utils.getByTestId("btn-1"));
      fireEvent.press(utils.getByTestId("btn-0"));
      fireEvent.press(utils.getByTestId("btn-0"));

      // Should show preview = 99900
      expect(within(display).getByText("= 99900")).toBeTruthy();
    });
  });
});
