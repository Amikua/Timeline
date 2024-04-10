"use client";
import { useState, useMemo, useEffect } from "react";
import { ProjectEventsView } from "./ProjectEventsView";
import { type EventAndAuthor } from "~/app/dashboard/[projectId]/page";
import InfiniteScrollHorizontal from "./TimelineImplement";
import { EVENTS_PER_REQUEST } from "~/constants";
import { checkForEventFromEmailCached } from "./actions";
import { Category } from "@prisma/client";

export function getScrollToIndex(events: EventAndAuthor[], date: string) {
  const index = events.findIndex((event) => {
    const [day, month, year] = date.split("-").map(Number);
    if (!day || !month || !year) return null;
    return (
      event.happendAt.getDate() === day &&
      event.happendAt.getMonth() + 1 === month &&
      event.happendAt.getFullYear() === year
    );
  });
  return index;
}

export function Timeline({
  projectName,
  projectId,
  events: defaultEvents,
  userId,
  isActive,
}: {
  projectName: string;
  projectId: string;
  selectedDateFromSearchParams?: string;
  events: EventAndAuthor[];
  userId: string;
  isActive: boolean;
}) {
  const [events, setEvents] = useState(defaultEvents);
  const [filter, setFilter] = useState<Category | "">("");
  const filteredEvents = useMemo(
    () => events.filter((event) => (filter ? event.category === filter : true)),
    [events, filter],
  );
  const [withoutAutoScroll, setWithoutAutoScroll] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasMore, setHasMore] = useState(events.length === EVENTS_PER_REQUEST);
  const eventsGroupByDay = useMemo(
    () =>
      filteredEvents.reduce(
        (acc, event) => {
          const day = event.happendAt.getDate();
          const month = event.happendAt.getMonth() + 1;
          const year = event.happendAt.getFullYear();
          const key = `${day}-${month}-${year}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key]!.push(event);
          return acc;
        },
        {} as Record<string, EventAndAuthor[]>,
      ),
    [filteredEvents],
  );

  const eventsGroupByDayKeys = useMemo(
    () => Object.keys(eventsGroupByDay),
    [eventsGroupByDay],
  );
  // We always have at least one event
  const [currentDate, setCurrentDate] = useState(eventsGroupByDayKeys.at(0)!);
  const [scrollToIndex, setScrollToIndex] = useState<number | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      checkForEventFromEmailCached().catch(console.error);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setHasMore(true)
  }, [filter])

  return (
    <>
      <ProjectEventsView
        events={events}
        setEvents={setEvents}
        filter={filter}
        setFilter={setFilter}
        filteredEvents={filteredEvents}
        projectName={projectName}
        projectId={projectId}
        setCurrenctDate={setCurrentDate}
        setScrollToIndex={setScrollToIndex}
        scrollToIndex={scrollToIndex}
        withoutAutoScroll={withoutAutoScroll}
        setWithoutAutoScroll={setWithoutAutoScroll}
        hasMore={hasMore}
        setHasMore={setHasMore}
        isFetchingNextPage={isFetchingNextPage}
        setIsFetchingNextPage={setIsFetchingNextPage}
        userId={userId}
        isActive={isActive}
      />
      <InfiniteScrollHorizontal
        events={events}
        setEvents={setEvents}
        eventsGroupByDay={eventsGroupByDay}
        eventsGroupByDayKeys={eventsGroupByDayKeys}
        filter={filter}
        currentDate={currentDate}
        hasMore={hasMore}
        projectId={projectId}
        setHasMore={setHasMore}
        isFetchingNextPage={isFetchingNextPage}
        setIsFetchingNextPage={setIsFetchingNextPage}
        setWithoutAutoScroll={setWithoutAutoScroll}
        setCurrentDate={setCurrentDate}
        setScrollToIndex={setScrollToIndex}
      />
    </>
  );
}
