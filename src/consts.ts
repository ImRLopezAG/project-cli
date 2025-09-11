import path from "node:path";
import { fileURLToPath } from "node:url";

// With the move to TSUP as a build tool, this keeps path routes in other files (installers, loaders, etc) in check more easily.
// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");
export const CONFIG_ROOT = path.join(PKG_ROOT, "template/extras")
export const extraDir = (framework: string) => path.join(CONFIG_ROOT, framework);

//export const PKG_ROOT = path.dirname(require.main.filename);

export const TITLE_TEXT = `  ___ __  __ ____  _     ___  ____  _____ ____
 |_ _|  \\/  |  _ \\| |   / _ \\|  _ \\| ____|__  /
  | || |\\/| | |_) | |  | | | | |_) |  _|   / /
  | || |  | |  _ <| |__| |_| |  __/| |___ / /_
 |___|_|  |_|_| \\_\\\\____\\___/|_|   |_____/____|
`;
export const DEFAULT_APP_NAME = "my-fast-app";
export const BASE_CLI_NAME = "IMR-Project CLI";

export const PROVIDERS_NAME = {
	sqlite: "with-sqlite",
	postgres: "with-pg",
};
