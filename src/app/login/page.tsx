import { validateRequest } from "~/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
	const { user } = await validateRequest();
	if (user) {
		return redirect("/");
	}
	return (
		<div className="w-full min-h-screen text-white flex flex-col justify-center items-center">
			<div className="bg-zinc-900 w-48 h-20 flex justify-center items-center rounded-2xl">
				<a href="/login/github" className="text-lg">Sign in with GitHub</a>
			</div>
		</div>
	);
}
