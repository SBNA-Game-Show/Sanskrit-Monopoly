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

// exported in json format to be injested by rules page
export const ruleSections: RuleSection[] = [
  {
    title: "Objective",
    body: "Do I really have to explain to you how Monopoly works?",
  },
  {
    title: "Taking Turns",
    body: "Just like lining up at a Starbucks, you can't skip turns. \n Click each section to learn more.",
    bullets: [
      {
        text: "Roll two dice",
        detail: {
          label: "Rolling",
          description:
            "Two dice are rolled simultaneously. The total of both is what determines how many spaces you move forward. If you roll doubles (like both die were a 4), you get an extra turn. BUT. Roll three consecutive doubles and you'll be sent straight to jail.",
        },
      },
      {
        text: "Move forward based on total rolled",
        detail: {
          label: "Movement",
          description:
            "Move clockwise around the board by the total number that's shown on the dice. If you pass Go, collect ₩200. Landing exactly on Go also pays ₩200.",
        },
      },
      {
        text: "Resolve the space landed on",
        detail: {
          label: "Landing",
          description:
            "Each space has a specific rule. Properties can be bought or trigger rent. Chance and Community Chest draw cards. Tax spaces cost you immediately. Special spaces like Jail or Free Parking have their own effects.",
        },
      },
      {
        text: "Pass the turn to the next player",
        detail: {
          label: "End of Turn",
          description:
            "Once all actions are resolved, the turn passes clockwise. You may not make trades or purchases after ending your turn.",
        },
      },
    ],
  },
  {
    title: "Lorem Ipsum",
    body: "Sample text",
    bullets: [
      {
        text: "Lorem ipsum dolor sit amet",
        detail: {
          label: "consectetur",
          description:
            "Sed blandit dignissim elit, ac facilisis eros sodales sit amet.",
        },
      },
    ],
  },
];
