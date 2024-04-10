import { useEffect, useRef, useCallback } from "react";
import { AddEventToProject } from "./AddEventToProject";
import { type EventAndAuthor } from "~/app/dashboard/[projectId]/page";
import {
  elementScroll,
  useVirtualizer,
  type VirtualizerOptions,
} from "@tanstack/react-virtual";
import { getProjectEvents } from "./actions";
import { removeEventFromProject } from "./actions";
// import Image from "next/image";
import { categoryEmotes } from "./AddCategoryToPost";

function RemoveEventButton({
  projectId,
  eventId,
  userId,
  events,
  setEvents,
  isActive,
}: {
  projectId: string;
  eventId: string;
  userId: string;
  events: EventAndAuthor[];
  setEvents: (events: EventAndAuthor[]) => void;
  isActive: boolean;
}) {
  if (userId !== events.find((event) => event.id === eventId)?.author.id)
    return null;
  return (
    <button
      disabled={!isActive}
      onClick={async () => {
        try {
          const it = await removeEventFromProject({ projectId, eventId });
          if (!it?.data?.error) {
            setEvents(events.filter((event) => event.id !== eventId));
          }
        } catch (error) {
          console.error("Error removing event", error);
        }
      }}
      className="ml-auto disabled:hidden"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="red"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}

export function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
}
const estimatedSize = 280;

export function ProjectEventsView({
  events,
  setEvents,
  projectId,
  setCurrenctDate,
  scrollToIndex,
  setScrollToIndex,
  withoutAutoScroll,
  setWithoutAutoScroll,
  hasMore,
  setHasMore,
  isFetchingNextPage,
  setIsFetchingNextPage,
  userId,
  isActive,
}: {
  events: EventAndAuthor[];
  setEvents: (events: EventAndAuthor[]) => void;
  projectId: string;
  setCurrenctDate: (date: string) => void;
  scrollToIndex: number | null;
  setScrollToIndex: (index: number | null) => void;
  withoutAutoScroll: boolean;
  setWithoutAutoScroll: (firstScroll: boolean) => void;
  hasMore: boolean;
  setHasMore: (hasMore: boolean) => void;
  isFetchingNextPage: boolean;
  setIsFetchingNextPage: (isFetchingNextPage: boolean) => void;
  userId: string;
  isActive: boolean;
}) {
  const scrollingRef = useRef<number>();

  const scrollToFn: VirtualizerOptions<
    HTMLDivElement,
    HTMLDivElement
  >["scrollToFn"] = useCallback((offset, canSmooth, instance) => {
    const duration = 1000;
    if (!parentRef.current) return;
    const start = parentRef.current.scrollTop;
    const startTime = (scrollingRef.current = Date.now());

    const run = () => {
      if (scrollingRef.current !== startTime) return;
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = easeInOutQuint(Math.min(elapsed / duration, 1));
      const interpolated = start + (offset - start) * progress;

      if (elapsed < duration) {
        elementScroll(interpolated, canSmooth, instance);
        requestAnimationFrame(run);
      } else {
        elementScroll(interpolated, canSmooth, instance);
        setWithoutAutoScroll(false);
      }
    };

    requestAnimationFrame(run);
  }, []);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current!,
    estimateSize: () => estimatedSize,
    overscan: 3,
    scrollToFn,
  });

  useEffect(() => {
    if (scrollToIndex !== null) {
      rowVirtualizer.scrollToIndex(scrollToIndex);
      setScrollToIndex(null);
    }
  }, [scrollToIndex, rowVirtualizer, setScrollToIndex]);

  useEffect(() => {
    (async () => {
      const items = rowVirtualizer.getVirtualItems();
      const lastItem = items[items.length - 1];
      const currentlyViewed = items[items.length / 2 - 1];

      if (currentlyViewed && !withoutAutoScroll) {
        const currentEvent = events.at(currentlyViewed.index);
        if (!currentEvent) {
          console.error(
            `This should not happen, index: ${currentlyViewed.index}`,
          );
          return;
        }
        const year = currentEvent.happendAt.getFullYear();
        const month = currentEvent.happendAt.getMonth() + 1;
        const day = currentEvent.happendAt.getDate();
        const date = `${day}-${month}-${year}`;
        setCurrenctDate(date);
      }

      if (!lastItem) {
        return;
      }

      if (
        lastItem.index >= events.length - 1 &&
        !isFetchingNextPage &&
        hasMore &&
        events.length
      ) {
        setIsFetchingNextPage(true);
        try {
          const response = await getProjectEvents({
            projectId,
            offset: events.length,
          });
          const newEvents = response.data!.events!;
          setHasMore(response.data!.hasMore!);
          if (Array.isArray(newEvents)) {
            setEvents([...events, ...newEvents]);
          } else {
            setEvents([...events, newEvents]);
          }
        } catch (error) {
          console.error("Error fetching next page", error);
        }
        setIsFetchingNextPage(false);
      }
    })().catch(console.error);
  }, [
    events.length,
    isFetchingNextPage,
    hasMore,
    projectId,
    withoutAutoScroll,
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <div className="relative flex max-h-[90%] flex-1 items-center justify-center py-16">
      <div className="w flex h-full max-h-full w-4/5 max-w-[34rem] flex-col gap-8 rounded-xl border border-secondary p-6 shadow-md shadow-secondary xl:w-3/5 bg-background">
        <div className="flex justify-between break-words rounded-xl px-8">
          <div className="my-auto">
            <h1>Project events</h1>
          </div>
          <AddEventToProject
            projectId={projectId}
            events={events}
            setEvents={setEvents}
            isActive={isActive}
          />
        </div>
        <div
          ref={parentRef}
          className="h-full overflow-y-auto scrollbar scrollbar-track-background scrollbar-thumb-primary"
        >
          <main
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
            className="relative mx-auto w-11/12"
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const event = events.at(virtualItem.index)!;
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    height: `${virtualItem.size - 10}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="absolute left-0 top-0 flex w-full flex-col gap-8 rounded-xl p-4 shadow-md shadow-muted"
                >
                  <div className="flex w-full gap-4 border-b border-secondary py-4">
                    <div className="h-12 w-12 rounded-full text-4xl">
                      {categoryEmotes[event.category].emoji}
                    </div>
                    {/* <Image
                      src={event.author.avatarUrl}
                      alt="avatar"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full"
                    /> */}
                    <div className="w-full">
                      <div className="flex w-full items-center gap-2">
                        <h1>{event.author.username}</h1>
                        <h3 className="text-sm font-thin text-secondary-foreground">
                          {event.happendAt.toLocaleString()}
                        </h3>
                        <RemoveEventButton
                          isActive={isActive}
                          userId={userId}
                          eventId={event.id}
                          projectId={projectId}
                          setEvents={setEvents}
                          events={events}
                        />
                      </div>
                      <h2>{event.author.email}</h2>
                    </div>
                  </div>
                  <p className="break-words">{event.content}</p>
                </div>
              );
            })}
          </main>
        </div>
      </div>
    </div>
  );
}
