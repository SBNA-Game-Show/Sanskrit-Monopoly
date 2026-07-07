export const GAME_EVENTS = {
  LOBBY_JOIN: "lobby:join",
  LOBBY_UPDATE_EDITION: "lobby:update-edition",
  LOBBY_LEAVE: "lobby:leave",
  PLAYER_UPDATE_TOKEN: "player:update-token",

  GAME_START: "game:start",
  GAME_ROLL_DICE: "game:roll-dice",
  GAME_END: "game:end",
  GAME_HOST_SKIP_TURN: "game:host-skip-turn",
  GAME_HOST_KICK_PLAYER: "game:host-kick-player",
  GAME_HOST_END_GAME: "game:host-end-game",
  GAME_HOST_RESTART_GAME: "game-host-restart-game",

  GAME_UPDATED: "game:updated",
  GAME_ERROR: "game:error",

  // generic
  GAME_PASS_TURN: "game:pass-turn",

  // jail
  GAME_PAY_BAIL: "game:pay-bail",

  // property-related stuff
  GAME_BUY_PROPERTY: "game:buy-property",
  GAME_DECLINE_PROPERTY: "game:decline-property",
  GAME_SELL_PROPERTY: "game:sell-property",

  // bankruptcy
  GAME_RESOLVE_BANKRUPTCY: "game:resolve-bankruptcy",
  GAME_DECLARE_BANKRUPTCY: "game:declare-bankruptcy",

  // auctioning
  GAME_PLACE_AUCTION_BID: "game:place-auction-bid",
  GAME_RESOLVE_AUCTION: "game:resolve-auction",

  QUIZ_SUBMIT_ANSWER: "quiz:submitAnswer",
} as const;
