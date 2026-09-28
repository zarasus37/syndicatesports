import { createServerFn } from "@tanstack/react-start";

export const readMarketTape = createServerFn({ method: "GET" }).handler(async () => {
  const { readTape, startScraper } = await import("./scrape.server");
  startScraper();
  return readTape();
});
