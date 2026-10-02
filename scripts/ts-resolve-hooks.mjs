/**
 * Resolution hook for running the NFL library under `node --test`.
 *
 * `src/lib/nfl/**` imports its siblings extensionless (`from "./bayes"`) the way
 * Vite expects, while Node's ESM resolver needs a real path. Rather than
 * rewriting ~40 source files to carry `.ts` extensions just for tests, this
 * retries a failed relative/absolute specifier with a TypeScript extension.
 *
 * Test-only. Loaded via `--import`, never part of the app bundle.
 */
import { registerHooks } from "node:module";

const EXTENSIONS = [".ts", ".tsx", "/index.ts"];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") || specifier.startsWith("/")) {
      try {
        return nextResolve(specifier, context);
      } catch (err) {
        for (const ext of EXTENSIONS) {
          try {
            return nextResolve(specifier + ext, context);
          } catch {
            /* try the next extension */
          }
        }
        throw err;
      }
    }
    return nextResolve(specifier, context);
  },
});
