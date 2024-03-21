import type { Metadata } from "next";
import Sidebar from "~/components/custom/sidebar";
import { validateRequest } from "~/lib/auth";
import { redirect } from "next/navigation";

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
    <div className="relative w-full max-w-full h-full flex">
      <Sidebar user={user} />
      <main className="relative min-h-full max-h-full min-w-0  flex-1 p-2 rounded-sm overflow-hidden">
        {children}
      </main>
    </div>
  );
}
