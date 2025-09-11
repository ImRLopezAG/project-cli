"use client";
import { useSession } from "~lib/$auth";
import {
	createContext,
	type PropsWithChildren,
	useEffect,
	useState,
} from "react";

type AuthenticationState = ReturnType<typeof useSession.get>;

export const AuthContext = createContext<AuthenticationState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
	const [auth, setAuth] = useState(useSession.get());
	useEffect(() => {
		useSession.subscribe(setAuth);
		return () => useSession.off();
	}, []);
	return <AuthContext value={auth}>{children}</AuthContext>;
}
