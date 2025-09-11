import { Toaster } from "~ui/sonner";
import { AuthProvider } from "./auth";
import { ThemeProvider } from "./theme";

export function Providers({ children }: Props) {
	return (
		<AuthProvider>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				{children}
				<Toaster richColors position="top-center" />
			</ThemeProvider>
		</AuthProvider>
	);
}
