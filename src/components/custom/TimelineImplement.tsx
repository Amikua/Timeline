import React, { useEffect, useRef, useState } from "react";
import { type EventAndAuthor } from "~/app/dashboard/[projectId]/page";
import { getProjectEvents } from "./actions";
import Link from "next/link";

function getScrollToIndex(events: EventAndAuthor[], date: string) {
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

function getCurrentSeason(month: number) {
  if (month >= 0 && month <= 1) {
    return "winter";
  } else if (month >= 2 && month <= 4) {
    return "spring";
  } else if (month >= 5 && month <= 7) {
    return "summer";
  } else if (month >= 8 && month <= 10) {
    return "fall";
  } else {
    return "winter";
  }
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const colorMap = {
  winter: "hsl(240, 70%, 4%)",
  spring: "hsl(120, 70%, 4%)",
  summer: "hsl(3, 70%, 4%)",
  fall: "hsl(26, 70%, 4%)",
};


const seasons = ["winter", "spring", "summer", "fall"] as const;
type Season = (typeof seasons)[number];

// Function to generate the gradient string based on the season distribution
const generateGradient = (
  from: Season,
  to: Season,
  fullYear: boolean,
  shouldRenderSeasons: boolean,
) => {
  if (!shouldRenderSeasons) {
    return {};
  }
  // return "linear-gradient(to left, red 0%, blue 50%, red 100%)"
  // linear-gradient(to left, #f09433 50%, 50%, #4ca1af 50%, 50%)
  const fromIndex = seasons.indexOf(from);
  const toIndex = seasons.indexOf(to);

  // const length = fullYear ? 4 : Math.abs(toIndex - fromIndex) + 1;
  const diff = Math.abs(toIndex - fromIndex);
  const length = fullYear ? 4 : Math.min(diff, 4 - diff) + 1;
  if (length === 1) {
    const color = colorMap[from];
    return {
      background: color,
    };
  }

  const cycle = Array.from({ length }, (_, i) =>
    seasons.at((fromIndex - i) % seasons.length),
  );

  const seasonDistribution = cycle.map((season, i) => {
    const width = (100 / length).toFixed(2);
    return { season, width };
  });

  let gradient = "linear-gradient(to left";

  seasonDistribution.forEach(
    ({ season, width }, i) =>
      // `linear-gradient(to right, ${colorMap[season!]}) ${width}%`,
      (gradient += `, ${colorMap[season!]} ${Number(width) * i}%`),
  );

  gradient += `, ${colorMap[to]} 100%)`;

  return {
    backgroundImage: gradient,
  };
};

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
  const [shouldRenderSeasons, setShouldRenderSeasons] = useState(false);

  // Existing useEffects and other code remains the same

  useEffect(() => {
    if (currentDateRef.current) {
      // The behavior and block options ensure smooth center alignment
      currentDateRef.current.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "center",
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
      setShouldRenderSeasons(clientWidth < scrollWidth);
      listContainerRef.current.scrollLeft = scrollWidth - clientWidth;
    }
  }, []);

  return (
    <div
      ref={listContainerRef}
      className="customShadow relative z-10 h-40 min-h-40 shrink-0 overflow-auto rounded-lg scrollbar scrollbar-track-background scrollbar-thumb-background"
    >
      <div className="relative flex h-full w-fit min-w-full flex-row-reverse border-b-2 border-secondary">
        {Object.entries(eventsGroupByDay).map(([date, data], index) => {
          // Date is in format dd-mm-yyyy
          const [day, month, year] = date.split("-").map(Number);
          const currentDateObj = new Date(year!, month! - 1, day);
          let differenceInDays = 0;
          let absoluteDifferenceInMonths = 0;
          let absoluteDifferenceBetweenCurrentAndPreviousInMonths = 0;
          const currentSeason = getCurrentSeason(currentDateObj.getMonth());
          let previousSeason = currentSeason;
          let nextDateObj = undefined;

          if (index !== 0) {
            const [prevDay, prevMonth, prevYear] =
              eventsGroupByDayKeys[index - 1]!.split("-").map(Number);
            const previousDateObj = new Date(
              prevYear!,
              prevMonth! - 1,
              prevDay,
            );
            previousSeason = getCurrentSeason(previousDateObj.getMonth());
            differenceInDays = Math.floor(
              (previousDateObj.getTime() - currentDateObj.getTime()) /
              (1000 * 60 * 60 * 24),
            );
            absoluteDifferenceBetweenCurrentAndPreviousInMonths = Math.abs(
              previousDateObj.getMonth() -
              currentDateObj.getMonth() +
              12 *
              (previousDateObj.getFullYear() -
                currentDateObj.getFullYear()),
            );
          }

          if (index !== eventsGroupByDayKeys.length - 1) {
            const [nextDay, nextMonth, nextYear] =
              eventsGroupByDayKeys[index + 1]!.split("-").map(Number);
            nextDateObj = new Date(nextYear!, nextMonth! - 1, nextDay);
            // For prev date 08-02-2021 and current date 29-01-2021, the difference in months should be 1
            // For prev date 08-02-2022 and current date 08-02-2021, the difference in months should be 12
            // absoluteDifferenceInMonths = Math.abs(previousDateObj.getMonth() - currentDateObj.getMonth() + (12 * (previousDateObj.getFullYear() - currentDateObj.getFullYear())));
            absoluteDifferenceInMonths = Math.abs(
              nextDateObj.getMonth() -
              currentDateObj.getMonth() +
              12 * (nextDateObj.getFullYear() - currentDateObj.getFullYear()),
            );
          }

          return (
            <div
              className="relative flex w-max flex-col items-center"
              style={{
                paddingRight: `${2 + differenceInDays}rem`,
                paddingLeft: eventsGroupByDayKeys.length - 1 === index ? "2rem" : "0",
                ...generateGradient(
                  previousSeason as Season,
                  currentSeason,
                  absoluteDifferenceBetweenCurrentAndPreviousInMonths >= 12,
                  shouldRenderSeasons
                ),
              }}
              ref={(el) => {
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
              <span className="w-max pb-1 pt-3 text-xs">
                {date
                  .split("-")
                  .map((it) => it.padStart(2, "0"))
                  .join("-")}
              </span>
              <button
                onClick={() => {
                  setWithoutAutoScroll(true);
                  setCurrentDate(date);
                  setScrollToIndex(getScrollToIndex(events, date));
                }}
                className={`z-10 h-8 min-h-8 w-8 min-w-8 rounded-3xl py-1 text-center shadow-lg ${currentDate === date ? "bg-primary shadow-primary" : "bg-secondary shadow-secondary"}`}
              >
                {data.length > 9 ? "9+" : data.length}
              </button>
              <div
                className={`h-full w-1 ${currentDate === date ? "bg-primary" : "bg-secondary"}`}
              ></div>
              {absoluteDifferenceInMonths > 0 && nextDateObj && (
                <h3
                  className={`absolute -left-12 top-0 z-10 h-full w-8 text-center font-thin [writing-mode:vertical-lr]`}
                >
                  {`${monthNames[currentDateObj.getMonth()]} ${currentDateObj.getFullYear()}`}
                </h3>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InfiniteScrollHorizontal;
