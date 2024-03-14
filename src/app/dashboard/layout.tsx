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
    <div className="relative w-full h-full flex flex-1">
      <Sidebar user={user} />
      <main className="relative min-h-full w-full p-2 rounded-sm">
        {children}
      </main>
    </div>
  );
}
