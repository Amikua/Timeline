import "~/styles/globals.css";

import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { ThemeProvider } from "~/components/ui/theme-provider";

const inter = Open_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timeline",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground dark:dark`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      </body>
    </html >
  );
}
