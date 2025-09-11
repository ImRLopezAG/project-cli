import path from "node:path";
import fs from "fs-extra";

import { extraDir } from "~/consts.js";
import type { InstallerOptions } from "~/installers";

type SelectBoilerplateProps = Required<
	Pick<InstallerOptions, "packages" | "projectDir" | "framework">
>;

// Similar to _app, but for app router
export const selectLayoutFile = ({ projectDir, framework }: SelectBoilerplateProps) => {
	const layoutFileDir = path.join(extraDir(framework), "src/app/");

	const appSrc = path.join(layoutFileDir, "layout.tsx");
	const appDest = path.join(projectDir, "src/app/layout.tsx");
	fs.copySync(appSrc, appDest);
};

// This selects the proper index.tsx to be used that showcases the chosen tech

// Similar to index, but for app router
export const selectPageFile = ({
	projectDir,
	packages,
	framework
}: SelectBoilerplateProps) => {
	const indexFileDir = path.join(extraDir(framework), "src/app");

	const indexSrc = path.join(indexFileDir, "page.tsx");
	const indexDest = path.join(projectDir, "src/app/page.tsx");
	fs.copySync(indexSrc, indexDest);

	if (packages?.["better-auth"].inUse) {
		const authRouteSrc = path.join(indexFileDir, "(unauth)");
		const authRouteDest = path.join(projectDir, "src/app/(unauth)");
		fs.copySync(authRouteSrc, authRouteDest);
	}
};

export const selectComponentFile = ({
	projectDir,
	packages,
	framework
}: SelectBoilerplateProps) => {
	const componentsDir = path.join(extraDir(framework), "src/components/");

	const uiComponentSrc = path.join(componentsDir, "ui");
	const uiComponentDest = path.join(projectDir, "src/components/ui");
	fs.copySync(uiComponentSrc, uiComponentDest);

	const providersDir = path.join(componentsDir, "providers");
	const providersDest = path.join(projectDir, "src/components/providers");

	fs.ensureDirSync(providersDest);
	const providersFileContent = createProvidersFile({
		auth: packages?.["better-auth"]?.inUse ?? false,
		trpc: packages?.trpc?.inUse ?? false,
	});
	fs.writeFileSync(path.join(providersDest, "index.tsx"), providersFileContent);
	fs.copySync(
		path.join(providersDir, "theme.tsx"),
		path.join(providersDest, "theme.tsx"),
	);
	if (packages?.["better-auth"].inUse) {
		fs.copySync(
			path.join(providersDir, "auth.tsx"),
			path.join(providersDest, "auth.tsx"),
		);
		const authComponentSrc = path.join(componentsDir, "auth");
		const authComponentDest = path.join(projectDir, "src/components/auth");
		fs.copySync(authComponentSrc, authComponentDest);
	}
};

interface ProviderConfig {
	auth: boolean;
	trpc: boolean;
}

function createProvidersFile(config: ProviderConfig): string {
	const imports: string[] = [
		`import { Toaster } from "~ui/sonner";`,
		`import type { PropsWithChildren } from "react";`,
		`import { ThemeProvider } from "./theme";`,
	];

	const wrappers: Array<{ open: string; close: string }> = [
		{
			open: `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`,
			close: `</ThemeProvider>`,
		},
	];

	// Conditionally add providers based on config
	if (config.trpc) {
		imports.push(`import { TRPCReactProvider } from '~lib/trpc/react';`);
		wrappers.unshift({
			open: `<TRPCReactProvider>`,
			close: `</TRPCReactProvider>`,
		});
	}

	if (config.auth) {
		imports.push(`import { AuthProvider } from "./auth";`);
		wrappers.splice(config.trpc ? 1 : 0, 0, {
			open: `<AuthProvider>`,
			close: `</AuthProvider>`,
		});
	}

	const openTags = wrappers.map((w) => w.open).join("\n\t\t\t");
	const closeTags = wrappers
		.map((w) => w.close)
		.reverse()
		.join("\n\t\t\t");

	return `${imports.join("\n")}

export function Providers({ children }: PropsWithChildren) {
	return (
		${openTags}
			{children}
			<Toaster richColors position="top-center" />
		${closeTags}
	);
}`;
}
