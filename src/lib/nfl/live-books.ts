import { createServerFn } from "@tanstack/react-start";
import type { LiveBoard } from "./books";

export const fetchLiveBoard = createServerFn({ method: "GET" }).handler(async (): Promise<LiveBoard> => {
  const { pullLiveBoard } = await import("./live-books.server");
  return pullLiveBoard();
});
