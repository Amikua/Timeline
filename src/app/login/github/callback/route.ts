import { github, lucia } from "~/lib/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { z } from 'zod'
import { db } from "~/server/db";

const githubUserValidation = z.object({
	login: z.string(),
	id: z.number(),
	avatar_url: z.string(),
	email: z.string().nullable(),
});

const githubUserEmailsSchema = z.array(z.object({
	email: z.string(),
	primary: z.boolean(),
}))

async function getEmail(accessToken: string) {
	const response = await fetch("https://api.github.com/user/emails", {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	const emails = githubUserEmailsSchema.parse(await response.json());
	const primaryEmail = emails.find(email => email.primary);
	return primaryEmail?.email ?? emails[0]!.email;
}


export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = cookies().get("github_oauth_state")?.value ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});


		const githubUser = githubUserValidation.parse(await githubUserResponse.json());
		const email = githubUser.email ?? await getEmail(tokens.accessToken);


		const existingUser = await db.user.findFirst({
			where: {
				githubId: githubUser.id
			}
		})

		if (existingUser) {
			await db.user.update({
				where: {
					id: existingUser.id
				},
				data: {
					avatarUrl: githubUser.avatar_url,
					email,
					username: githubUser.login
				}
			})
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/dashboard"
				}
			});
		}

		const { id } = await db.user.create({
			data: {
				githubId: githubUser.id,
				avatarUrl: githubUser.avatar_url,
				email,
				username: githubUser.login
			}
		})
		const session = await lucia.createSession(id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/dashboard"
			}
		});
	} catch (e) {
		console.error(e)
		if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}

// interface GitHubUser {
// 	login: string;
// 	id: number;
// 	node_id: string;
// 	avatar_url: string;
// 	gravatar_id: string;
// 	url: string;
// 	html_url?: string;
// 	followers_url: string;
// 	following_url: string;
// 	gists_url: string;
// 	starred_url: string;
// 	subscriptions_url: string;
// 	organizations_url: string;
// 	repos_url: string;
// 	events_url: string;
// 	received_events_url: string;
// 	type: string;
// 	site_admin: boolean;
// 	name?: string;
// 	company?: string;
// 	blog?: string;
// 	location?: string;
// 	email?: string;
// 	hireable?: boolean;
// 	bio?: string;
// 	twitter_username?: string;
// 	public_repos: number;
// 	public_gists: number;
// 	followers: number;
// 	following: number;
// 	created_at: string;
// 	updated_at: string;
// }
