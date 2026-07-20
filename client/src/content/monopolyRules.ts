// monopolyRules.ts
// static content for Rules page

// expanded panel shown when bullet is clicked
export type BulletDetail = {
  label: string;
  description: string;
};

// single bullet point in a section
// opens a BulletDetailPanel with the extra content
export type RuleBullet = {
  text: string;
  detail?: BulletDetail;
};

// One tab in the sidebar
export type RuleSection = {
  title: string;
  body: string;
  bullets?: RuleBullet[];
};

// Explanation block used by the clickable board rule explorer.
export type TileRuleInfo = {
  title: string;
  summary: string;
  steps?: string[];
  note?: string;
};

// Tile-type copy is intentionally separate from tile data, so custom editions can reuse the same rules.
export const tileRuleInfoByType: Record<string, TileRuleInfo> = {
  start: {
    title: "Start Space",
    summary:
      "Pass or land on the start space and you collect ₩200. Not bad for walking in a square.",
    steps: [
      "Move past आरम्भः during a normal roll to collect the bonus.",
      "Getting moved straight to jail doesn't count as passing start.",
    ],
  },
  corner: {
    title: "Corner Space",
    summary:
      "Corners are the big landmark spaces. Some are harmless, and some exist to make your day more complicated.",
    steps: [
      "Land there and follow whatever the space says.",
      "If it doesn't give you a penalty or prompt, you're probably just visiting.",
    ],
  },
  property: {
    title: "Property",
    summary:
      "If nobody owns it, you can buy it. If someone else owns it, you pay them rent.",
    steps: [
      "Land on an unowned property to get the choice to buy it.",
      "Decline it, and the property can go to auction.",
      "Land on another player's property, and you pay that player rent.",
    ],
  },
  railroad: {
    title: "Railroad",
    summary:
      "Railroads work a lot like properties, but their rent can follow its own rules.",
    steps: [
      "Buy the railroad if it's unowned and you can afford it.",
      "Pay rent if another player owns it.",
      "Railroads can also be sold or auctioned.",
    ],
  },
  utility: {
    title: "Utility",
    summary:
      "Utilities can be bought too, but they don't behave exactly like color-set properties.",
  },
  tax: {
    title: "Tax",
    summary:
      "Bad luck. Land here and you pay the amount shown on the space.",
  },
  chance: {
    title: "Chance",
    summary:
      "Draw a Chance card and do what it says. It might help you, hurt you, or send you somewhere weird.",
  },
  community: {
    title: "Community Chest",
    summary:
      "Draw a Community Chest card and follow it. Sometimes the table is generous. Sometimes it is very much not.",
    steps: [
      "Read the card that appears.",
      "Take the money, pay the money, or follow the movement instruction.",
    ],
  },
  jail: {
    title: "Jail",
    summary:
      "If you're just visiting, you're fine. If you were sent here, deal with jail before your next normal turn.",
    steps: [
      "Pay bail if you can and want to leave right away.",
      "Pass your jail turn if you don't pay.",
    ],
  },
  goToJail: {
    title: "Go To Jail",
    summary:
      "Go straight to jail. No scenic route, no start bonus.",
  },
  special: {
    title: "Special Space",
    summary:
      "Special spaces are where the edition can throw a quiz, activity, or surprise rule at you.",
  },
  quiz: {
    title: "Quiz Activity",
    summary:
      "Answer the question before your turn can move on. Get it right, get it wrong, and let the game judge you accordingly.",
  },
  minigame: {
    title: "Mini-game Activity",
    summary:
      "Mini-game spaces pause the board for a quick activity before the next turn starts.",
  },
};

// Fallback keeps custom or unexpected edition tile types from showing an empty panel.
export const fallbackTileRuleInfo: TileRuleInfo = {
  title: "Activity Tile",
  summary:
    "This space belongs to a custom edition rule. Read the prompt when you land here and do what it says.",
  steps: [
    "Land on the space.",
    "Read the prompt that appears.",
    "Finish it before the next turn starts.",
  ],
};

// exported in json format to be injested by rules page
export const ruleSections: RuleSection[] = [
  {
    title: "Objective",
    body: "Buy spaces, collect rent, survive the board, and try not to go broke before everyone else does.",
  },
  {
    title: "Taking Turns",
    body: "On your turn, roll the die, move your token, and deal with whatever space you land on. The next player only goes after your space is fully handled.",
    bullets: [
      {
        text: "Roll one die",
        detail: {
          label: "Rolling",
          description:
            "When it's your turn, roll once and move that many spaces clockwise. The host can force the roll if the table gets stuck.",
        },
      },
      {
        text: "Collect ₩200 when you pass start",
        detail: {
          label: "Passing Start",
          description:
            "If your roll carries you past आरम्भः, you collect ₩200 before dealing with the space you landed on.",
        },
      },
      {
        text: "Land, then handle the space",
        detail: {
          label: "Landing",
          description:
            "You might buy property, pay rent, draw a card, answer a quiz, pay tax, or go to jail. Finish that before the next turn starts.",
        },
      },
      {
        text: "Some turns need cleanup",
        detail: {
          label: "End of Turn",
          description:
            "Auctions, bankruptcy, jail choices, and activities can pause the table. Once they're done, the game moves to the next active player.",
        },
      },
    ],
  },
  {
    title: "Buying Spaces",
    body: "Land on something unowned and you may get the chance to buy it. Own more spaces, collect more rent, cause more problems.",
    bullets: [
      {
        text: "Owned spaces charge rent",
        detail: {
          label: "Rent",
          description:
            "When another player lands on something you own, they pay you rent. Properties, railroads, and utilities can each have different rent amounts.",
        },
      },
      {
        text: "Declining can start an auction",
        detail: {
          label: "Auctions",
          description:
            "If you don't buy an unowned space, it can go up for auction. Someone else might grab it, possibly for less than you wanted to see.",
        },
      },
      {
        text: "You can sell owned spaces if you're having money trouble",
        detail: {
          label: "Selling",
          description:
            "When you need money, or are trying to save yourself from bankruptcy, you can sell whatever you own.",
        },
      },
    ],
  },
  {
    title: "Auctions",
    body: "Auctions happen when a space is up for grabs and the table gets a chance to fight over it.",
    bullets: [
      {
        text: "The host controls when bidding ends",
        detail: {
          label: "Closing Bids",
          description:
            "Players can raise the bid while the auction is open. When the host closes it, the highest valid bidder gets the space.",
        },
      },
      {
        text: "A bid must be affordable",
        detail: {
          label: "Bidding",
          description:
            "You can only bid if you have enough money!",
        },
      },
    ],
  },
  {
    title: "Bankruptcy",
    body: "If your money drops below zero, the game stops and gives you a chance to dig yourself out.",
    bullets: [
      {
        text: "Sell spaces to recover",
        detail: {
          label: "Recovery",
          description:
            "If selling your spaces gets your money back to zero or higher, you're still in the game. Bruised, but alive.",
        },
      },
      {
        text: "Bankruptcy can knock you out",
        detail: {
          label: "Elimination",
          description:
            "If you can't recover, you're eliminated. Your remaining spaces can be auctioned or cleared by the host.",
        },
      },
    ],
  },
  {
    title: "Quiz & Activities",
    body: "Some spaces pause the usual money drama and make you answer a question or finish a quick activity.",
    bullets: [
      {
        text: "Quiz spaces ask a question",
        detail: {
          label: "Sample Question",
          description:
            "Example: What does dharma most closely mean? Pick an answer, then take whatever result the game gives you.",
        },
      },
      {
        text: "Activities finish before the next turn",
        detail: {
          label: "Resolution",
          description:
            "Once the prompt or mini-game is done, the reward or penalty is applied and the board keeps moving.",
        },
      },
    ],
  },
  {
    title: "Host Role",
    body: "The host is the table manager. They keep the game moving when something needs a human nudge.",
    bullets: [
      {
        text: "The host can force rolls, skip turns, kick players, or end the game",
        detail: {
          label: "Table Control",
          description:
            "These buttons are mostly for stuck turns, absent players, or keeping a classroom/table game from grinding to a halt.",
        },
      },
      {
        text: "The host resolves auctions and bankruptcy cleanup",
        detail: {
          label: "Cleanup Control",
          description:
            "Auctions and bankruptcy cleanup wait for the host to close bidding, pick what gets auctioned, or clear spaces nobody wants.",
        },
      },
    ],
  },
  {
    title: "Custom Editions",
    body: "Custom editions can change names, prices, rent, sell values, and activities. The board might look different, but the basic way you play stays the same.",
  },
];
