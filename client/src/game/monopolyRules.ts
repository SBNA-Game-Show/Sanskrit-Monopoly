export type RuleSection = {
  title: string;
  body: string;
  bullets?: string[];
};

// rules section to be visible in the rules page
export const ruleSections: RuleSection[] = [
  {
    title: "Objective",
    body: "Move around the board duh.",
  },
  {
    title: "Taking a Turn",
    body: "Players take turns rolling dice and moving around the board",
    bullets: [
      "Roll two dice",
      "Move forward by the total rolled",
      "Resolve the space landed on",
      "Pass the turn to the next player",
    ],
  },
];
