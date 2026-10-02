import { createServerFn } from "@tanstack/react-start";
import type { BoxBoard } from "./box";

export const fetchBoxBoard = createServerFn({ method: "GET" }).handler(async (): Promise<BoxBoard> => {
  const { pullBoxBoard } = await import("./box-score.server");
  return pullBoxBoard();
});
