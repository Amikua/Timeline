import { type Prisma } from "@prisma/client";
import { getProjectEvents } from "./actions";
import { Timeline } from "./Timeline";

export type EventAndAuthor = Prisma.ProjectEventGetPayload<{
  include: {
    author: true;
  };
}>;


export async function TimelineWrapper({
  projectId,
  selectedDate,
}: {
  projectId: string;
  selectedDate: string | undefined;
}) {
  const response = await getProjectEvents({
    projectId,
  });

  const events = response.data!.events!;


  return (
    <Timeline
      projectId={projectId}
      selectedDateFromSearchParams={selectedDate}
      events={events}
    />
  );
}
