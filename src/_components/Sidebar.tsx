import { lucia, validateRequest } from "~/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation"

function SettingsIcon(props: Record<string, string>) {
	return (
		<form action={logout}>
			<button>
				<svg xmlns="http://www.w3.org/2000/svg" className="text-white size-12"><path fill="currentColor" d="M5.615 20q-.69 0-1.152-.462Q4 19.075 4 18.385V5.615q0-.69.463-1.152Q4.925 4 5.615 4h6.404v1H5.615q-.23 0-.423.192Q5 5.385 5 5.615v12.77q0 .23.192.423q.193.192.423.192h6.404v1zm10.847-4.462l-.702-.719l2.319-2.319H9.192v-1h8.887l-2.32-2.32l.703-.718L20 12z" /></svg> </button>
		</form>
	)
}


export default async function Sidebar() {
	const { user } = await validateRequest()
	if (!user) {
		redirect("/login")
	}
	const project = ["A", "B", "C"]

	return (
		<nav className="fixed h-screen w-96 border-r border-stone-800">
			<div className="px-6 py-12">
				<div className="flex pl-4 place-content-between">
					<div className="flex gap-2">
						<img className="size-8 rounded-2xl" src={user.avatarUrl} />
						<div>
							<h1 className="text-white">Welcome {user.username}</h1>
						</div>
					</div>
					<SettingsIcon />
				</div>
				<main className="space-y-4">
					{project.map((it, i) =>
						<div key={i} className="flex pl-4 items-center gap-4 py-4 bg-zinc-900 rounded-lg">
							<div className="flex items-center justify-center rounded-lg size-12 bg-teal-700">
								<h1 className="text-white text-2xl">{it[0]}</h1>
							</div>
							<h1 className="text-white text-xl">Project {it}</h1>
						</div>
					)}
				</main>

			</div>
		</nav>
	)
}

async function logout(): Promise<ActionResult> {
	"use server";
	const { session } = await validateRequest();
	if (!session) {
		return {
			error: "Unauthorized"
		};
	}

	await lucia.invalidateSession(session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	return redirect("/login");
}

interface ActionResult {
	error: string | null;
}
