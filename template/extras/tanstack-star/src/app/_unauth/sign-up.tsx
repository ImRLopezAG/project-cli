import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "~components/auth/sign-up";

export const Route = createFileRoute("/_unauth/sign-up")({
	component: SignUpPage,
});

export default function SignUpPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div>
					<h2 className="mt-6 text-center font-bold text-3xl text-foreground tracking-tight">
						Sign up for an account
					</h2>
				</div>
				<SignUp />
			</div>
		</div>
	);
}
