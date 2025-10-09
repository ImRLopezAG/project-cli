import path from "node:path";
import fs from "fs-extra";

import { extraDir } from "~/consts.js";
import type { InstallerOptions } from "~/installers";

type SelectBoilerplateProps = Required<
	Pick<InstallerOptions, "packages" | "projectDir" | "framework">
>;

export const selectRouterFileDeskTop = ({
	projectDir,
	framework,
	packages,
}: SelectBoilerplateProps) => {
	const srcDirectory = path.join(extraDir(framework));
	const appSrc = path.join(srcDirectory, "app");

	const genFileSrc = path.join(srcDirectory, "routeTree.gen.ts");
	const genFileDest = path.join(projectDir, "src/renderer/routeTree.gen.ts");
	fs.copySync(genFileSrc, genFileDest);

	if (packages?.["better-auth"].inUse) {
		const authRouter = path.join(srcDirectory, "with-auth-router.tsx");
		const authRouteDest = path.join(projectDir, "src/renderer/router.tsx");
		fs.copySync(authRouter, authRouteDest);

		const withAuthRoot = path.join(appSrc, "with-auth-root.tsx");
		const withAuthRootDest = path.join(projectDir, "src/renderer/app/__root.tsx");
		fs.copySync(withAuthRoot, withAuthRootDest);
	} else {
		const noAuthRouter = path.join(srcDirectory, "router.tsx");
		const noAuthRouteDest = path.join(projectDir, "src/renderer/router.tsx");
		fs.copySync(noAuthRouter, noAuthRouteDest);

		const noAuthRoot = path.join(appSrc, "root.tsx");
		const noAuthRootDest = path.join(projectDir, "src/renderer/app/__root.tsx");
		fs.copySync(noAuthRoot, noAuthRootDest);
	}
};

export const selectRouteFileDesktop = ({
	projectDir,
	packages,
	framework,
}: SelectBoilerplateProps) => {
	const indexFileDir = path.join(extraDir(framework), "app");

	if (packages?.["better-auth"].inUse) {
		const authRouteSrc = path.join(indexFileDir, "_auth");
		const authRouteDest = path.join(projectDir, "src/renderer/app/_auth");
		fs.copySync(authRouteSrc, authRouteDest);

		const unauthRouteSrc = path.join(indexFileDir, "_unauth");
		const unauthRouteDest = path.join(projectDir, "src/renderer/app/_unauth");
		fs.copySync(unauthRouteSrc, unauthRouteDest);
	} else {
		const indexSrc = path.join(indexFileDir, "_auth/index.tsx");
		const indexDest = path.join(projectDir, "src/renderer/app/index.tsx");
		fs.copySync(indexSrc, indexDest);
	}
};

export const selectComponentFileRoutesDesktop = ({
	projectDir,
	packages,
	framework
}: SelectBoilerplateProps) => {
	const componentsDir = path.join(extraDir(framework), "components/");

	const uiComponentSrc = path.join(componentsDir, "ui");
	const uiComponentDest = path.join(projectDir, "src/renderer/components/ui");
	fs.copySync(uiComponentSrc, uiComponentDest);

	const hooksSrc = path.join(extraDir(framework), "hooks");
	const hooksDest = path.join(projectDir, "src/renderer/hooks");
	fs.copySync(hooksSrc, hooksDest);

	const loaderComponentSrc = path.join(componentsDir, "loader.tsx");
	const loaderComponentDest = path.join(projectDir, "src/renderer/components/loader.tsx");
	fs.copySync(loaderComponentSrc, loaderComponentDest);
	
	const versionsComponentSrc = path.join(componentsDir, "versions.tsx");
	const versionsComponentDest = path.join(projectDir, "src/renderer/components/versions.tsx");
	fs.copySync(versionsComponentSrc, versionsComponentDest);

	const providersDir = path.join(componentsDir, "providers");
	const providersDest = path.join(projectDir, "src/renderer/components/providers");

	fs.ensureDirSync(providersDest);
	const providersFileContent = createProvidersFile({
		auth: packages?.["better-auth"]?.inUse ?? false,
		trpc: packages?.trpc?.inUse ?? false,
		i18n: packages?.fbtee?.inUse ?? false,
	});
	fs.writeFileSync(path.join(providersDest, "index.tsx"), providersFileContent);
	fs.copySync(
		path.join(providersDir, "theme"),
		path.join(providersDest, "theme"),
	);
	if (packages?.["better-auth"].inUse) {
		fs.copySync(
			path.join(providersDir, "auth.tsx"),
			path.join(providersDest, "auth.tsx"),
		);
		const authComponentSrc = path.join(componentsDir, "auth");
		const authComponentDest = path.join(projectDir, "src/renderer/components/auth");
		fs.copySync(authComponentSrc, authComponentDest);
	}
};

interface ProviderConfig {
	auth: boolean;
	trpc: boolean;
	i18n: boolean;
}

function createProvidersFile(config: ProviderConfig): string {
	const imports: string[] = [
		`import { Toaster } from "~ui/sonner";`,
		`import type { PropsWithChildren } from "react";`,
		`import { ThemeProvider } from "./theme";`,
		`import { LocaleProvider } from './locale' \n import esES from './locale/i18n/es_ES.json'`
	];

	const wrappers: Array<{ open: string; close: string }> = [
		{
			open: `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`,
			close: `</ThemeProvider>`,
		},
	];

	if (config.i18n) {
		imports.push(`import { LocaleProvider } from './locale' \n import esES from './locale/i18n/es_ES.json'`);
		wrappers.splice(1, 0, {
			open: `<LocaleProvider availableLanguages={availableLanguages}
				loadLocale={loadLocale}
				translations={{ en_US: {}, es_ES: esES.es_ES ?? {} }}>`,
			close: `</LocaleProvider>`,
		});
	}

	if (config.auth) {
		imports.push(`import { AuthProvider } from "./auth";`);
		wrappers.splice(config.trpc ? 1 : 0, 0, {
			open: `<AuthProvider>`,
			close: `</AuthProvider>`,
		});
	}

	const localeConfig = `
	const availableLanguages = new Map([
	['en_US', 'English'],
	['es_ES', 'Español'],
])

const loadLocale = async (locale: string) => {
	switch (locale) {
		case 'es_ES':
			return esES.es_ES ?? {}
		default:
			return {}
	}
}
`;

	const openTags = wrappers.map((w) => w.open).join("\n\t\t\t");
	const closeTags = wrappers
		.map((w) => w.close)
		.reverse()
		.join("\n\t\t\t");

	return `${imports.join("\n")}
${config.i18n ? localeConfig : ""}
export function Providers({ children }: PropsWithChildren) {
	return (
		${openTags}
			{children}
			<Toaster richColors position="top-center" />
		${closeTags}
	);
}`;
}
