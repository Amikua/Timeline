"use client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function GithubLoginButton() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  return (
    <div className="flex h-20 w-48 items-center justify-center rounded-2xl bg-zinc-900">
      {isSigningIn ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        <a
          href="/login/github"
          className="text-lg"
          onClick={() => setIsSigningIn(true)}
        >
          Sign in with GitHub
        </a>
      )}
    </div>
  );
}
