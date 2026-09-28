export const ARCHITECTURE = [
  {
    id: "ingestion",
    name: "Data Ingestion Engine",
    fn: "Retrieval, parsing, and validation of sports data",
    status: "Prototype interface · generated inputs",
  },
  {
    id: "montecarlo",
    name: "Simulation Engine",
    fn: "Monte Carlo paths to price cover, totals, and props",
    status: "Local sandbox run",
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
    status: "UI pipeline · not a live service",
  },
  {
    id: "odds",
    name: "Odds / Spread Management",
    fn: "Line tape, steam, RLM, point-buy table",
    status: "Not connected to a book",
  },
  {
    id: "ev",
    name: "+EV Detection Module",
    fn: "Post-vig hurdle, unit size, card cap",
    status: "Active on the seeded sheet",
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