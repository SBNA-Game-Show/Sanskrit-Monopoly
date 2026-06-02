export const GAME_EVENTS = {
  LOBBY_JOIN: "lobby:join",
  PLAYER_UPDATE_TOKEN: "player:update-token",

  GAME_START: "game:start",
  GAME_ROLL_DICE: "game:roll-dice",
  GAME_END: "game:end",
  GAME_ADMIN_SKIP_TURN: "game:admin-skip-turn",
  GAME_ADMIN_KICK_PLAYER: "game:admin-kick-player",

  GAME_UPDATED: "game:updated",
  GAME_ERROR: "game:error",
} as const;
