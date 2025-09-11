import fs from "node:fs";
import path from "node:path";
import { applyEdits, modify, parse } from "jsonc-parser";

function replaceTextInFiles(
	directoryPath: string,
	search: string,
	replacement: string,
): void {
	const files = fs.readdirSync(directoryPath);

	files.forEach((file) => {
		const filePath = path.join(directoryPath, file);
		if (fs.statSync(filePath).isDirectory()) {
			replaceTextInFiles(filePath, search, replacement);
		} else {
			const data = fs.readFileSync(filePath, "utf8");
			const updatedData = data.replace(new RegExp(search, "g"), replacement);
			fs.writeFileSync(filePath, updatedData, "utf8");
		}
	});
}

function updateTsConfigPaths(projectDir: string, importAlias: string): void {
	const tsConfigPath = path.join(projectDir, "tsconfig.json");

	if (!fs.existsSync(tsConfigPath)) {
		return;
	}

	try {
		const tsConfigContent = fs.readFileSync(tsConfigPath, "utf8");
		const tsConfig = parse(tsConfigContent);

		if (tsConfig?.compilerOptions?.paths) {
			const newPaths: Record<string, string[]> = {};

			// Update each path alias in tsconfig.json
			Object.entries(tsConfig.compilerOptions.paths).forEach(([key, value]) => {
				if (key.startsWith("~/")) {
					const newKey = key.replace(
						"~",
						importAlias.replace(/\*/g, "").replace(/\/$/, ""),
					);
					newPaths[newKey] = value as string[];
				} else {
					newPaths[key] = value as string[];
				}
			});

			// Use modify and applyEdits to preserve comments and formatting
			const edits = modify(
				tsConfigContent,
				["compilerOptions", "paths"],
				newPaths,
				{
					formattingOptions: {
						tabSize: 1,
						insertSpaces: false,
					},
				},
			);

			const updatedContent = applyEdits(tsConfigContent, edits);
			fs.writeFileSync(tsConfigPath, updatedContent, "utf8");
		}
	} catch (error) {
		console.warn(`Warning: Could not update tsconfig.json paths: ${error}`);
	}
}

export const setImportAlias = (projectDir: string, importAlias: string) => {
	const normalizedImportAlias = importAlias
		.replace(/\*/g, "") // remove any wildcards (~/* -> ~/)
		.replace(/[^/]$/, "$&/"); // ensure trailing slash (@ -> ~/)

	// Define all the specific aliases that need to be updated
	const aliasesToReplace = [
		"~/",
		"~lib/",
		"~server/",
		"~components/",
		"~ui/",
		"~hooks/",
	];

	// Update each alias pattern in all files
	aliasesToReplace.forEach((alias) => {
		const newAlias = alias.replace("~", normalizedImportAlias.slice(0, -1)); // Remove trailing slash from normalizedImportAlias and replace ~
		replaceTextInFiles(projectDir, alias, newAlias);
	});

	// Update tsconfig.json paths as well
	updateTsConfigPaths(projectDir, normalizedImportAlias);
};
