import "./globals.css";

import { Geist, Geist_Mono, Inter } from "next/font/google";

import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { THEME_INIT_SCRIPT } from "@/features/theme/model/theme";
import { cn } from "@/shared/lib/cn";
import { SiteFooter } from "@/shared/ui/site-footer";

import { Providers } from "./providers";
import { SiteNav } from "./site-nav";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Commit & Ship",
    template: "%s · Commit & Ship",
  },
  description: "Novedades de desarrollo de software, sin ruido.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(geist.variable, geistMono.variable, inter.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
        <NuqsAdapter>
          <Providers>
            <SiteNav />
            {children}
            <SiteFooter />
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
