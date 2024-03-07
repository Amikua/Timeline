import { validateRequest } from "~/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "~/_components/Sidebar"

export default async function Page() {
	const { user } = await validateRequest();
	if (!user) {
		return redirect("/login");
	}
	return (
		<>
			<Sidebar />
		</>
	);
}

