// shared/gameEvents.js

export const GAME_EVENTS = {
  LOBBY_JOIN: "lobby:join",
  PLAYER_UPDATE_TOKEN: "player:update-token",

  GAME_START: "game:start",
  GAME_ROLL_DICE: "game:roll-dice",
  GAME_END: "game:end",
  GAME_HOST_SKIP_TURN: "game:host-skip-turn",
  GAME_HOST_KICK_PLAYER: "game:host-kick-player",
  GAME_HOST_END_GAME: "game:host-end-game",

  GAME_UPDATED: "game:updated",
  GAME_ERROR: "game:error",
  QUIZ_SUBMIT_ANSWER: "quiz:submitAnswer",
};
