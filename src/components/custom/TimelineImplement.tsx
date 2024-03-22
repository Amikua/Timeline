import React, { useEffect, useRef } from "react";
import { type EventAndAuthor } from "~/app/dashboard/[projectId]/page";
import { getProjectEvents } from "./actions";
import Link from "next/link";

function getScrollToIndex(events: EventAndAuthor[], date: string) {
    const index = events.findIndex(event => {
      const [day, month, year] = date.split("-").map(Number);
      if (!day || !month || !year) return null;
      return event.happendAt.getDate() === day && event.happendAt.getMonth() + 1 === month && event.happendAt.getFullYear() === year;
    });
    return index;
  }

function useHorizontalScroll() {
    const elRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const el = elRef.current;
      if (el) {
        const onWheel = (e: WheelEvent) => {
          if (e.deltaY == 0) return;
          e.preventDefault();
          el.scrollBy(e.deltaY, 0);
        };
        el.addEventListener("wheel", onWheel);
        return () => el.removeEventListener("wheel", onWheel);
      }
    }, []);
    return elRef;
  }



export function InfiniteScrollHorizontal({
  events,
  setEvents,
  eventsGroupByDay,
  eventsGroupByDayKeys,
  currentDate,
  hasMore,
  projectId,
  setHasMore,
  isFetchingNextPage,
  setIsFetchingNextPage,
  setWithoutAutoScroll,
  setCurrentDate,
  setScrollToIndex,
}: {
  events: EventAndAuthor[];
  setEvents: (events: EventAndAuthor[]) => void;
  eventsGroupByDay: Record<string, EventAndAuthor[]>;
  eventsGroupByDayKeys: string[];
  currentDate: string;
  hasMore: boolean;
  setHasMore: (hasMore: boolean) => void;
  projectId: string;
  isFetchingNextPage: boolean;
  setIsFetchingNextPage: (isFetchingNextPage: boolean) => void;
  setWithoutAutoScroll: (firstScroll: boolean) => void;
  setCurrentDate: (date: string) => void;
  setScrollToIndex: (index: number | null) => void;
}) {
  const lastItemRef = useRef<HTMLDivElement>(null); // Ref for the item to observe
  const listContainerRef = useHorizontalScroll(); // Ref for the scrolling container
  const currentDateRef = useRef<HTMLDivElement>(null); // Ref for the current date element

  // Existing useEffects and other code remains the same

  useEffect(() => {
    if (currentDateRef.current) {
      // The behavior and block options ensure smooth center alignment
      currentDateRef.current.scrollIntoView({ 
        behavior: 'auto',
        block: 'center',
        inline: 'center'
      });
    }
  }, [currentDate, eventsGroupByDay, currentDateRef]); // Depend on currentDate and eventsGroupByDay

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage && hasMore) {
          setIsFetchingNextPage(true);
          getProjectEvents({
            projectId,
            offset: events.length,
          })
            .then((response) => {
              const newEvents = response.data!.events!;
              setHasMore(response.data!.hasMore!);
              if (Array.isArray(newEvents)) {
                setEvents([...events, ...newEvents]);
              } else {
                setEvents([...events, newEvents]);
              }
            })
            .catch((error) => {
              console.error("Error fetching next page", error);
            })
            .finally(() => {
              setIsFetchingNextPage(false);
              const width = listContainerRef.current!.scrollWidth;
              listContainerRef.current!.scrollLeft = width - width * 0.85;
            });
        }
      },
      { root: listContainerRef.current, threshold: 1.0 },
    );

    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }

    return () => {
      if (lastItemRef.current) {
        observer.disconnect();
      }
    };
  }, [events, projectId, listContainerRef.current]);

  // Scroll to the right on mount
  useEffect(() => {
    if (listContainerRef.current) {
      const { scrollWidth, clientWidth } = listContainerRef.current;
      listContainerRef.current.scrollLeft = scrollWidth - clientWidth;
    }
  }, []);

  return (
    <div
      ref={listContainerRef}
      className="relative h-28 min-h-28 shrink-0 overflow-x-auto overflow-y-hidden px-8 scrollbar scrollbar-track-background scrollbar-thumb-primary"
    >
      <div className="relative flex h-full w-fit min-w-full flex-row-reverse gap-10 border-b-2 border-secondary">
        {Object.entries(eventsGroupByDay).map(([date, data], index) => {
          return (
            <div
              className="relative flex w-max flex-col items-center"
              ref={(el)=> {
                if (currentDate === date) {
                    // @ts-expect-error Hack to make multiple refs work
                    currentDateRef.current = el;
                }
                if (eventsGroupByDayKeys.length > 5) {
                    if (index === eventsGroupByDayKeys.length - 5) {
                    // @ts-expect-error Hack to make multiple refs work
                        lastItemRef.current = el;
                    }
                } else if (index === eventsGroupByDayKeys.length - 1) {
                    // @ts-expect-error Hack to make multiple refs work
                    lastItemRef.current = el;
                }
              }}
              key={date}
            >
              <span className="w-max">
                {date
                  .split("-")
                  .map((it) => it.padStart(2, "0"))
                  .join("-")}
              </span>
              <Link
                onClick={() => {
                  setWithoutAutoScroll(true);
                  setCurrentDate(date);
                  setScrollToIndex(getScrollToIndex(events, date));
                }}
                href={`/dashboard/${projectId}?date=${date}`}
                className={`z-10 h-8 min-h-8 w-8 min-w-8 rounded-3xl py-1 text-center shadow-lg ${currentDate === date ? "bg-primary shadow-primary" : "bg-secondary shadow-secondary"}`}
              >
                {data.length > 9 ? "9+" : data.length}
              </Link>
              <div
                className={`h-full w-1 ${currentDate === date ? "bg-primary" : "bg-secondary"}`}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InfiniteScrollHorizontal;
