import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ExplorePage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <main className="min-h-screen max-w-[680px] mx-auto px-6 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between pt-7 pb-5 border-b border-neutral-200">
        <Link href="/home" className="text-sm font-semibold tracking-wide text-neutral-900 hover:text-neutral-600 transition-colors">
          daily nodes
        </Link>
      </header>

      {/* Main content */}
      <section className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <span className="text-6xl">🌿</span>
        <h1 className="text-3xl font-light tracking-tight text-neutral-900">explore</h1>
        <p className="text-sm text-neutral-400">nothing to see here yet — check back soon.</p>
      </section>
    </main>
  );
}
