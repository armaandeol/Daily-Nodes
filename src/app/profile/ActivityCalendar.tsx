"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
  isAfter,
  isSameDay,
} from "date-fns";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { fetchNodeActivity, type NodeActivityDay } from "@/app/home/actions";
import { Tape } from "@/components/sketch";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Marker-red ink wash for days whose logs are all text. */
function intensityClass(count: number) {
  if (count >= 10) return "bg-marker";
  if (count >= 5) return "bg-marker/50";
  return "bg-marker/25";
}

/** Slight, varied tilts so pasted-in photos don't all sit dead straight. */
const PHOTO_TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

export default function ActivityCalendar() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [activity, setActivity] = useState<Record<string, NodeActivityDay>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const start = format(monthCursor, "yyyy-MM-dd");
    const end = format(endOfMonth(monthCursor), "yyyy-MM-dd");

    fetchNodeActivity(start, end)
      .then((days) => {
        if (!active) return;
        const map: Record<string, NodeActivityDay> = {};
        for (const d of days) map[d.date] = d;
        setActivity(map);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch activity:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [monthCursor]);

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(monthCursor), end: endOfMonth(monthCursor) }),
    [monthCursor],
  );
  const leadingBlanks = getDay(startOfMonth(monthCursor));

  const goToDay = (day: Date, count: number) => {
    if (count === 0) return; // no logs, nowhere to go
    if (isAfter(day, today) && !isSameDay(day, today)) return;
    router.push(`/home?date=${format(day, "yyyy-MM-dd")}`);
  };

  return (
    <div className="relative border-2 border-pencil bg-card p-4 pt-6 shadow-hard wobbly-md">
      <Tape />

      {/* Month nav */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setMonthCursor((m) => subMonths(m, 1))}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center border-2 border-pencil bg-paper text-pencil shadow-hard-sm transition-transform hover:-rotate-6 wobbly-sm"
        >
          <CaretLeft size={14} weight="bold" />
        </button>
        <span className="font-hand text-xl font-bold text-pencil -rotate-1">
          {format(monthCursor, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setMonthCursor((m) => addMonths(m, 1))}
          aria-label="Next month"
          disabled={isSameDay(startOfMonth(monthCursor), startOfMonth(today))}
          className="flex h-8 w-8 items-center justify-center border-2 border-pencil bg-paper text-pencil shadow-hard-sm transition-transform hover:rotate-6 disabled:pointer-events-none disabled:opacity-0 wobbly-sm"
        >
          <CaretRight size={14} weight="bold" />
        </button>
      </div>

      {/* Weekday row */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-center font-mono text-[9px] uppercase tracking-widest text-pencil/50">
            {w}
          </span>
        ))}
      </div>

      {/* Day grid — hairline dividers like the reference sheet */}
      <div
        className={cn(
          "grid grid-cols-7 gap-px border-2 border-pencil bg-pencil/30 transition-opacity",
          loading && "opacity-50",
        )}
      >
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} aria-hidden className="aspect-square bg-paper" />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const entry = activity[key];
          const count = entry?.count || 0;
          const photo = entry?.thumbnail_url;
          const future = isAfter(day, today) && !isSameDay(day, today);
          const empty = count === 0 || future;
          const isToday = isSameDay(day, today);

          return (
            <button
              key={key}
              onClick={() => goToDay(day, count)}
              disabled={empty}
              title={
                empty
                  ? format(day, "MMM d")
                  : `${count} log${count > 1 ? "s" : ""} on ${format(day, "MMM d")} — open this day`
              }
              className={cn(
                "group relative aspect-square bg-paper text-left",
                empty ? "cursor-default" : "cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-hard-sm",
              )}
            >
              {/* Marker ink wash, deeper with more logs — always shown behind the photo so log
                  density stays visible even on days with a thumbnail. */}
              {count > 0 && (
                <span aria-hidden className={cn("absolute inset-x-1 bottom-1 top-5", intensityClass(count))} />
              )}
              {/* Photo days: a scrapbook-style cutout — uneven corners, a paper-white edge,
                  a hard ink shadow, and a slight pasted-in tilt — stuck over the wash so a
                  ring of its color still peeks out around the edges. */}
              {photo && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-[6px] bottom-[6px] top-[22px] overflow-hidden rounded-[3px_7px_2px_6px] border-[1.5px] border-paper shadow-hard-sm",
                    PHOTO_TILTS[day.getDate() % PHOTO_TILTS.length],
                  )}
                >
                  <img src={photo} alt="" loading="lazy" className="h-full w-full object-cover" />
                </span>
              )}

              <span
                className={cn(
                  "absolute left-1 top-1 font-mono text-[10px] leading-none",
                  empty ? "text-pencil/30" : "text-pencil",
                  isToday && "font-bold text-marker",
                )}
              >
                {format(day, "d")}
              </span>
              {!empty && (
                <span
                  aria-hidden
                  className="absolute right-1 top-0.5 font-mono text-[11px] leading-none text-pencil/40 transition-colors group-hover:text-marker"
                >
                  +
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[9px] uppercase tracking-widest text-pencil/50">
        <span>less</span>
        <span className="h-3 w-3 border border-pencil/40 bg-paper" />
        <span className="h-3 w-3 border border-pencil/40 bg-marker/25" />
        <span className="h-3 w-3 border border-pencil/40 bg-marker/50" />
        <span className="h-3 w-3 border border-pencil/40 bg-marker" />
        <span>more</span>
      </div>
    </div>
  );
}
