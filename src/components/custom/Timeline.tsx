"use client";
import { useState, useEffect,  useRef, useMemo } from "react";
import { ProjectEventsView } from "./ProjectEventsView";
import { type EventAndAuthor } from "~/app/dashboard/[projectId]/page";
import InfiniteScrollHorizontal from "./TimelineImplement";

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
  projectId,
  events: defaultEvents,
  userId,
  isActive,
}: {
  projectId: string;
  selectedDateFromSearchParams?: string;
  events: EventAndAuthor[];
  userId: string;
  isActive: boolean;
}) {
  const [events, setEvents] = useState(defaultEvents);
  const [withoutAutoScroll, setWithoutAutoScroll] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const eventsGroupByDay = useMemo(
    () =>
      events.reduce(
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
    [events],
  );

  const eventsGroupByDayKeys = useMemo(
    () => Object.keys(eventsGroupByDay),
    [eventsGroupByDay],
  );
  // We always have at least one event
  const [currentDate, setCurrentDate] = useState(eventsGroupByDayKeys.at(0)!);
  const [scrollToIndex, setScrollToIndex] = useState<number | null>(null)

  return (
    <>
      <ProjectEventsView
        events={events}
        setEvents={setEvents}
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

 // Virtual list stuff
  // const timelineRef = useHorizontalScroll();
  // const scrollingRef = useRef<number>();

  // const scrollToFn: VirtualizerOptions<
  //   HTMLDivElement,
  //   HTMLDivElement
  // >["scrollToFn"] = useCallback((offset, canSmooth, instance) => {
  //   const duration = 1000;
  //   if (!timelineRef.current) return;
  //   const start = timelineRef.current.scrollLeft;
  //   const startTime = (scrollingRef.current = Date.now());

  //   const run = () => {
  //     if (scrollingRef.current !== startTime) return;
  //     const now = Date.now();
  //     const elapsed = now - startTime;
  //     const progress = easeInOutQuint(Math.min(elapsed / duration, 1));
  //     const interpolated = start + (offset - start) * progress;

  //     if (elapsed < duration) {
  //       elementScroll(interpolated, canSmooth, instance);
  //       requestAnimationFrame(run);
  //     } else {
  //       elementScroll(interpolated, canSmooth, instance);
  //     }
  //   };

  //   requestAnimationFrame(run);
  // }, []);

  // const rowVirtualizer = useVirtualizer({
  //   count: eventsGroupByDayKeys.length,
  //   getScrollElement: () => timelineRef.current!,
  //   estimateSize: () => 100,
  //   horizontal: true,
  //   overscan: 7,
  //   scrollToFn,
  // });

  // useEffect(() => {
  //   const index = eventsGroupByDayKeys.findIndex((it) => it === currentDate);
  //   if (index && index === -1) return;
  //   console.log("scrollToIndex", scrollToIndex);
  //   rowVirtualizer.scrollToIndex(index, { align: "center" });
  // }, [currentDate]);

  // useEffect(() => {
  //   (async () => {
  //     const items = rowVirtualizer.getVirtualItems();
  //     const lastItem = items[items.length - 1];

  //     if (!lastItem) {
  //       return;
  //     }

  //     if (
  //       lastItem.index >= eventsGroupByDayKeys.length - 1 &&
  //       !isFetchingNextPage &&
  //       hasMore &&
  //       events.length
  //     ) {
  //       setIsFetchingNextPage(true);
  //       try {
  //         const response = await getProjectEvents({
  //           projectId,
  //           offset: events.length,
  //         });
  //         const newEvents = response.data!.events!;
  //         setHasMore(response.data!.hasMore!);
  //         if (Array.isArray(newEvents)) {
  //           setEvents([...events, ...newEvents]);
  //         } else {
  //           setEvents([...events, newEvents]);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching next page", error);
  //       }
  //       setIsFetchingNextPage(false);
  //     }
  //   })().catch(console.error);
  // }, [
  //   eventsGroupByDayKeys.length,
  //   isFetchingNextPage,
  //   hasMore,
  //   projectId,
  //   rowVirtualizer.getVirtualItems(),
  // ]);
      {/* <div ref={timelineRef} className="relative shrink-0 h-28 min-h-28 px-8 overflow-x-auto overflow-y-hidden scrollbar scrollbar-track-background scrollbar-thumb-primary">
        <div style={{ width: `${rowVirtualizer.getTotalSize()}px` }} className="relative min-w-full h-full flex flex-row-reverse gap-10 border-b-2 border-secondary">
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const date = eventsGroupByDayKeys.at(virtualItem.index)!;
            const dateEvents = eventsGroupByDay[date]!;
            return (
              <div className="absolute h-full left-0 top-0 flex flex-col items-center" key={date}
                style={{
                  width: `${virtualItem.size}px`,
                  transform: `translateX(${virtualItem.start}px)`,
                }}
              >
                <span className="w-max">{date.split("-").map(it => it.padStart(2, "0")).join("-")}</span>
                <Link
                  onClick={() => { setWithoutAutoScroll(true); setCurrentDate(date); setScrollToIndex(getScrollToIndex(events, date)) }}
                  href={`/dashboard/${projectId}?date=${date}`}
                  className={`min-w-8 min-h-8 w-8 h-8 z-10 rounded-3xl py-1 text-center shadow-lg ${currentDate === date ? "bg-primary shadow-primary" : "bg-secondary shadow-secondary"}`}
                >
                  {dateEvents.length > 9 ? "9+" : dateEvents.length}
                </Link>
                <div className={`w-1 h-full ${currentDate === date ? "bg-primary" : "bg-secondary"}`}></div>
              </div>
            )
          })}
        </div>
      </div > */}
