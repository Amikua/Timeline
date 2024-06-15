import "~/styles/globals.css";

import type { Metadata } from "next";
import { Chivo, Judson, Open_Sans } from "next/font/google";
import { ThemeProvider } from "~/components/ui/theme-provider";

const inter = Open_Sans({
  subsets: ["latin"],
});

const judson = Judson({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-judson",
  weight: "400",
});

const chivo = Chivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-chivo",
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
      <body
        className={`${inter.className + '' + judson.variable + '' + chivo.variable} dark:dark bg-background text-foreground font-[Inter]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
