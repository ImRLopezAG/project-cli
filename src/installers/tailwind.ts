import path from "node:path";
import fs from "fs-extra";

import { extraDir, CONFIG_ROOT } from "~/consts";
import type { Installer } from "~/installers/index";
import { addPackageDependency } from "~/utils/addPackageDependency";

export const tailwindInstallerNext: Installer = ({ projectDir, framework }) => {
	addPackageDependency({
		projectDir,
		dependencies: ["tailwindcss", "postcss", "@tailwindcss/postcss"],
		devMode: true,
	});

	const extrasDir = extraDir(framework);

	const postcssCfgSrc = path.join(CONFIG_ROOT, "config/postcss.config.js");
	const postcssCfgDest = path.join(projectDir, "postcss.config.js");

	const cssSrc = path.join(extrasDir, "src/app/globals.css");
	const cssDest = path.join(projectDir, "src/app/globals.css");

	fs.copySync(postcssCfgSrc, postcssCfgDest);
	fs.copySync(cssSrc, cssDest);
};
export const tailwindInstallerTTS: Installer = ({ projectDir, framework }) => {
	addPackageDependency({
		projectDir,
		dependencies: ["tailwindcss", "@tailwindcss/vite"],
		devMode: true,
	});

	const extrasDir = extraDir(framework);

	const cssSrc = path.join(extrasDir, "src/app/index.css");
	const cssDest = path.join(projectDir, "src/app/index.css");

	fs.copySync(cssSrc, cssDest);
};
