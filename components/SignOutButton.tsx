"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="
        rounded-full
        border-2 border-blue-500
        bg-white
        px-5 py-2
        text-sm
        font-semibold
        text-blue-600
        shadow-sm
        transition
        hover:bg-blue-50
        hover:shadow-md
      "
    >
      Sign Out
    </button>
  );
}