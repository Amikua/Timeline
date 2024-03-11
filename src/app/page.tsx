import { validateRequest } from "~/lib/auth";
import { redirect } from "next/navigation";
import { GithubLoginButton } from "~/components/custom/GithubLoginButton";

export default async function Page() {
	const { user } = await validateRequest();
	if (user) {
		return redirect("/dashboard");
	}
	return (
		<div className="w-full min-h-screen text-white flex flex-col justify-center items-center">
			<GithubLoginButton />
		</div>
	);
}
