"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
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
import { fetchNodeActivity, type NodeActivityDay } from "@/app/home/actions";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Marker-red wash, deeper with more logs. */
function intensityClass(count: number) {
  if (count >= 10) return "bg-marker";
  if (count >= 5) return "bg-marker/55";
  return "bg-marker/30";
}

/** Hand-coloured, uneven marker swipes. */
const WASH_SHAPES = [
  "38% 62% 45% 55% / 52% 40% 60% 48%",
  "55% 45% 60% 40% / 45% 58% 42% 55%",
  "45% 55% 38% 62% / 60% 45% 55% 40%",
];

/** Torn-paper outlines, chosen by date so server and browser agree. */
const TORN_EDGES = [
  "polygon(2% 6%, 14% 1%, 27% 5%, 41% 0%, 55% 4%, 70% 1%, 84% 5%, 98% 2%, 96% 18%, 100% 34%, 97% 52%, 100% 70%, 96% 86%, 98% 98%, 82% 95%, 66% 100%, 50% 96%, 34% 100%, 18% 95%, 3% 99%, 0% 82%, 4% 64%, 0% 46%, 3% 28%)",
  "polygon(0% 3%, 18% 0%, 33% 4%, 49% 1%, 63% 5%, 79% 0%, 100% 4%, 97% 21%, 100% 39%, 96% 57%, 99% 76%, 97% 100%, 79% 96%, 61% 100%, 45% 95%, 29% 99%, 12% 96%, 1% 100%, 3% 80%, 0% 60%, 4% 41%, 1% 22%)",
  "polygon(4% 1%, 21% 4%, 36% 0%, 52% 3%, 68% 0%, 83% 4%, 99% 0%, 100% 17%, 96% 33%, 100% 50%, 97% 67%, 100% 84%, 95% 99%, 80% 96%, 64% 100%, 48% 97%, 31% 100%, 15% 96%, 0% 98%, 3% 81%, 0% 63%, 3% 45%, 0% 26%)",
];

const TILTS = [-6, 4, -3, 5, -4, 2];

export default function ActivityCalendar() {
  const router = useRouter();
  const reduce = useReducedMotion();
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
  const atCurrentMonth = isSameDay(startOfMonth(monthCursor), startOfMonth(today));

  const goToDay = (day: Date, count: number) => {
    if (count === 0) return;
    if (isAfter(day, today) && !isSameDay(day, today)) return;
    router.push(`/home?date=${format(day, "yyyy-MM-dd")}`);
  };

  let photoIndex = 0;

  return (
    <div className="relative scrapbook-sheet border-2 border-pencil px-4 pb-5 pt-9 shadow-hard wobbly-md">
      {/* Corner tape */}
      <span aria-hidden className="absolute -left-3 top-1 h-6 w-16 -rotate-[30deg] border border-pencil/20 bg-postit/80" />
      <span aria-hidden className="absolute -right-3 top-1 h-6 w-16 rotate-[30deg] border border-pencil/20 bg-ink/20" />

      {/* Margin doodles */}
      <svg aria-hidden viewBox="0 0 24 24" className="absolute right-6 bottom-2 h-5 w-5 rotate-12 text-ink/60">
        <path d="M12 2l2.6 6.6L21 9.3l-5 4.4 1.6 6.8L12 16.8 6.4 20.5 8 13.7 3 9.3l6.4-.7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <svg aria-hidden viewBox="0 0 24 48" className="absolute -top-4 left-1/4 h-10 w-5 -rotate-6 text-pencil/60">
        <path d="M8 40V10a6 6 0 0112 0v28a9 9 0 01-18 0V14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setMonthCursor((m) => subMonths(m, 1))}
          aria-label="Previous month"
          className="group p-1 text-pencil transition-transform hover:-translate-x-0.5"
        >
          <svg viewBox="0 0 40 20" className="h-5 w-10">
            <path d="M38 11c-9-2-20 1-33-1M10 4L3 10l7 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="relative -rotate-2 border-2 border-pencil bg-postit px-4 py-1 shadow-hard-sm wobbly-sm">
          <span aria-hidden className="absolute -top-2 left-1/2 h-3.5 w-10 -translate-x-1/2 rotate-3 bg-card/70 border border-pencil/20" />
          <span className="font-hand text-xl font-bold text-pencil">{format(monthCursor, "MMMM yyyy")}</span>
        </div>
        <button
          onClick={() => setMonthCursor((m) => addMonths(m, 1))}
          aria-label="Next month"
          disabled={atCurrentMonth}
          className="p-1 text-pencil transition-transform hover:translate-x-0.5 disabled:pointer-events-none disabled:opacity-0"
        >
          <svg viewBox="0 0 40 20" className="h-5 w-10">
            <path d="M2 9c9 2 20-1 33 1M30 4l7 6-7 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Weekdays */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-center font-hand text-sm text-pencil/60">
            {w}
          </span>
        ))}
      </div>

      {/* Days */}
      <div
        key={format(monthCursor, "yyyy-MM")}
        className={cn("grid grid-cols-7 gap-1.5 transition-opacity", loading && "opacity-50")}
      >
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} aria-hidden className="aspect-square" />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const entry = activity[key];
          const count = entry?.count || 0;
          const photo = entry?.thumbnail_url;
          const future = isAfter(day, today) && !isSameDay(day, today);
          const empty = count === 0 || future;
          const isToday = isSameDay(day, today);
          const d = day.getDate();
          const tilt = TILTS[d % TILTS.length];
          const order = photo ? photoIndex++ : 0;

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
                "group relative aspect-square border border-dashed border-pencil/20 bg-paper/60",
                empty ? "cursor-default" : "cursor-pointer",
              )}
            >
              {/* Marker wash — fills the cell so density is always visible */}
              {!empty && (
                <span
                  aria-hidden
                  className={cn("absolute inset-[3px]", intensityClass(count))}
                  style={{ borderRadius: WASH_SHAPES[d % WASH_SHAPES.length] }}
                />
              )}

              {/* Torn vintage snapshot */}
              {photo && !future && (
                <motion.span
                  aria-hidden
                  initial={reduce ? false : { opacity: 0, y: -14, rotate: tilt * 2, scale: 1.15 }}
                  animate={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: reduce ? 0 : order * 0.05 }}
                  className="absolute inset-[18%] transition-transform duration-200 group-hover:scale-110"
                  style={{ filter: "drop-shadow(2px 2px 0 var(--pencil))" }}
                >
                  <span
                    className="block h-full w-full bg-paper p-[3px]"
                    style={{ clipPath: TORN_EDGES[d % TORN_EDGES.length] }}
                  >
                    <span className="relative block h-full w-full overflow-hidden">
                      <img
                        src={photo}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover vintage-photo"
                      />
                      <span className="pointer-events-none absolute inset-0 paper-noise mix-blend-multiply group-hover:opacity-0 transition-opacity" />
                    </span>
                  </span>
                  {/* washi tape on some photos */}
                  {d % 3 === 0 && (
                    <span className="absolute -top-1 left-1/2 h-2 w-5 -translate-x-1/2 -rotate-6 bg-postit/90" />
                  )}
                </motion.span>
              )}

              <span
                className={cn(
                  "absolute left-1 top-0.5 z-10 font-hand text-xs leading-none",
                  empty ? "text-pencil/30" : "text-pencil font-bold",
                )}
              >
                {format(day, "d")}
              </span>
              {isToday && (
                <svg aria-hidden viewBox="0 0 40 40" className="pointer-events-none absolute -left-1 -top-1.5 z-10 h-6 w-6 text-marker">
                  <path d="M20 6c-9 0-15 5-14 13 1 9 10 13 18 11 8-2 11-9 9-15C31 8 24 5 15 9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 font-hand text-sm text-pencil/70">
        <span>less</span>
        {["bg-paper", "bg-marker/30", "bg-marker/55", "bg-marker"].map((c, i) => (
          <span
            key={c}
            className={cn("h-4 w-4 border border-pencil/40", c)}
            style={{ clipPath: TORN_EDGES[i % TORN_EDGES.length], transform: `rotate(${TILTS[i]}deg)` }}
          />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}
