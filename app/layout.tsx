// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura | Your Inner Companion",
  description: "A kind space for reflection, mindfulness, and mental well-being support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {/* Animated sophisticated mesh background */}
        <div className="aurora-bg" aria-hidden="true" />

        {/* Removed heavy noise overlay for a cleaner SaaS look, keeping subtle rendering */}
        <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'a\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23a)\'/%3E%3C/svg%3E")' }} />

        {/* Main content layer */}
        <div className="relative z-20 flex flex-col flex-grow min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}