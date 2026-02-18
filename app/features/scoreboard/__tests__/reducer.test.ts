import { scoreboardActions } from "@/features/scoreboard/actions";
import {
  createInitialScoreboardState,
  scoreboardReducer,
} from "@/features/scoreboard/reducer";

describe("scoreboardReducer", () => {
  it("adds and removes players", () => {
    let state = createInitialScoreboardState();

    state = scoreboardReducer(
      state,
      scoreboardActions.addPlayer("Alex", "#FF3B30", null)
    );
    state = scoreboardReducer(
      state,
      scoreboardActions.addPlayer("Bea", "#0A84FF", null)
    );

    expect(state.activeGame.players).toHaveLength(2);
    expect(state.activeGame.players.map((player) => player.name)).toEqual([
      "Alex",
      "Bea",
    ]);

    const alexId = state.activeGame.players[0].id;
    state = scoreboardReducer(state, scoreboardActions.removePlayer(alexId));
    expect(state.activeGame.players).toHaveLength(1);
    expect(state.activeGame.players[0].name).toBe("Bea");
  });

  it("handles round transitions and score mutations", () => {
    let state = createInitialScoreboardState();
    state = scoreboardReducer(
      state,
      scoreboardActions.addPlayer("Alex", "#FF3B30", null)
    );

    const playerId = state.activeGame.players[0].id;
    state = scoreboardReducer(
      state,
      scoreboardActions.incrementPlayerScore(playerId, 3)
    );
    expect(state.activeGame.players[0].scores[0]).toBe(3);

    state = scoreboardReducer(state, scoreboardActions.nextRound());
    expect(state.activeGame.settings.currentRound).toBe(2);
    expect(state.activeGame.players[0].scores[1]).toBe(0);

    state = scoreboardReducer(
      state,
      scoreboardActions.setPlayerExactScore(playerId, 7)
    );
    expect(state.activeGame.players[0].scores[1]).toBe(7);

    state = scoreboardReducer(state, scoreboardActions.previousRound());
    expect(state.activeGame.settings.currentRound).toBe(1);

    state = scoreboardReducer(state, scoreboardActions.resetCurrentRound());
    expect(state.activeGame.players[0].scores[0]).toBe(0);
  });

  it("creates history and can load from history", () => {
    let state = createInitialScoreboardState();
    const startingGameId = state.activeGame.id;

    state = scoreboardReducer(
      state,
      scoreboardActions.addPlayer("Alex", "#FF3B30", null)
    );
    state = scoreboardReducer(
      state,
      scoreboardActions.incrementPlayerScore(state.activeGame.players[0].id, 4)
    );
    state = scoreboardReducer(state, scoreboardActions.startNewGame());

    expect(state.history).toHaveLength(1);
    expect(state.history[0].id).toBe(startingGameId);
    expect(state.activeGame.id).not.toBe(startingGameId);

    state = scoreboardReducer(
      state,
      scoreboardActions.loadHistoryGame(startingGameId)
    );
    expect(state.activeGame.id).toBe(startingGameId);
    expect(state.activeGame.players[0].scores[0]).toBe(4);
    expect(state.activeGame.settings.currentRound).toBe(1);
  });

  it("supports team lifecycle", () => {
    let state = createInitialScoreboardState();
    state = scoreboardReducer(state, scoreboardActions.setEnableTeams(true));
    state = scoreboardReducer(
      state,
      scoreboardActions.addTeam("A-Team", "#0A84FF")
    );

    expect(state.activeGame.teams).toHaveLength(1);

    const teamId = state.activeGame.teams[0].id;
    state = scoreboardReducer(
      state,
      scoreboardActions.addPlayer("Alex", "#FF3B30", teamId)
    );
    expect(state.activeGame.players[0].teamId).toBe(teamId);

    state = scoreboardReducer(state, scoreboardActions.removeTeam(teamId));
    expect(state.activeGame.teams).toHaveLength(0);
    expect(state.activeGame.players[0].teamId).toBeNull();
  });
});
