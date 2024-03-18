"use client";
import { useState, useEffect, useRef, createRef, useMemo } from "react";
import Link from "next/link";
import { ProjectEventsView } from "./ProjectEventsView";
import { type EventAndAuthor } from "./TimelineWrapper";


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

function getScrollToIndex(events: EventAndAuthor[], date: string) {
  const index = events.findIndex(event => {
    const [day, month, year] = date.split("-").map(Number);
    if (!day || !month || !year) return null;
    return event.happendAt.getDate() === day && event.happendAt.getMonth() + 1 === month && event.happendAt.getFullYear() === year;
  });
  return index;
}

export function Timeline({
  projectId,
  selectedDateFromSearchParams,
  events: defaultEvents,
}: {
  projectId: string;
  selectedDateFromSearchParams?: string;
  events: EventAndAuthor[];
}) {
  const [events, setEvents] = useState(defaultEvents);
  const [withoutAutoScroll, setWithoutAutoScroll] = useState(true);
  const eventsGroupByDay = useMemo(() => events.reduce(
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
  ), [events]);

  // We always have at least one event
  const [currentDate, setCurrentDate] = useState(selectedDateFromSearchParams ?? Object.keys(eventsGroupByDay)[0]!);
  const [scrollToIndex, setScrollToIndex] = useState<number | null>(() => {
    if (selectedDateFromSearchParams) {
      return getScrollToIndex(events, selectedDateFromSearchParams);
    }
    return null;
  });

  const eventsGroupByDayWithRefs = useMemo(() => {
    return Object.entries(eventsGroupByDay).reduce((acc, [date, events]) => {
      acc[date] = { ref: createRef(), events };
      return acc;
    }, {} as Record<string, { ref: React.RefObject<HTMLAnchorElement>; events: EventAndAuthor[] }>);
  }, [eventsGroupByDay]);

  const timelineRef = useHorizontalScroll();

  useEffect(() => {
    if (!currentDate) return
    const ref = eventsGroupByDayWithRefs[currentDate]?.ref;
    if (!ref?.current) return;
    ref.current.scrollIntoView({
      block: "center",
      behavior: "instant",
      inline: "nearest"
    })
  }, [currentDate, eventsGroupByDayWithRefs]);

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
      />
      <div ref={timelineRef} className="relative h-28 min-h-28 px-8 overflow-x-auto overflow-y-hidden scrollbar scrollbar-track-background scrollbar-thumb-primary">
        <div className="relative w-fit min-w-full h-full flex gap-10 border-b-2 border-secondary">
          {Object.entries(eventsGroupByDayWithRefs).map(([date, data]) => {
            return (
              <div className="relative flex flex-col w-max items-center" key={date}>
                <span className="w-max">{date.split("-").map(it => it.padStart(2, "0")).join("-")}</span>
                <Link
                  onClick={() => { setWithoutAutoScroll(true); setCurrentDate(date); setScrollToIndex(getScrollToIndex(events, date)) }}
                  ref={data.ref}
                  href={`/dashboard/${projectId}?date=${date}`}
                  className={`min-w-8 min-h-8 w-8 h-8 z-10 rounded-3xl py-1 text-center shadow-lg ${currentDate === date ? "bg-primary shadow-primary" : "bg-secondary shadow-secondary"}`}
                >
                  {data.events.length}
                </Link>
                <div className={`w-1 h-full ${currentDate === date ? "bg-primary" : "bg-secondary"}`}></div>
              </div>
            );
          })}
        </div>
      </div >
    </>
  );
}
