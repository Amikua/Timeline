import { env } from "~/env";
import { readEmails } from "~/lib/mail";

export async function GET(): Promise<Response> {
  console.log("GET /api/read-emails")
  if (!env.GMAIL_USERNAME || !env.GMAIL_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_PASSWORD not found in env");
    return new Response(null, {
      status: 500,
      statusText: "Email integration not configured."
    });
  }

  try {
    await readEmails(env.GMAIL_USERNAME, env.GMAIL_PASSWORD);
    return new Response(null, {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return new Response(null, {
        status: 500,
        statusText: `Internal Server Error: ${error.message}`,
      });
    }
    return new Response(null, {
      status: 500,
      statusText: `Internal Server Error: unknown error`,
    });
  }
}
