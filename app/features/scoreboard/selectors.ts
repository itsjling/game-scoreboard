import type {
  AppSettings,
  GameSnapshot,
  Player,
  ScoreboardState,
  Team,
} from "./types";

export function getPlayerDisplayScore(
  player: Player,
  settings: AppSettings
): number {
  if (settings.showPerRoundScores) {
    return player.scores[settings.currentRound - 1] ?? 0;
  }
  return player.scores
    .slice(0, settings.currentRound)
    .reduce((total, score) => total + score, 0);
}

export function getPlayerTotalScore(player: Player): number {
  return player.scores.reduce((total, score) => total + score, 0);
}

export function getSortedPlayers(
  players: Player[],
  settings: AppSettings
): Player[] {
  return [...players].sort((a, b) => {
    if (settings.sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    const aScore = getPlayerDisplayScore(a, settings);
    const bScore = getPlayerDisplayScore(b, settings);
    if (settings.sortBy === "score-asc") {
      return aScore - bScore;
    }
    return bScore - aScore;
  });
}

export function getPlayersByTeam(players: Player[]): Record<string, Player[]> {
  return players.reduce<Record<string, Player[]>>((acc, player) => {
    const teamKey = player.teamId ?? "no-team";
    if (!acc[teamKey]) {
      acc[teamKey] = [];
    }
    acc[teamKey].push(player);
    return acc;
  }, {});
}

export function getTeamScores(
  playersByTeam: Record<string, Player[]>,
  settings: AppSettings
) {
  return Object.entries(playersByTeam).reduce<Record<string, number>>(
    (acc, [teamId, teamPlayers]) => {
      acc[teamId] = teamPlayers.reduce(
        (sum, player) => sum + getPlayerDisplayScore(player, settings),
        0
      );
      return acc;
    },
    {}
  );
}

export function getTeamById(teams: Team[], teamId: string | null): Team | null {
  if (!teamId) {
    return null;
  }
  return teams.find((team) => team.id === teamId) ?? null;
}

export function getTeamName(teams: Team[], teamId: string | null): string {
  if (!teamId) {
    return "No Team";
  }
  return getTeamById(teams, teamId)?.name ?? "No Team";
}

export function getTeamColor(teams: Team[], teamId: string | null): string {
  if (!teamId) {
    return "#000000";
  }
  return getTeamById(teams, teamId)?.color ?? "#000000";
}

export function getHistoryGameById(
  state: ScoreboardState,
  gameId: string
): GameSnapshot | null {
  return state.history.find((game) => game.id === gameId) ?? null;
}
