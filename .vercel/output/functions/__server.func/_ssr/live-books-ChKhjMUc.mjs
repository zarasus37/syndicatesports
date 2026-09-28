import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-books-ChKhjMUc.js
var fetchLiveBoard_createServerFn_handler = createServerRpc({
	id: "a3140ae237bc8a6cd55c40b596a90b17aea32d83d4ec9f4ffe65f064ee30eab9",
	name: "fetchLiveBoard",
	filename: "src/lib/nfl/live-books.ts"
}, (opts) => fetchLiveBoard.__executeServer(opts));
var fetchLiveBoard = createServerFn({ method: "GET" }).handler(fetchLiveBoard_createServerFn_handler, async () => {
	const { pullLiveBoard } = await import("./live-books.server-BzhOKEgp.mjs");
	return pullLiveBoard();
});
//#endregion
export { fetchLiveBoard_createServerFn_handler };
