"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { joinGroupByToken } from "./actions";

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function handleJoin() {
      if (!token) {
        setStatus("error");
        setMessage("Invalid invite link");
        return;
      }

      try {
        const result = await joinGroupByToken(token);
        setStatus("success");
        setMessage(result.message || "Successfully joined the group!");
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Failed to join group");
      }
    }

    handleJoin();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 max-w-md w-full">
        <div className="flex flex-col items-center gap-6 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-semibold text-neutral-900">Joining Group...</h1>
                <p className="text-sm text-neutral-500">Please wait while we process your invite</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-semibold text-neutral-900">Success!</h1>
                <p className="text-sm text-neutral-600">{message}</p>
                <p className="text-xs text-neutral-400 mt-2">Redirecting to home...</p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
                <span className="text-3xl">✕</span>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-semibold text-neutral-900">Unable to Join</h1>
                <p className="text-sm text-neutral-600">{message}</p>
              </div>
              <button
                onClick={() => router.push("/home")}
                className="mt-4 px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Go to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
