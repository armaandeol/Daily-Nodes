import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { fetchDigestEditions, type DigestPhoto } from "./actions";
import { fetchUserProfile } from "../home/actions";
import { editionHistory } from "./edition-history";
import { Tape, Tack, Scribble, ScribbleArrow } from "@/components/sketch";
import { DropIn, EditionSlide } from "./EditionMotion";

export const metadata = { title: "Roz — Your editions", description: "Read your daily Roz digest and revisit earlier editions.", openGraph: { title: "Roz — Your editions", description: "Read your daily Roz digest and revisit earlier editions.", type: "website" }, twitter: { card: "summary" } };

const SECTION_TITLES = {
  morning: { lead: "Yesterday's Roz", circle: "The Circle", pivot: "The Pivot" },
  night: { lead: "Today's Tapestry", circle: "Echoes from the Circle", pivot: "For Tomorrow" },
} as const;

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function Stamp({ children }: { children: ReactNode }) {
  return (
    <span className="mb-4 inline-block -rotate-2 border-[3px] border-double border-marker/80 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.3em] text-marker/90 opacity-90 wobbly-sm">
      {children}
    </span>
  );
}

function Polaroid({ photo, tilt = 2 }: { photo: DigestPhoto; tilt?: number }) {
  return (
    <figure className="relative mx-auto max-w-md border-2 border-pencil bg-card p-3 pb-4 shadow-hard transition-transform hover:rotate-0" style={{ rotate: `${tilt}deg` }}>
      <Tape />
      <div className="relative aspect-[4/3] w-full overflow-hidden border border-pencil/30 bg-erased">
        <Image
          src={photo.url}
          alt={photo.caption || "Today's front page photo"}
          fill
          sizes="(min-width: 768px) 448px, 100vw"
          className="vintage-photo object-cover"
        />
      </div>
      {photo.caption && <figcaption className="mt-3 text-center font-hand text-lg leading-snug text-pencil">{photo.caption}</figcaption>}
    </figure>
  );
}

const STUB_TILTS = [-2, 1.5, -1, 2];

function StatStub({ label, value, i }: { label: string; value: string | number; i: number }) {
  return (
    <div className="border-2 border-dashed border-pencil bg-card px-4 py-3 shadow-hard-sm wobbly-md" style={{ rotate: `${STUB_TILTS[i]}deg` }}>
      <p className="font-hand text-base text-pencil/70">{label}</p>
      <p className="mt-1 font-serif text-3xl font-black leading-none">{value}</p>
    </div>
  );
}

function NavButton({ href, label, children }: { href?: object | string; label?: string; children: ReactNode }) {
  const base = "border-2 px-3 py-1 font-note text-lg wobbly";
  if (!href) return <span aria-disabled="true" className={`${base} border-pencil/20 text-pencil/30 line-through decoration-pencil/20`}>{children}</span>;
  return <Link href={href as never} aria-label={label} className={`${base} border-pencil bg-card text-pencil shadow-hard-sm transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`}>{children}</Link>;
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ edition?: string; date?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const [{ edition: selectedEdition, date: selectedDate }, digests, user, profile] = await Promise.all([searchParams, fetchDigestEditions(), currentUser(), fetchUserProfile().catch(() => null)]);
  const { digest, older, newer } = editionHistory(digests, selectedEdition, selectedDate);
  const avatarUrl = profile?.avatar_signed_url || profile?.avatar_url || user?.imageUrl;

  const navigation = (
    <nav aria-label="Edition navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
      <Link href="/home" className="font-note text-lg text-ink">← home</Link>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <NavButton href={older ? { pathname: "/explore", query: { edition: older.id } } : undefined} label="Older edition">← older</NavButton>
        <NavButton href="/explore">latest</NavButton>
        <NavButton href={newer ? { pathname: "/explore", query: { edition: newer.id } } : undefined} label="Newer edition">newer →</NavButton>
      </div>
      <Link href="/profile" aria-label="Profile" className="relative block h-12 w-12 rotate-3 border-2 border-pencil bg-card p-1 shadow-hard-sm">
        <Tape className="!h-3 !w-8 !-top-2" />
        <span className="flex h-full w-full items-center justify-center overflow-hidden bg-erased">
          {avatarUrl ? <Image src={avatarUrl} alt="Profile" width={48} height={48} className="h-full w-full object-cover" /> : <span className="font-hand">{user?.firstName?.[0] || "U"}</span>}
        </span>
      </Link>
    </nav>
  );

  if (!digest) {
    return (
      <main className="min-h-screen bg-paper paper-grain text-pencil">
        {navigation}
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <DropIn className="relative max-w-sm -rotate-1 border-2 border-pencil bg-postit px-8 py-8 shadow-hard wobbly-md">
            <Tack />
            <span className="font-serif text-4xl font-black">Roz.</span>
            <p className="mt-3 font-hand text-xl">
              {selectedDate ? "No digest was generated for that day." : selectedEdition ? "This edition isn't available. Head back to the latest one." : "No edition yet. Log a few things and check back."}
            </p>
            <Link href="/home" className="mt-4 inline-flex items-center gap-2 font-note text-lg text-ink">
              <ScribbleArrow className="h-8 w-12 -scale-x-100 text-ink" /> back home
            </Link>
          </DropIn>
        </div>
      </main>
    );
  }

  const slot = digest.slot === "morning" ? "morning" : "night";
  const titles = SECTION_TITLES[slot];
  const edition = slot === "morning" ? "Morning Edition" : "Evening Edition";
  let i = 0;

  return (
    <main className="min-h-screen bg-paper paper-grain pb-16 text-pencil selection:bg-marker selection:text-card">
      {navigation}
      <EditionSlide editionKey={digest.id}>
        {/* Masthead */}
        <DropIn index={i++}>
          <header className="mx-auto max-w-6xl border-y-4 border-double border-pencil px-6 py-6 text-center">
            <span className="font-serif text-5xl font-black tracking-tight md:text-6xl">Roz.</span>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-pencil/60">
              <span>{edition}</span>
              <span aria-hidden>·</span>
              <span>{formatDate(digest.date_start)}</span>
              {digest.stats && (
                <span className="relative ml-2 inline-flex items-center gap-1 rounded-full border-2 border-marker px-3 py-0.5 font-semibold text-pencil" style={{ rotate: "-3deg" }}>
                  ★ {digest.stats.streak} day streak
                </span>
              )}
            </div>
          </header>
        </DropIn>

        {/* Stats */}
        {digest.stats && (
          <DropIn index={i++} className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-5 px-6 md:grid-cols-4">
            <StatStub i={0} label="logs today" value={digest.stats.logs_today} />
            <StatStub i={1} label="streak" value={`${digest.stats.streak}d`} />
            <StatStub i={2} label="most active" value={digest.stats.most_active_hour ?? "—"} />
            <StatStub i={3} label="top log type" value={digest.stats.top_log_type ?? "—"} />
          </DropIn>
        )}

        {/* Lead story */}
        <DropIn index={i++}>
          <section className="mx-auto grid max-w-6xl grid-cols-12 gap-8 border-b-2 border-dashed border-pencil/40 px-6 py-12 md:py-16">
            <div className={digest.photo ? "col-span-12 md:col-span-7" : "col-span-12"}>
              <Stamp>{titles.lead}</Stamp>
              {digest.headline && (
                <h1 className="mb-6 font-serif text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
                  {digest.headline}
                  <Scribble className="mt-2 block h-3 w-48" />
                </h1>
              )}
              {digest.tapestry && <p className="font-note text-lg leading-relaxed text-pencil/85 md:text-xl">{digest.tapestry}</p>}
            </div>
            {digest.photo && (
              <div className="col-span-12 md:col-span-5">
                <Polaroid photo={digest.photo} tilt={2} />
              </div>
            )}
          </section>
        </DropIn>

        {/* Pull quote */}
        {digest.pull_quote && (
          <DropIn index={i++} className="mx-auto max-w-3xl px-6 py-14">
            <blockquote className="relative -rotate-1 border-2 border-pencil bg-postit px-8 py-10 shadow-hard-lg wobbly-md md:px-12">
              <Tack />
              <span aria-hidden className="absolute left-3 top-1 font-serif text-6xl text-marker">“</span>
              <p className="font-hand text-2xl leading-snug md:text-3xl">{digest.pull_quote}</p>
              <span aria-hidden className="absolute bottom-0 right-4 font-serif text-6xl text-marker">”</span>
            </blockquote>
          </DropIn>
        )}

        {/* Circle */}
        <DropIn index={i++}>
          <section className="mx-auto grid max-w-6xl grid-cols-12 gap-8 border-b-2 border-dashed border-pencil/40 px-6 py-12 md:py-16">
            {digest.has_circle ? (
              <>
                <div className={digest.circle_photo ? "col-span-12 md:col-span-7" : "col-span-12"}>
                  <Stamp>{titles.circle}</Stamp>
                  {digest.circle_headline && <h2 className="mb-4 font-serif text-2xl font-black leading-tight md:text-4xl">{digest.circle_headline}</h2>}
                  <p className="font-note text-lg leading-relaxed text-pencil/85">{digest.circle ?? "The Circle was quiet today — nothing shared, nothing to report."}</p>
                </div>
                {digest.circle_photo && (
                  <div className="col-span-12 md:col-span-5">
                    <Polaroid photo={digest.circle_photo} tilt={-2} />
                  </div>
                )}
              </>
            ) : (
              <div className="relative col-span-12 md:col-span-8 md:col-start-3">
                <div className="relative rotate-1 border-2 border-dashed border-pencil bg-card px-8 py-10 text-center shadow-hard wobbly-md">
                  <Tape />
                  <Stamp>Classified</Stamp>
                  <p className="font-serif text-3xl font-black">Wanted: A Circle</p>
                  <p className="mx-auto mt-3 max-w-md font-hand text-lg">This page runs quieter without one. Invite a friend to Roz and tomorrow&apos;s edition gets a second voice.</p>
                </div>
                <ScribbleArrow className="absolute -bottom-10 -left-4 hidden h-14 w-20 text-ink md:block" />
              </div>
            )}
          </section>
        </DropIn>

        {/* Pivot */}
        {digest.pivot && (
          <DropIn index={i++} className="mx-auto max-w-4xl px-6 py-12">
            <div
              className="relative -rotate-[0.5deg] border-2 border-pencil bg-card py-8 pl-14 pr-8 shadow-hard"
              style={{ backgroundImage: "repeating-linear-gradient(transparent 0 31px, color-mix(in oklab, var(--ink) 18%, transparent) 31px 32px)" }}
            >
              <span aria-hidden className="absolute bottom-0 left-10 top-0 w-[2px] bg-marker/60" />
              <Stamp>{titles.pivot}</Stamp>
              <p className="font-hand text-2xl leading-[32px] text-ink md:text-3xl md:leading-[40px]">{digest.pivot}</p>
            </div>
          </DropIn>
        )}

        <footer className="mx-auto mt-6 max-w-6xl border-t-4 border-double border-pencil pt-8 text-center">
          <span className="font-serif text-3xl font-black">Roz.</span>
        </footer>
      </EditionSlide>
    </main>
  );
}
