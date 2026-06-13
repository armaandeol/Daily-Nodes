import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NodeFeed from "./NodeFeed";
import GroupManager from "./GroupManager";
import { fetchUserProfile } from "./actions";

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

  return (
    <main className="min-h-screen max-w-[680px] mx-auto px-6 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between pt-7 pb-5 border-b border-neutral-200">
        <span className="text-sm font-semibold tracking-wide text-neutral-900">daily nodes</span>
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 border border-neutral-200 hover:border-neutral-400 transition-all flex items-center justify-center cursor-pointer shadow-sm"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-xs font-semibold text-neutral-600">{initials}</div>
          )}
        </Link>
      </header>

      {/* Main content */}
      <section className="flex-1 flex flex-col pt-12 pb-8 gap-8">
        <div className="flex flex-col gap-1">
          <p className="text-xs tracking-widest uppercase text-neutral-400">today</p>
          <h1 className="text-3xl font-light tracking-tight text-neutral-900">good morning.</h1>
          <p className="text-sm text-neutral-500 mt-1">your space is ready. start logging.</p>
        </div>

        <GroupManager />
        <NodeFeed />
      </section>
    </main>
  );
}

