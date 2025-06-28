import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";

export const Route = createFileRoute("/")({component: Index});

function Index() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			<div className="text-center space-y-6">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-white">
					Welcome to Acme Inc.
				</h1>
				<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
					Shadcn + Tailwind + Tanstack Router Demo
				</p>
				<div className="space-y-4">
					<Link to="/login">
						<Button size="lg" className="px-8 py-3 text-lg">
							Get Started - Login
						</Button>
					</Link>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Click the button above to access the dashboard
					</p>
				</div>
			</div>
		</div>
	);
}
