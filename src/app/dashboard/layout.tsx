import type { Metadata } from "next";
import Sidebar from "~/components/custom/sidebar";
import { validateRequest } from "~/lib/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

export const metadata: Metadata = {
  title: "Timeline Dashboard",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/");
  }
  return (
    <div className="relative flex h-full w-full max-w-full">
      <Sidebar user={user} />
      <main className="relative max-h-full min-h-full min-w-0  flex-1 overflow-hidden rounded-sm p-2">
        {children}
      </main>
    </div>
  );
}
