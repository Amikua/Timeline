import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { type EventAndAuthor } from "~/app/dashboard/[projectId]/page";
import { getAllProjectEventsWithFilter, getProjectEvents } from "./actions";
import Link from "next/link";
import { type Category } from "@prisma/client";
import { categoryEmotes } from "./AddCategoryToPost";
import { useTheme } from "next-themes";

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

const getSeason = (month: number) => {
  if (month >= 2 && month <= 4) {
    return "spring";
  } else if (month >= 5 && month <= 7) {
    return "summer";
  } else if (month >= 8 && month <= 10) {
    return "fall";
  } else {
    return "winter";
  }
};

const seasonToColorLight = {
  winter: "hsl(210, 50%, 70%)",
  spring: "hsl(120deg 26.63% 75.66%)",
  summer: "hsl(10, 90%, 75%)",
  fall: "hsl(30, 50%, 70%)",
};

const seasonToColorDark = {
  winter: "hsl(210, 30%, 40%)",
  spring: "hsl(120deg 26.63% 45.66%)",
  summer: "hsl(10, 90%, 55%)",
  fall: "hsl(30, 50%, 40%)",
};

function seasonToColor(
  season: "winter" | "spring" | "summer" | "fall",
  theme?: string,
) {
  if (theme === "light") {
    return seasonToColorLight[season];
  } else {
    return seasonToColorDark[season];
  }
}

export function InfiniteScrollHorizontal({
  events,
  setEvents,
  filter,
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
  filter: Category | "";
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
  const [newScrollPosition, setNewScrollPosition] = useState<
    number | undefined
  >();

  const theme = useTheme();

  useEffect(() => {
    if (currentDateRef.current) {
      // The behavior and block options ensure smooth center alignment
      currentDateRef.current.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "center",
      });
    }
  }, [currentDate, currentDateRef]);

  useLayoutEffect(() => {
    if (listContainerRef.current && newScrollPosition) {
      // listContainerRef.current.scrollLeft = newScrollPosition;
      const it = listContainerRef.current;
      listContainerRef.current.scrollLeft =
        listContainerRef.current.scrollWidth - newScrollPosition;
      setNewScrollPosition(undefined);
    }
  }, [newScrollPosition, setNewScrollPosition, listContainerRef]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage && hasMore) {
          setIsFetchingNextPage(true);
          (filter
            ? getAllProjectEventsWithFilter({ projectId, filter })
            : getProjectEvents({
                projectId,
                offset: events.length,
              })
          )
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
              const it = listContainerRef.current!;
              setNewScrollPosition(it.scrollWidth - it.scrollLeft);
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
  }, [events, projectId, filter, listContainerRef.current]);

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
      className="relative h-36 min-h-36 shrink-0 overflow-auto px-8 scrollbar scrollbar-track-transparent scrollbar-thumb-transparent"
    >
      <div className="relative flex h-full w-fit min-w-full flex-row-reverse border-b-2 border-secondary">
        {Object.entries(eventsGroupByDay).map(([date, data], index) => {
          // Date is in format dd-mm-yyyy
          const [day, month, year] = date.split("-").map(Number);
          const currentDateObj = new Date(year!, month! - 1, day);
          let differenceInDays = 0;
          let absoluteDifferenceInMonths = 0;
          let nextDateObj = undefined;

          if (index !== 0) {
            const [prevDay, prevMonth, prevYear] =
              eventsGroupByDayKeys[index - 1]!.split("-").map(Number);
            const previousDateObj = new Date(
              prevYear!,
              prevMonth! - 1,
              prevDay,
            );
            differenceInDays = Math.floor(
              (previousDateObj.getTime() - currentDateObj.getTime()) /
                (1000 * 60 * 60 * 24),
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

          const mostOftenCategory = data.reduce(
            (acc, curr) => {
              if (!acc[curr.category]) {
                acc[curr.category] = 0;
              }
              acc[curr.category]++;
              return acc;
            },
            {} as Record<Category, number>,
          );

          const mostOftenCategories: Category[] = Object.entries(
            mostOftenCategory,
          )
            .sort((a, b) => b[1] - a[1])
            .map(([category]) => category as Category);

          return (
            <div
              className="relative flex w-max flex-col items-center"
              style={{ marginRight: `${2 + differenceInDays}rem` }}
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
              <span className="w-max pb-1 text-xs">
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
                className={`z-10 flex h-8 min-h-8 w-8 min-w-8 flex-col gap-1 rounded-3xl py-1 text-center shadow-lg`}
                style={{
                  backgroundColor:
                    currentDate === date
                      ? "hsl(var(--primary))"
                      : seasonToColor(
                          getSeason(currentDateObj.getMonth()),
                          theme.resolvedTheme,
                        ),
                  boxShadow:
                    currentDate === date
                      ? "0px 0px 10px 5px hsl(var(--primary))"
                      : `0px 0px 10px 5px ${seasonToColor(getSeason(currentDateObj.getMonth()), theme.resolvedTheme)}`,
                }}
              >
                {categoryEmotes[mostOftenCategories.at(0)!].emoji}
              </Link>
              {mostOftenCategories.length > 2 ? (
                <span
                  className="h-6 w-6 rounded-full p-1 pb-2 text-center text-xs"
                  style={{
                    backgroundColor:
                      currentDate === date
                        ? "hsl(var(--primary))"
                        : seasonToColor(
                            getSeason(currentDateObj.getMonth()),
                            theme.resolvedTheme,
                          ),
                    boxShadow:
                      currentDate === date
                        ? "0px 0px 10px 5px hsl(var(--primary))"
                        : `0px 0px 10px 5px ${seasonToColor(getSeason(currentDateObj.getMonth()), theme.resolvedTheme)}`,
                  }}
                >
                  {categoryEmotes[mostOftenCategories.at(1)!].emoji}
                </span>
              ) : null}
              {mostOftenCategories.length > 3 ? (
                <span
                  className="h-5 w-5 rounded-full p-1 text-center text-2xs"
                  style={{
                    backgroundColor:
                      currentDate === date
                        ? "hsl(var(--primary))"
                        : seasonToColor(
                            getSeason(currentDateObj.getMonth()),
                            theme.resolvedTheme,
                          ),
                    boxShadow:
                      currentDate === date
                        ? "0px 0px 10px 5px hsl(var(--primary))"
                        : `0px 0px 10px 5px ${seasonToColor(getSeason(currentDateObj.getMonth()), theme.resolvedTheme)}`,
                  }}
                >
                  {categoryEmotes[mostOftenCategories.at(2)!].emoji}
                </span>
              ) : null}
              <div
                className={`h-full w-1`}
                style={{
                  backgroundColor:
                    currentDate === date
                      ? "hsl(var(--primary))"
                      : seasonToColor(
                          getSeason(currentDateObj.getMonth()),
                          theme.resolvedTheme,
                        ),
                }}
              ></div>
              {absoluteDifferenceInMonths > 0 && nextDateObj && (
                <h3
                  className={`absolute -left-2/3 top-0 h-full w-8 text-center font-thin [writing-mode:vertical-lr]`}
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
