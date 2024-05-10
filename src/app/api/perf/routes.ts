import { getProjectEvents } from "~/components/custom/actions";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const projectId = "96047d0b-469e-483b-a1f2-6b231cf153dc";
  const events = await getProjectEvents({
    projectId,
    offset: 0,
  });
  return new Response(JSON.stringify(events), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
