import { db } from "~/server/db";
import Image from "next/image";

export async function PrintEventsView({ projectId }: { projectId: string }) {
  const allEvents = await db.projectEvent.findMany({
    where: { Project: { id: projectId } },
    orderBy: { happendAt: "desc" },
    include: { author: true },
  });
  return (
    <div className="flex flex-col items-center gap-4 print:bg-white print:text-black ">
      {allEvents.map((event) => (
        <div
          key={event.id}
          className="flex h-full max-h-full w-4/5 max-w-[34rem] flex-col gap-2 rounded-xl border border-secondary px-6 py-2 shadow-md shadow-secondary xl:w-3/5 print:break-inside-avoid"
        >
          <div className="flex w-full gap-4 border-b border-secondary py-4">
            <Image
              src={event.author.avatarUrl}
              alt="avatar"
              width={48}
              height={48}
              className="mr-4 h-12 w-12 rounded-full"
            />
            <div>
              <div className="flex w-full items-center gap-2">
                <h1>{event.author.username}</h1>
                <h3 className="text-sm">{event.happendAt.toLocaleString()}</h3>
              </div>
              <h2>{event.author.email}</h2>
            </div>
          </div>
          <p className="break-words">{event.content}</p>
        </div>
      ))}
    </div>
  );
}
