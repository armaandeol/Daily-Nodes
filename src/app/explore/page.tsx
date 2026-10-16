import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchLatestDigest, type DigestPhoto } from "./actions";

const SECTION_TITLES = {
  morning: { lead: "Yesterday's Roz", circle: "The Circle", pivot: "The Pivot" },
  night: { lead: "Today's Tapestry", circle: "Echoes from the Circle", pivot: "For Tomorrow" },
} as const;

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PhotoFrame({ photo, className = "" }: { photo: DigestPhoto; className?: string }) {
  return (
    <figure className={className}>
      <div className="aspect-[4/3] w-full overflow-hidden border-2 border-neutral-900 bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || "Today's front page photo"}
          className="h-full w-full object-cover grayscale"
        />
      </div>
      {photo.caption && (
        <figcaption className="mt-2 border-l-2 border-neutral-900 pl-3 font-serif text-sm italic text-neutral-600">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-neutral-900 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      <p className="mt-1 font-serif text-2xl font-black leading-none">{value}</p>
    </div>
  );
}

export default async function ExplorePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const digest = await fetchLatestDigest();

  if (!digest) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-6 text-center text-neutral-900">
        <span className="font-serif text-3xl font-black tracking-tight">ROZ DAILY</span>
        <p className="mt-4 max-w-sm font-mono text-sm text-neutral-500">
          No edition today yet. Log a few things and check back — the front page writes itself
          once there's a day to report on.
        </p>
      </main>
    );
  }

  const slot = digest.slot === "morning" ? "morning" : "night";
  const titles = SECTION_TITLES[slot];
  const edition = slot === "morning" ? "Morning Edition" : "Evening Edition";

  return (
    <main className="min-h-screen bg-[#faf8f5] text-neutral-900 selection:bg-red-600 selection:text-white">
      {/* ── Masthead ─────────────────────────────────── */}
      <header className="border-y-4 border-double border-neutral-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center">
          <span className="font-serif text-4xl font-black tracking-tight md:text-5xl">
            ROZ DAILY
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            <span>{edition}</span>
            <span className="h-3 w-px bg-neutral-300" />
            <span>{formatDate(digest.date_start)}</span>
            {digest.stats && (
              <>
                <span className="h-3 w-px bg-neutral-300" />
                <span className="flex items-center gap-1.5 font-semibold text-neutral-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  {digest.stats.streak} day streak
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Stats strip ──────────────────────────────── */}
      {digest.stats && (
        <section className="border-b-2 border-neutral-900 bg-[#faf8f5]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-neutral-900 md:grid-cols-4">
            <div className="bg-[#faf8f5]">
              <StatBox label="Logs Today" value={digest.stats.logs_today} />
            </div>
            <div className="bg-[#faf8f5]">
              <StatBox label="Streak" value={`${digest.stats.streak}d`} />
            </div>
            <div className="bg-[#faf8f5]">
              <StatBox label="Most Active" value={digest.stats.most_active_hour ?? "—"} />
            </div>
            <div className="bg-[#faf8f5]">
              <StatBox label="Top Log Type" value={digest.stats.top_log_type ?? "—"} />
            </div>
          </div>
        </section>
      )}

      {/* ── Lead story ───────────────────────────────── */}
      <section className="border-b-2 border-neutral-900">
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-12 md:py-16">
          <div className={digest.photo ? "col-span-12 md:col-span-7" : "col-span-12"}>
            <p className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.3em] text-red-600">
              {titles.lead}
            </p>
            {digest.headline && (
              <h1 className="mb-6 font-serif text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
                {digest.headline}
              </h1>
            )}
            {digest.tapestry && (
              <p className="font-mono text-sm leading-relaxed text-neutral-700 md:text-base">
                {digest.tapestry}
              </p>
            )}
          </div>

          {digest.photo && (
            <div className="col-span-12 md:col-span-5">
              <PhotoFrame photo={digest.photo} />
            </div>
          )}
        </div>
      </section>

      {/* ── Pull quote ───────────────────────────────── */}
      {digest.pull_quote && (
        <section className="border-b-2 border-neutral-900 bg-neutral-900 text-[#faf8f5]">
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
            <p className="font-serif text-2xl font-black leading-tight tracking-tight md:text-4xl">
              &ldquo;{digest.pull_quote}&rdquo;
            </p>
          </div>
        </section>
      )}

      {/* ── Circle / Invite ──────────────────────────── */}
      <section className="border-b-2 border-neutral-900">
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-12 md:py-16">
          {digest.has_circle ? (
            <>
              <div className={digest.circle_photo ? "col-span-12 md:col-span-7" : "col-span-12"}>
                <p className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.3em] text-red-600">
                  {titles.circle}
                </p>
                {digest.circle_headline && (
                  <h2 className="mb-4 font-serif text-2xl font-black leading-tight tracking-tight md:text-3xl">
                    {digest.circle_headline}
                  </h2>
                )}
                <p className="font-mono text-sm leading-relaxed text-neutral-700 md:text-base">
                  {digest.circle ?? "The Circle was quiet today — nothing shared, nothing to report."}
                </p>
              </div>
              {digest.circle_photo && (
                <div className="col-span-12 md:col-span-5">
                  <PhotoFrame photo={digest.circle_photo} />
                </div>
              )}
            </>
          ) : (
            <div className="col-span-12 md:col-span-8 md:col-start-3">
              <div className="border-2 border-dashed border-neutral-900 px-8 py-10 text-center">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-red-600">
                  Classified
                </p>
                <p className="mt-3 font-serif text-2xl font-black tracking-tight md:text-3xl">
                  Wanted: A Circle
                </p>
                <p className="mx-auto mt-3 max-w-md font-mono text-sm leading-relaxed text-neutral-600">
                  This page runs quieter without one. Invite a friend to Roz and tomorrow&apos;s
                  edition gets a second voice.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Pivot ────────────────────────────────────── */}
      {digest.pivot && (
        <section className="bg-[#faf8f5]">
          <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
            <div className="border-2 border-dashed border-neutral-900 px-6 py-8 md:px-10 md:py-10">
              <p className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.3em] text-red-600">
                {titles.pivot}
              </p>
              <p className="max-w-3xl font-serif text-2xl font-black leading-snug tracking-tight md:text-4xl">
                {digest.pivot}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t-4 border-double border-neutral-900 py-10 text-center">
        <span className="font-serif text-3xl font-black tracking-tighter">ROZ</span>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-neutral-400">
          Daily, in Punjabi.
        </p>
      </footer>
    </main>
  );
}
