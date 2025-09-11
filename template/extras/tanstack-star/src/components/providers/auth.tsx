"use client";
import { createContext, use, useEffect, useState } from "react";
import { useSession } from "~lib/$auth";

type AuthenticationState = ReturnType<typeof useSession.get>;

export const AuthContext = createContext<AuthenticationState | null>(null);

export function AuthProvider({ children }: Props) {
	const [auth, setAuth] = useState(useSession.get());
	useEffect(() => {
		useSession.subscribe(setAuth);
		return () => useSession.off();
	}, []);
	return <AuthContext value={auth}>{children}</AuthContext>;
}

export const useAuth = () => {
	const context = use(AuthContext);
	if (!context) throw new Error("useAuth must be used within an AuthProvider");
	if (!context.data) return null;
	return context.data;
};
