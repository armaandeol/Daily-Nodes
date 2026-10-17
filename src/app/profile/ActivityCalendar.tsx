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
import { categoryOf } from "@/app/home/feed-types";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function intensityClass(count: number) {
  if (count <= 0) return "bg-neutral-100 border-neutral-200";
  if (count === 1) return "bg-marker/25 border-marker/40";
  if (count === 2) return "bg-marker/50 border-marker/60";
  return "bg-marker border-marker text-white";
}

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
      })
      .catch((err) => console.error("Failed to fetch activity:", err))
      .finally(() => {
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

  const goToDay = (day: Date) => {
    if (isAfter(day, today) && !isSameDay(day, today)) return;
    router.push(`/home?date=${format(day, "yyyy-MM-dd")}`);
  };

  return (
    <div className="w-full border-2 border-neutral-300 rounded-lg bg-neutral-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMonthCursor((m) => subMonths(m, 1))}
          aria-label="Previous month"
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
        >
          <CaretLeft size={14} weight="bold" />
        </button>
        <span className="text-xs font-semibold tracking-wide text-neutral-700">
          {format(monthCursor, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setMonthCursor((m) => addMonths(m, 1))}
          aria-label="Next month"
          disabled={isSameDay(startOfMonth(monthCursor), startOfMonth(today))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors disabled:opacity-0 disabled:pointer-events-none"
        >
          <CaretRight size={14} weight="bold" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-center text-[10px] font-medium text-neutral-400">
            {w}
          </span>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-1.5 ${loading ? "opacity-50" : ""} transition-opacity`}>
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const entry = activity[key];
          const count = entry?.count || 0;
          const future = isAfter(day, today) && !isSameDay(day, today);
          const icon = count > 0 ? categoryOf(entry.top_type).icon : null;
          return (
            <button
              key={key}
              onClick={() => goToDay(day)}
              disabled={future}
              title={count > 0 ? `${count} log${count > 1 ? "s" : ""} on ${format(day, "MMM d")}` : format(day, "MMM d")}
              className={`aspect-square rounded-[6px] border flex items-center justify-center text-[11px] transition-transform ${intensityClass(count)} ${
                future ? "opacity-0 pointer-events-none" : "hover:scale-110 cursor-pointer"
              } ${isSameDay(day, today) ? "ring-2 ring-neutral-900 ring-offset-1" : ""}`}
            >
              {icon || <span className="text-[9px] text-neutral-400">{format(day, "d")}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-neutral-400">
        <span>less</span>
        <span className="h-3 w-3 rounded-[3px] border bg-neutral-100 border-neutral-200" />
        <span className="h-3 w-3 rounded-[3px] border bg-marker/25 border-marker/40" />
        <span className="h-3 w-3 rounded-[3px] border bg-marker/50 border-marker/60" />
        <span className="h-3 w-3 rounded-[3px] border bg-marker border-marker" />
        <span>more</span>
      </div>
    </div>
  );
}
