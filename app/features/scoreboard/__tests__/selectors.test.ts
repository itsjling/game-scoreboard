import {
  getPlayerDisplayScore,
  getPlayersByTeam,
  getSortedPlayers,
  getTeamScores,
} from "@/features/scoreboard/selectors";
import type { AppSettings, Player } from "@/features/scoreboard/types";

const settings: AppSettings = {
  enableTeams: true,
  sortBy: "score-desc",
  numberOfRounds: 0,
  currentRound: 2,
  showPerRoundScores: true,
};

const players: Player[] = [
  { id: "a", name: "Alice", color: "#FF3B30", scores: [2, 1], teamId: "t1" },
  { id: "b", name: "Bob", color: "#0A84FF", scores: [1, 5], teamId: "t1" },
  { id: "c", name: "Chris", color: "#FFD60A", scores: [4, 2], teamId: null },
];

describe("scoreboard selectors", () => {
  it("computes per-round display score", () => {
    expect(getPlayerDisplayScore(players[0], settings)).toBe(1);
    expect(getPlayerDisplayScore(players[1], settings)).toBe(5);
  });

  it("sorts players by score desc in current mode", () => {
    const sorted = getSortedPlayers(players, settings);
    expect(sorted.map((player) => player.id)).toEqual(["b", "c", "a"]);
  });

  it("groups players by teams and computes team scores", () => {
    const grouped = getPlayersByTeam(players);
    expect(Object.keys(grouped)).toContain("t1");
    expect(Object.keys(grouped)).toContain("no-team");

    const scores = getTeamScores(grouped, settings);
    expect(scores.t1).toBe(6);
    expect(scores["no-team"]).toBe(2);
  });
});
