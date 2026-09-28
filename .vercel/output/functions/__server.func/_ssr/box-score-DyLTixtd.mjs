import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/box-score-DyLTixtd.js
var fetchBoxBoard_createServerFn_handler = createServerRpc({
	id: "86a56c1ba8fe9c229c6c07c7413f59cea4011f435ece8dcb17688b8fcb471319",
	name: "fetchBoxBoard",
	filename: "src/lib/nfl/box-score.ts"
}, (opts) => fetchBoxBoard.__executeServer(opts));
var fetchBoxBoard = createServerFn({ method: "GET" }).handler(fetchBoxBoard_createServerFn_handler, async () => {
	const { pullBoxBoard } = await import("./box-score.server-CanVJ6fj.mjs");
	return pullBoxBoard();
});
//#endregion
export { fetchBoxBoard_createServerFn_handler };
