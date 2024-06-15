import { useEffect, useRef, useCallback } from "react";
import { AddEventToProject } from "./AddEventToProject";
import { type EventAndAuthor } from "~/app/dashboard/[projectId]/page";
import {
  elementScroll,
  useVirtualizer,
  type Virtualizer,
  type VirtualItem,
  type VirtualizerOptions,
} from "@tanstack/react-virtual";
import { getAllProjectEventsWithFilter, getProjectEvents } from "./actions";
import { removeEventFromProject } from "./actions";
import { categoryEmotes } from "./AddCategoryToPost";
import { type Category } from "@prisma/client";
import { EventsFilter } from "./EventsFilter";
import { EditEventButton } from "./EditEventButton";

function RemoveEventButton(props: {
  projectId: string;
  eventId: string;
  userId: string;
  events: EventAndAuthor[];
  setEvents: (events: EventAndAuthor[]) => void;
  isActive: boolean;
}) {
  if (
    props.userId !==
    props.events.find((event) => event.id === props.eventId)?.author.id
  )
    return null;
  return (
    <button
      disabled={!props.isActive}
      onClick={async () => {
        try {
          const it = await removeEventFromProject({
            projectId: props.projectId,
            eventId: props.eventId,
          });
          if (!it?.data?.error) {
            props.setEvents(
              props.events.filter((event) => event.id !== props.eventId),
            );
          }
        } catch (error) {
          console.error("Error removing event", error);
        }
      }}
      className="disabled:hidden"
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

function Header(props: {
  projectName: string;
  filter: Category | "";
  setFilter: (filter: Category | "") => void;
  events: EventAndAuthor[];
  setEvents: (events: EventAndAuthor[]) => void;
  projectId: string;
  isActive: boolean;
}) {
  return (
    <div className="flex max-w-full justify-between gap-2 break-words rounded-xl pl-8 pr-4">
      <div className="my-auto overflow-hidden">
        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-thin">
          {props.projectName} events
        </h1>
      </div>
      <EventsFilter filter={props.filter} setFilter={props.setFilter} />

      <AddEventToProject
        projectId={props.projectId}
        events={props.events}
        setEvents={props.setEvents}
        isActive={props.isActive}
      />
    </div>
  );
}

function Event(props: {
  virtualItem: VirtualItem;
  event: EventAndAuthor;
  isActive: boolean;
  userId: string;
  projectId: string;
  setEvents: (events: EventAndAuthor[]) => void;
  events: EventAndAuthor[];
}) {
  return (
    <div
      style={{
        height: `${props.virtualItem.size - 10}px`,
        transform: `translateY(${props.virtualItem.start}px)`,
      }}
      className="absolute left-0 top-0 flex w-full flex-col gap-8 rounded-xl p-4 shadow-md shadow-muted"
    >
      <div className="flex w-full gap-4 border-b border-secondary py-4">
        <div className="h-12 w-12 rounded-full text-4xl">
          {categoryEmotes[props.event.category].emoji}
        </div>
        <div className="w-full">
          <div className="flex w-full items-center gap-2">
            <h1>{props.event.author.username}</h1>
            <h3 className="text-sm font-thin text-secondary-foreground">
              {props.event.happendAt.toLocaleString()}
            </h3>
            <EditEventButton
              isActive={props.isActive}
              userId={props.userId}
              eventId={props.event.id}
              projectId={props.projectId}
              setEvents={props.setEvents}
              events={props.events}
              event={props.event}
            />
            <RemoveEventButton
              isActive={props.isActive}
              userId={props.userId}
              eventId={props.event.id}
              projectId={props.projectId}
              setEvents={props.setEvents}
              events={props.events}
            />
          </div>
          <h2>{props.event.author.email}</h2>
        </div>
      </div>
      <p className="break-words">{props.event.content}</p>
    </div>
  );
}

function useInfiniteEventScrollWithTimelineAutoScroll({
  scrollToIndex,
  setScrollToIndex,
  withoutAutoScroll,
  filteredEvents,
  filter,
  isFetchingNextPage,
  setIsFetchingNextPage,
  hasMore,
  setHasMore,
  projectId,
  events,
  setEvents,
  setCurrentDate,
  rowVirtualizer,
}: {
  scrollToIndex: number | null;
  setScrollToIndex: (index: number | null) => void;
  withoutAutoScroll: boolean;
  filteredEvents: EventAndAuthor[];
  filter: Category | "";
  isFetchingNextPage: boolean;
  setIsFetchingNextPage: (isFetchingNextPage: boolean) => void;
  hasMore: boolean;
  setHasMore: (hasMore: boolean) => void;
  projectId: string;
  events: EventAndAuthor[];
  setEvents: (events: EventAndAuthor[]) => void;
  setCurrentDate: (date: string) => void;

  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLDivElement>;
}) {
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
        const currentEvent = filteredEvents.at(currentlyViewed.index);
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
        setCurrentDate(date);
      }

      if (!lastItem) {
        return;
      }

      if (
        lastItem.index >= filteredEvents.length - 1 &&
        !isFetchingNextPage &&
        hasMore &&
        filteredEvents.length
      ) {
        setIsFetchingNextPage(true);
        try {
          const response = filter
            ? await getAllProjectEventsWithFilter({
                projectId: projectId,
                filter: filter,
              })
            : await getProjectEvents({
                projectId: projectId,
                offset: events.length,
              });
          const newEvents = response.data!.events!;
          setHasMore(response.data!.hasMore!);
          if (Array.isArray(newEvents)) {
            if (filter) {
              setEvents(newEvents);
            } else {
              setEvents([...events, ...newEvents]);
            }
          } else {
            if (filter) {
              setEvents(newEvents);
            } else {
              setEvents([...events, newEvents]);
            }
          }
        } catch (error) {
          console.error("Error fetching next page", error);
        }
        setIsFetchingNextPage(false);
      }
    })().catch(console.error);
  }, [
    filteredEvents.length,
    filter,
    isFetchingNextPage,
    hasMore,
    projectId,
    withoutAutoScroll,
    rowVirtualizer.getVirtualItems(),
  ]);
}

export function ProjectEventsView(props: {
  events: EventAndAuthor[];
  setEvents: (events: EventAndAuthor[]) => void;
  filter: Category | "";
  setFilter: (filter: Category | "") => void;
  filteredEvents: EventAndAuthor[];
  projectId: string;
  setCurrentDate: (date: string) => void;
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
  projectName: string;
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
        props.setWithoutAutoScroll(false);
      }
    };

    requestAnimationFrame(run);
  }, []);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: props.filteredEvents.length,
    getScrollElement: () => parentRef.current!,
    estimateSize: () => estimatedSize,
    overscan: 3,
    scrollToFn,
  });

  useInfiniteEventScrollWithTimelineAutoScroll({
    scrollToIndex: props.scrollToIndex,
    setScrollToIndex: props.setScrollToIndex,
    withoutAutoScroll: props.withoutAutoScroll,
    filteredEvents: props.filteredEvents,
    filter: props.filter,
    isFetchingNextPage: props.isFetchingNextPage,
    setIsFetchingNextPage: props.setIsFetchingNextPage,
    hasMore: props.hasMore,
    setHasMore: props.setHasMore,
    projectId: props.projectId,
    events: props.events,
    setEvents: props.setEvents,
    setCurrentDate: props.setCurrentDate,
    rowVirtualizer,
  });

  return (
    <div className="relative flex max-h-[90%] flex-1 items-center justify-center py-16">
      <div className="relative flex h-full max-h-full w-4/5 max-w-[34rem] flex-col gap-8 rounded-xl border border-secondary bg-background p-6 shadow-md shadow-secondary xl:w-3/5">
        <Header
          filter={props.filter}
          setFilter={props.setFilter}
          projectName={props.projectName}
          events={props.events}
          setEvents={props.setEvents}
          projectId={props.projectId}
          isActive={props.isActive}
        />
        <div
          ref={parentRef}
          className="h-full overflow-y-auto pl-4 scrollbar scrollbar-track-background scrollbar-thumb-primary"
        >
          <main
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
            className="relative mx-auto w-11/12"
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const event = props.filteredEvents.at(virtualItem.index)!;
              return (
                <Event
                  key={virtualItem.key}
                  virtualItem={virtualItem}
                  event={event}
                  isActive={props.isActive}
                  userId={props.userId}
                  projectId={props.projectId}
                  setEvents={props.setEvents}
                  events={props.events}
                />
              );
            })}
          </main>
        </div>
      </div>
    </div>
  );
}
