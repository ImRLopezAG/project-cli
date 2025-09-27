"use client";
import { useSession } from "~lib/$auth";
import {
	createContext,
	type PropsWithChildren,
	useSyncExternalStore,
} from "react";

type AuthenticationState = ReturnType<typeof useSession.get>;

export const AuthContext = createContext<AuthenticationState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
	const auth = useSyncExternalStore(
		useSession.subscribe,
		useSession.get,
		useSession.get
	);
	return <AuthContext value={auth}>{children}</AuthContext>;
}
