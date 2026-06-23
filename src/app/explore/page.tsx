import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const digest = {
  user: "Armaan",
  date: "Friday, June 13",
  edition: "Evening Edition",
  streak: 14,
  sections: [
    {
      kicker: "01",
      title: "Today's Tapestry",
      body: `Armaan's day felt like a series of fragmented thoughts, with social invites, study plans, and a dash of physical activity all vying for attention. Despite the scattered nature of the logs, there's a sense of warmth in the "yeah count me in" and the promise of bringing cupcakes, which suggests a desire to connect with others. The "Too tired!" log, however, hints at a possible energy crash, which might have derailed some of the planned activities. It's a day that didn't quite come together as a cohesive whole, but there are glimpses of Armaan's social and generous side.`,
    },
    {
      kicker: "02",
      title: "Echoes from the Circle",
      body: `The defining group moment today was ropolo singh's enthusiastic reaction to Armaan's cupcakes offer, which added a spark of excitement to the day. This exchange also highlights Armaan's willingness to engage with their social circle, even if the rest of the day felt disjointed. The back-and-forth about the game night at ropolo's place underscores the social connections that are important to Armaan, and suggests that these relationships might be a source of energy and motivation.`,
    },
  ],
  pivot: `What will it take to turn today's fragmented plans into concrete actions — and will you find a way to balance your social commitments with your own energy levels, perhaps by tackling the "Too tired!" issue head-on?`,
};

export default async function ExplorePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] text-neutral-900 selection:bg-red-600 selection:text-white">
      {/* ── Masthead ─────────────────────────────────── */}
      <header className="border-b-2 border-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="text-2xl font-black tracking-tight">ROZ</span>

          <div className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 md:flex">
            <span>{digest.edition}</span>
            <span className="h-3 w-px bg-neutral-300" />
            <span>{digest.date}</span>
          </div>

          <span className="flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {digest.streak} day streak
          </span>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16 md:pt-24">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-7">
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.3em] text-red-600">
              The Daily Digest
            </p>

            <h1 className="text-6xl font-black leading-[0.95] tracking-tighter md:text-8xl">
              Good
              <br />
              evening,
              <br />
              <span className="text-red-600">{digest.user}.</span>
            </h1>
          </div>

          <div className="col-span-12 flex flex-col justify-end md:col-span-5">
            <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-900">
              <img
                src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=80"
                alt="Editorial"
                className="h-full w-full object-cover grayscale transition duration-700 hover:grayscale-0"
              />
            </div>

            <p className="mt-3 text-xs uppercase tracking-widest text-neutral-400">
              Fig. 01 — a scattered, generous day
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 01 ──────────────────────────────── */}
      <section className="border-t-2 border-neutral-900">
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-16 md:py-24">
          <div className="col-span-12 md:col-span-2">
            <span className="text-7xl font-black leading-none text-red-600 md:text-8xl">
              01
            </span>
          </div>

          <div className="col-span-12 md:col-span-6">
            <h2 className="mb-6 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Today's
              <br />
              Tapestry
            </h2>

            <p className="text-lg leading-relaxed text-neutral-700 md:text-xl">
              {digest.sections[0].body}
            </p>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="aspect-square w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=700&q=80"
                alt="Cupcakes"
                className="h-full w-full object-cover grayscale"
              />
            </div>

            <p className="mt-3 border-l-2 border-red-600 pl-3 text-sm italic text-neutral-500">
              "yeah count me in" — and cupcakes were promised.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pull Quote ──────────────────────────────── */}
      <section className="bg-neutral-900 text-[#faf8f5]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <p className="text-3xl font-black leading-tight tracking-tight md:text-5xl">
            A day that didn't quite come together as a cohesive whole —{" "}
            <span className="text-red-500">
              but glimpses of a social, generous side.
            </span>
          </p>
        </div>
      </section>

      {/* ── Section 02 ──────────────────────────────── */}
      <section>
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-16 md:py-24">
          <div className="order-2 col-span-12 md:order-1 md:col-span-4">
            <div className="aspect-[3/4] w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=700&q=80"
                alt="Circle"
                className="h-full w-full object-cover grayscale"
              />
            </div>

            <p className="mt-3 text-xs uppercase tracking-widest text-neutral-400">
              Fig. 02 — game night at ropolo's
            </p>
          </div>

          <div className="order-1 col-span-12 md:order-2 md:col-span-2" />

          <div className="order-3 col-span-12 md:col-span-6">
            <span className="text-7xl font-black leading-none text-red-600 md:text-8xl">
              02
            </span>

            <h2 className="mb-6 mt-4 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Echoes from
              <br />
              the Circle
            </h2>

            <p className="text-lg leading-relaxed text-neutral-700 md:text-xl">
              {digest.sections[1].body}
            </p>
          </div>
        </div>
      </section>

      {/* ── Pivot ───────────────────────────────────── */}
      <section className="border-t-2 border-neutral-900 bg-red-600 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="mb-8 text-sm font-bold uppercase tracking-[0.3em] text-white/70">
            For Tomorrow — The Pivot
          </p>

          <p className="max-w-4xl text-3xl font-black leading-snug tracking-tight md:text-5xl">
            {digest.pivot}
          </p>

          <div className="mt-12 h-px w-full bg-white/30" />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-widest text-white/70">
            <span>Roz — {digest.date}</span>
            <span>One honest observation a day</span>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="bg-[#faf8f5] py-12 text-center">
        <span className="text-4xl font-black tracking-tighter">ROZ</span>

        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
          Daily, in Punjabi.
        </p>
      </footer>
    </main>
  );
}