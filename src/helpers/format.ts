import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";

import type { PackageManager } from "~/utils/getUserPkgManager";
import { logger } from "~/utils/logger";

// Runs format and lint command to ensure created repository is tidy upon creation
export const formatProject = async ({
	pkgManager,
	projectDir,
	biome,
}: {
	pkgManager: PackageManager;
	projectDir: string;
	biome: boolean;
}) => {
	logger.info(`Formatting project with ${biome ? "prettier" : "biome"}...`);
	const spinner = ora("Running format command\n").start();

	if (biome) {
		await execa(pkgManager, ["run", "lint"], {
			cwd: projectDir,
		});
	}
	spinner.succeed(`${chalk.green("Successfully formatted project")}`);
};
