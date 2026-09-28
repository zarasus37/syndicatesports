export type WorkflowState = "on" | "open" | "waiting" | "held";

export interface DeskWorkflow {
  id: string;
  name: string;
  does: string;
  state: WorkflowState;
  now: string;
}

export function weekWorkflows(input: {
  week: number;
  tapePrints: number;
  tapeAt: string | null;
  priced: boolean;
  tickets: number;
  predictions: number;
  locked: boolean;
  priorFinal: number;
  priorGames: number;
  weekFinal: number;
  weekGames: number;
  pickWeeks: number;
  pickHits: number;
  pickLosses: number;
}): DeskWorkflow[] {
  const prior =
    input.priorGames > 0
      ? `Week ${input.week - 1}: ${input.priorFinal} of ${input.priorGames} final.`
      : `Week ${input.week - 1} is not on the scoreboard yet.`;
  const live =
    input.weekGames > 0
      ? `Week ${input.week}: ${input.weekFinal} of ${input.weekGames} final.`
      : `Week ${input.week} has no scoreboard row yet.`;
  return [
    {
      id: "collect",
      name: "Collect",
      does: "Store a book price or a score when it changes. This is not a pick.",
      state: input.tapeAt ? "on" : "waiting",
      now: input.tapeAt
        ? `Last store ${input.tapeAt}. ${input.tapePrints} prices kept. The first print is not the book’s open.`
        : "No price stored yet.",
    },
    {
      id: "price",
      name: "Price the card",
      does: "A side or a total is a bet only at a posted price, after the juice, at 3% or more.",
      state: input.priced ? "on" : "waiting",
      now: input.priced
        ? input.tickets
          ? `${input.tickets} tickets cleared the hurdle. The other games are not bets.`
          : "Priced. No ticket cleared 3% after the juice."
        : "The card has not been priced.",
    },
    {
      id: "sixteen",
      name: "Name the 16",
      does: "Pick who wins each game, straight up. A prediction record. Not a wager.",
      state: input.predictions === 16 ? "held" : "waiting",
      now:
        input.predictions === 16
          ? "16 named. They join the record only after all 16 have been played."
          : `${input.predictions} of 16 named.`,
    },
    {
      id: "lock",
      name: "Lock",
      does: "One stamp for the card, before kickoff. A later change is refused.",
      state: input.locked ? "on" : "open",
      now: input.locked ? "The card is locked. The original stays." : "The card is still open.",
    },
    {
      id: "grade",
      name: "Grade",
      does: "A side or a total grades only when that game is final. Overtime counts.",
      state: input.weekGames > 0 && input.weekFinal === input.weekGames ? "on" : input.priorGames > 0 ? "held" : "waiting",
      now: `${prior} ${live}`,
    },
    {
      id: "record",
      name: "Weekly pick record",
      does: "Add a week of straight-up picks after all 16 are played. Units are not part of this.",
      state: input.pickWeeks ? "held" : "waiting",
      now: input.pickWeeks
        ? `${input.pickHits}–${input.pickLosses} from ${input.pickWeeks} finished weeks. Week ${input.week} is not in it.`
        : "No finished week of 16 is in the record yet.",
    },
    {
      id: "review",
      name: "Review",
      does: "A weight moves only after a settled week. A print does not move one.",
      state: "waiting",
      now: "No weight has moved. The sample is not a season.",
    },
  ];
}
