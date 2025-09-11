import { useTheme as root } from "~components/providers/theme";

export const useTheme = () => {
	const theme = root();
	return theme;
};
