export const ARCHITECTURE = [
  {
    id: "ingestion",
    name: "Data Ingestion Engine",
    fn: "Retrieval, parsing, and validation of sports data",
    status: "ESPN scoreboard, standings, injuries, Open-Meteo",
  },
  {
    id: "montecarlo",
    name: "Simulation Engine",
    fn: "Monte Carlo paths to price cover, totals, and props",
    status: "Runs in the browser on the live slate",
  },
  {
    id: "analytics",
    name: "Analytics Module",
    fn: "ROI, ruin, calibration, and value metrics on the paper book",
    status: "On-desk · paper only",
  },
  {
    id: "framework",
    name: "AI Agent Framework",
    fn: "Orchestrates ingest → sim → EV → parlay on a clone of the sheet",
    status: "Runs on each desk cycle",
  },
  {
    id: "odds",
    name: "Odds / Spread Management",
    fn: "Line tape, steam, RLM, point-buy table",
    status: "Pinnacle, FanDuel, Bovada, DraftKings on the current week",
  },
  {
    id: "ev",
    name: "+EV Detection Module",
    fn: "Post-vig hurdle, unit size, card cap",
    status: "Active when a book posts the price",
  },
  {
    id: "parlay",
    name: "Parlay Optimizer",
    fn: "3-leg construction with a correlation haircut",
    status: "Sandbox · same-game banned unless SGP",
  },
  {
    id: "compliance",
    name: "Compliance & Security",
    fn: "21+, responsible gambling, regional research-only default",
    status: "Policy copy · no KYC/AML workflow",
  },
  {
    id: "monitor",
    name: "Monitoring & Logging",
    fn: "Run journal, snapshots, drift board",
    status: "Session journal · simulated health",
  },
] as const;