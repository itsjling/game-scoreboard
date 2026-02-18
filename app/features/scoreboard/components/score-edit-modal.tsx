import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, View } from "react-native";

import { BrutalText } from "@/theme/neo-brutal/primitives";
import { useNeoBrutalTheme } from "@/theme/neo-brutal/theme";

import type { Player } from "../types";

interface ScoreEditModalProps {
  currentScore: number;
  onApply: (newScore: number) => void;
  onClose: () => void;
  player: Player;
  visible: boolean;
}

type Operator = "+" | "-" | "×" | "÷";

interface Operation {
  operator: Operator;
  value: number;
}

export function ScoreEditModal({
  visible,
  player,
  currentScore,
  onClose,
  onApply,
}: ScoreEditModalProps) {
  const { tokens } = useNeoBrutalTheme();

  // Completed operations (e.g., [{operator: "x", value: 2}])
  const [operations, setOperations] = useState<Operation[]>([]);
  // The operator waiting for input (e.g., after pressing "+")
  const [pendingOperator, setPendingOperator] = useState<Operator | null>(null);
  // Current number being typed
  const [inputValue, setInputValue] = useState<string>("");

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setOperations([]);
      setPendingOperator(null);
      setInputValue("");
    }
  }, [visible]);

  // Calculate the final result based on all staged operations
  const calculatedValue = useMemo(() => {
    let result = currentScore;

    // Include the pending input if there is one
    const allOperations = [...operations];
    if (pendingOperator && inputValue) {
      allOperations.push({
        operator: pendingOperator,
        value: Number.parseInt(inputValue, 10) || 0,
      });
    }

    for (const op of allOperations) {
      switch (op.operator) {
        case "+":
          result += op.value;
          break;
        case "-":
          result -= op.value;
          break;
        case "×":
          result *= op.value;
          break;
        case "÷":
          if (op.value !== 0) {
            result = Math.floor(result / op.value);
          }
          break;
        default:
          break;
      }
    }

    return result;
  }, [currentScore, operations, pendingOperator, inputValue]);

  const handleNumberPress = useCallback((num: string) => {
    setInputValue((prev) => prev + num);
  }, []);

  const handleOperatorPress = useCallback(
    (op: Operator) => {
      if (inputValue) {
        // Complete the pending operation with the input value
        const value = Number.parseInt(inputValue, 10) || 0;
        if (pendingOperator) {
          setOperations((prev) => [
            ...prev,
            { operator: pendingOperator, value },
          ]);
        }
        setInputValue("");
        setPendingOperator(op);
      } else if (pendingOperator) {
        // Change the pending operator
        setPendingOperator(op);
      } else {
        // First operator pressed
        setPendingOperator(op);
      }
    },
    [inputValue, pendingOperator]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setOperations([]);
    setPendingOperator(null);
  }, []);

  const handleBackspace = useCallback(() => {
    if (inputValue.length > 0) {
      // Delete last digit of current input
      const newValue = inputValue.slice(0, -1);
      setInputValue(newValue);
    } else if (pendingOperator) {
      // Remove the pending operator and restore the last operation if any
      setPendingOperator(null);
      if (operations.length > 0) {
        const lastOp = operations.at(-1);
        setOperations((prev) => prev.slice(0, -1));
        setPendingOperator(lastOp.operator);
        setInputValue(String(lastOp.value));
      }
    } else if (operations.length > 0) {
      // Remove the last completed operation and restore as pending
      const lastOp = operations.at(-1);
      setOperations((prev) => prev.slice(0, -1));
      setPendingOperator(lastOp.operator);
      setInputValue(String(lastOp.value));
    }
  }, [inputValue, pendingOperator, operations]);

  const handleApply = useCallback(() => {
    onApply(calculatedValue);
  }, [calculatedValue, onApply]);

  const renderCalcButton = (
    label: string,
    onPress: () => void,
    color = "#FFFFFF",
    flex = 1,
    testID?: string
  ) => (
    <Pressable
      accessibilityLabel={testID || label}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flex,
        backgroundColor: color,
        borderWidth: 4,
        borderColor: "#000000",
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        margin: -2,
      }}
      testID={testID || `calc-button-${label}`}
    >
      <BrutalText
        style={{
          fontFamily: tokens.typography.heading,
          fontSize: 24,
          color: "#000000",
        }}
      >
        {label}
      </BrutalText>
    </Pressable>
  );

  // Build the display expression
  const buildExpression = () => {
    const parts: React.ReactElement[] = [];

    // Always show starting score
    parts.push(
      <BrutalText
        key="start"
        style={{
          fontFamily: tokens.typography.heading,
          fontSize: 28,
          color: "#000000",
          fontVariant: ["tabular-nums"],
        }}
      >
        {currentScore}
      </BrutalText>
    );

    // Show all completed operations
    operations.forEach((op, index) => {
      parts.push(
        <BrutalText
          key={`op-${index}-${op.operator}`}
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 28,
            color: "#000000",
          }}
        >
          {" "}
          {op.operator}{" "}
        </BrutalText>
      );
      parts.push(
        <BrutalText
          key={`val-${index}-${op.value}`}
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 28,
            color: "#000000",
            fontVariant: ["tabular-nums"],
          }}
        >
          {op.value}
        </BrutalText>
      );
    });

    // Show pending operator and input
    if (pendingOperator) {
      parts.push(
        <BrutalText
          key="pending-op"
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 28,
            color: "#000000",
          }}
        >
          {" "}
          {pendingOperator}{" "}
        </BrutalText>
      );

      // Show input value (underlined if being typed)
      const displayValue = inputValue || "";
      parts.push(
        <BrutalText
          key="input"
          style={{
            fontFamily: tokens.typography.heading,
            fontSize: 28,
            color: "#000000",
            textDecorationLine: inputValue ? "underline" : undefined,
            fontVariant: ["tabular-nums"],
          }}
        >
          {displayValue}
        </BrutalText>
      );
    }

    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {parts}
      </View>
    );
  };

  // Show preview calculation
  const hasOperations = operations.length > 0 || pendingOperator !== null;
  const showPreview = hasOperations && calculatedValue !== currentScore;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: player.color,
            borderWidth: 4,
            borderColor: "#000000",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderBottomWidth: 4,
              borderBottomColor: "#000000",
            }}
          >
            <BrutalText
              style={{
                fontFamily: tokens.typography.heading,
                fontSize: 14,
                textTransform: "uppercase",
                color: "#000000",
                letterSpacing: 1,
              }}
            >
              Editing: {player.name}
            </BrutalText>
          </View>

          {/* Display */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              padding: 20,
              borderBottomWidth: 4,
              borderBottomColor: "#000000",
              alignItems: "flex-end",
              minHeight: 100,
              justifyContent: "center",
            }}
            testID="calc-display"
          >
            {buildExpression()}

            {/* Preview calculation */}
            {showPreview && (
              <BrutalText
                style={{
                  fontFamily: tokens.typography.heading,
                  fontSize: 20,
                  color: "#888888",
                  marginTop: 8,
                  fontVariant: ["tabular-nums"],
                }}
              >
                = {calculatedValue}
              </BrutalText>
            )}
          </View>

          {/* Calculator Grid */}
          <View>
            {/* Row 1: 7 8 9 / */}
            <View style={{ flexDirection: "row" }}>
              {renderCalcButton(
                "7",
                () => handleNumberPress("7"),
                "#FFFFFF",
                1,
                "btn-7"
              )}
              {renderCalcButton(
                "8",
                () => handleNumberPress("8"),
                "#FFFFFF",
                1,
                "btn-8"
              )}
              {renderCalcButton(
                "9",
                () => handleNumberPress("9"),
                "#FFFFFF",
                1,
                "btn-9"
              )}
              {renderCalcButton(
                "/",
                () => handleOperatorPress("÷"),
                "#59C7E8",
                1,
                "btn-divide"
              )}
            </View>

            {/* Row 2: 4 5 6 × */}
            <View style={{ flexDirection: "row" }}>
              {renderCalcButton(
                "4",
                () => handleNumberPress("4"),
                "#FFFFFF",
                1,
                "btn-4"
              )}
              {renderCalcButton(
                "5",
                () => handleNumberPress("5"),
                "#FFFFFF",
                1,
                "btn-5"
              )}
              {renderCalcButton(
                "6",
                () => handleNumberPress("6"),
                "#FFFFFF",
                1,
                "btn-6"
              )}
              {renderCalcButton(
                "×",
                () => handleOperatorPress("×"),
                "#90EE90",
                1,
                "btn-multiply"
              )}
            </View>

            {/* Row 3: 1 2 3 - */}
            <View style={{ flexDirection: "row" }}>
              {renderCalcButton(
                "1",
                () => handleNumberPress("1"),
                "#FFFFFF",
                1,
                "btn-1"
              )}
              {renderCalcButton(
                "2",
                () => handleNumberPress("2"),
                "#FFFFFF",
                1,
                "btn-2"
              )}
              {renderCalcButton(
                "3",
                () => handleNumberPress("3"),
                "#FFFFFF",
                1,
                "btn-3"
              )}
              {renderCalcButton(
                "-",
                () => handleOperatorPress("-"),
                "#59C7E8",
                1,
                "btn-subtract"
              )}
            </View>

            {/* Row 4: C 0 ⌫ + */}
            <View style={{ flexDirection: "row" }}>
              {renderCalcButton("C", handleClear, "#FFFFFF", 1, "btn-clear")}
              {renderCalcButton(
                "0",
                () => handleNumberPress("0"),
                "#FFFFFF",
                1,
                "btn-0"
              )}
              {renderCalcButton(
                "⌫",
                handleBackspace,
                "#FFFFFF",
                1,
                "btn-backspace"
              )}
              {renderCalcButton(
                "+",
                () => handleOperatorPress("+"),
                "#90EE90",
                1,
                "btn-add"
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: "row",
              borderTopWidth: 4,
              borderTopColor: "#000000",
            }}
          >
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                paddingVertical: 20,
                alignItems: "center",
                justifyContent: "center",
                borderRightWidth: 2,
                borderRightColor: "#000000",
              }}
              testID="btn-cancel"
            >
              <BrutalText
                style={{
                  fontFamily: tokens.typography.heading,
                  fontSize: 18,
                  textTransform: "uppercase",
                  color: "#000000",
                }}
              >
                Cancel
              </BrutalText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleApply}
              style={{
                flex: 1,
                backgroundColor: "#90EE90",
                paddingVertical: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
              testID="btn-apply"
            >
              <BrutalText
                style={{
                  fontFamily: tokens.typography.heading,
                  fontSize: 18,
                  textTransform: "uppercase",
                  color: "#000000",
                }}
              >
                Apply
              </BrutalText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
