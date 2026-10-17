import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NodeFeed from "./NodeFeed";
import GroupManager from "./GroupManager";
import HomeGreeting from "./HomeGreeting";
import { fetchUserProfile, fetchUserGroup } from "./actions";
import { PageMotion } from "@/components/sketch/PageMotion";

export const metadata = { title: "Roz — Your day", description: "Your moments, notes, and photos in Roz.", openGraph: { title: "Roz — Your day", description: "Your moments, notes, and photos in Roz.", type: "website" }, twitter: { card: "summary" } };

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  let avatarUrl = "";
  try {
    const profile = await fetchUserProfile();
    avatarUrl = profile?.avatar_signed_url || profile?.avatar_url || "";
  } catch (e) {
    console.error("Failed to fetch profile in homepage:", e);
  }

  const user = await currentUser();
  if (!avatarUrl && user) {
    avatarUrl = user.imageUrl || "";
  }
  const initials = (user?.firstName?.[0] || "U").toUpperCase();
  const firstName = (user?.firstName || "").toLowerCase();

  let groupData = null;
  try {
    groupData = await fetchUserGroup();
  } catch (e) {
    console.error("Failed to fetch group in homepage:", e);
  }

  return (
    <div className="min-h-screen paper-grain text-pencil selection:bg-marker selection:text-card">
      <main className="mx-auto flex min-h-screen max-w-[760px] flex-col px-5">
        {/* Masthead */}
        <header className="mt-6 border-y-4 border-double border-pencil py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/explore" className="font-note text-lg text-pencil/70 transition-colors hover:text-marker">
              explore ↗
            </Link>
            <span className="font-serif text-2xl font-black tracking-tight sm:text-3xl">
              Roz<span className="text-marker">.</span>
            </span>
            <Link
              href="/profile"
              aria-label="Profile"
              className="flex h-10 w-10 items-center justify-center overflow-hidden border-2 border-pencil bg-erased shadow-hard-sm transition-transform hover:-rotate-6 wobbly"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="font-hand text-sm font-bold">{initials}</span>
              )}
            </Link>
          </div>
        </header>

        <PageMotion className="flex flex-1 flex-col gap-8 pb-16 pt-10">
          <HomeGreeting firstName={firstName} />
          <GroupManager initialGroup={groupData} />
          <NodeFeed groupData={groupData} />
        </PageMotion>

        <footer className="border-t-2 border-dashed border-pencil/30 py-5 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-pencil/50">
          Roz · one page a day
        </footer>
      </main>
    </div>
  );
}
