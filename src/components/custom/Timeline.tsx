import { type Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { AddEventToProject } from "./AddEventToProject";

export type EventAndAuthor = Prisma.ProjectEventGetPayload<{
  include: {
    author: true;
  };
}>;

export async function Timeline({
  projectId,
  selectedDate: selectedDateFromSearchParams,
}: {
  projectId: string;
  selectedDate: string | undefined;
}) {
  const project = await db.project.findFirst({
    where: {
      id: projectId,
    },
    include: {
      events: {
        include: {
          author: true,
        },
      },
    },
  });

  if (!project) {
    return redirect("/dashboard");
  }

  const eventsGroupByDay = project.events.reduce(
    (acc, event) => {
      const day = event.createdAt.getDate();
      const month = event.createdAt.getMonth();
      const year = event.createdAt.getFullYear();
      const key = `${day}-${month}-${year}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key]!.push(event);
      return acc;
    },
    {} as Record<string, EventAndAuthor[]>,
  );

  // We always have at least one event
  const selectedDate =
    selectedDateFromSearchParams ?? Object.keys(eventsGroupByDay)[0]!;

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex h-[50rem] max-h-[50rem] w-2/5 max-w-[34rem] flex-col gap-8 rounded-xl border border-secondary p-6 shadow-md shadow-secondary">
          <div className="flex justify-between break-words rounded-xl px-2">
            <div className="my-auto">
              <h1> Event for day {selectedDate}</h1>
            </div>
            <AddEventToProject projectId={projectId} />
          </div>
          <main className="flex min-h-0 flex-col gap-4 overflow-y-auto p-6 scrollbar scrollbar-track-background scrollbar-thumb-primary">
            {eventsGroupByDay[selectedDate]?.map((event) => {
              return (
                <div
                  key={event.id}
                  className="flex min-h-52 flex-col gap-4 break-words rounded-xl p-6 shadow-md shadow-muted"
                >
                  <div className="flex gap-4">
                    <img
                      src={event.author.avatarUrl}
                      alt="avatar"
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <h1>{event.author.username}</h1>
                      <h2>{event.author.email}</h2>
                    </div>
                  </div>
                  <p className="pt-2">{event.content}</p>
                </div>
              );
            })}
          </main>
        </div>
      </div>

      <div className="relative flex h-28 min-h-28 gap-4 border-b-2 border-secondary px-8">
        {Object.entries(eventsGroupByDay).map(([date, events]) => {
          return (
            <Link
              href={`/dashboard/${projectId}?date=${date}`}
              key={date}
              className={`style-for-timeline-dot-leg relative size-8 rounded-3xl py-1 text-center shadow-lg before:w-3
            ${selectedDate === date ? "bg-primary shadow-primary after:bg-primary" : "bg-secondary shadow-secondary after:bg-secondary "}
          `}
            >
              {events.length}
            </Link>
          );
        })}
      </div>
    </>
  );
}
