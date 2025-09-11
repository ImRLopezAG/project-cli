"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@tanstack/react-router";
import { Key, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { $auth } from "~lib/$auth";
import { Button } from "~ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~ui/form";
import { Input } from "~ui/input";

const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(6).max(100),
});

export function SignIn() {
	const router = useRouter();
	const form = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});
	const [loading, startTransition] = useTransition();
	return (
		<Card className="max-w-md">
			<CardHeader>
				<CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
				<CardDescription className="text-muted-foreground text-xs md:text-sm">
					Enter your email below to login to your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={form.handleSubmit(async (data) => {
						startTransition(async () => {
							const { data: session } = await $auth.signIn.email(data, {
								callbackURL: "/",
								onSuccess: () => {
									toast.success("Logged in successfully");
								},
								onError: ({ error }) => {
									console.log("Login error:", error);
									toast.error(error.message);
								},
							});
							if (session) router.invalidate();
						});
					})}
					className="space-y-4"
				>
					<Form {...form}>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-primary">Email</FormLabel>
									<FormControl>
										<Input
											placeholder="m@example.com"
											className="placeholder:text-muted-foreground"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel className="text-primary">Password</FormLabel>
										<Link to="/" className="text-sm underline">
											Forgot your password?
										</Link>
									</div>
									<FormControl>
										<Input
											type="password"
											placeholder="······"
											className="placeholder:text-muted-foreground"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-full"
							disabled={loading || !form.formState.isValid}
						>
							{loading ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								<p>Login</p>
							)}
						</Button>
					</Form>
				</form>

				<Button
					variant="secondary"
					disabled={loading}
					className="mt-4 w-full gap-2"
					onClick={async () => {
						const email = form.getValues("email");
						if (!email) {
							toast.error("Please enter your email first");
							return;
						}
						startTransition(async () => {
							await $auth.signIn.passkey({
								email,
								autoFill: true,
							});
						});
					}}
				>
					<Key size={16} />
					Sign-in with Passkey
				</Button>
			</CardContent>
			<CardFooter>
				<div className="flex w-full justify-center border-t py-4">
					<p className="text-center text-neutral-500 text-xs">
						Don't have an account?{" "}
						<Link
							to="/sign-up"
							className="text-sm underline hover:text-primary"
						>
							Sign up
						</Link>
					</p>
				</div>
			</CardFooter>
		</Card>
	);
}
