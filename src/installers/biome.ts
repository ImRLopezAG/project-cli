import path from "node:path";
import fs from "fs-extra";

import { PKG_ROOT, CONFIG_ROOT } from "~/consts";
import type { Installer } from "~/installers";
import { addPackageDependency } from "~/utils/addPackageDependency";
import { addPackageScript } from "~/utils/addPackageScript";

export const biomeInstaller: Installer = ({ projectDir }) => {
	addPackageDependency({
		projectDir,
		dependencies: ["@biomejs/biome"],
		devMode: true,
	});

	const biomeConfigSrc = path.join(CONFIG_ROOT, "config/biome.jsonc");
	const biomeConfigDest = path.join(projectDir, "biome.json");

	fs.copySync(biomeConfigSrc, biomeConfigDest);

	addPackageScript({
		projectDir,
		scripts: {
			lint: "biome check --write --unsafe .",
			"check:unsafe": "biome check --write --unsafe .",
			"check:write": "biome check --write .",
			check: "biome check .",
		},
	});
};
