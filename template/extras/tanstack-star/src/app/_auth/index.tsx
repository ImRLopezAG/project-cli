import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "~components/loader";
export const Route = createFileRoute("/_auth/")({
	component: App,
});

function App() {
	return (
		<div className="mb-12 space-y-12">
			<Loader />
		</div>
	);
}
