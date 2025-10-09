"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@tanstack/react-router";
import { Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { signUp } from "~lib/$auth";
import { Button } from "~ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~ui/form";
import { Input } from "~ui/input";

const signUpSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		email: z.email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		passwordConfirmation: z
			.string()
			.min(6, "Password confirmation must be at least 6 characters"),
		image: z.any().optional(),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "Passwords must match",
		path: ["passwordConfirmation"],
	});

export function SignUp() {
	const router = useRouter();
	const [loading, startTransition] = useTransition();
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const form = useForm({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			passwordConfirmation: "",
			image: null,
		},
	});

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			form.setValue("image", file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<Card className="z-50 max-w-md">
			<CardHeader>
				<CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
				<CardDescription className="text-xs md:text-sm">
					Enter your information to create an account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(async (data) => {
							startTransition(async () => {
								await signUp.email(
									{
										email: data.email,
										password: data.password,
										name: `${data.firstName} ${data.lastName}`,
										image: data.image
											? await convertImageToBase64(data.image)
											: "",
										callbackURL: "/",
									},
									{
										onError: ({ error }) => {
											toast.error(error.message);
										},
										onSuccess: async () => {
											toast.success(
												"Account created successfully. Please check your email to verify your account.",
											);
											router.invalidate();
										},
									},
								);
							});
						})}
						className="grid gap-4"
					>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First name</FormLabel>
										<FormControl>
											<Input placeholder="Max" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last name</FormLabel>
										<FormControl>
											<Input placeholder="Robinson" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="m@example.com" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="Password" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="passwordConfirmation"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="Confirm Password"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="image"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Profile Image (optional)</FormLabel>
									<div className="flex items-stretch gap-4">
										{imagePreview && (
											<div className="relative size-24 overflow-hidden rounded-sm">
												<img src={imagePreview} alt="Profile preview" />
											</div>
										)}
										<div className="flex w-full items-center gap-2">
											<Input
												type="file"
												accept="image/*"
												onChange={handleImageChange}
												className="w-full"
											/>
											{imagePreview && (
												<X
													className="cursor-pointer"
													onClick={() => {
														form.setValue("image", null);
														setImagePreview(null);
													}}
												/>
											)}
										</div>
									</div>
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								"Create an account"
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
			<CardFooter>
				<div className="flex w-full justify-center border-t py-4">
					<p className="text-center text-neutral-500 text-xs">
						Already have an account?{" "}
						<Link
							to="/sign-in"
							className="text-sm underline hover:text-primary"
						>
							Sign in
						</Link>
					</p>
				</div>
			</CardFooter>
		</Card>
	);
}

async function convertImageToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}
