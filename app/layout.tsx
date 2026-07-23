import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_Devanagari } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { brand } from "@/lib/brand";
import { buildPageMetadata, siteJsonLd, SITE_URL } from "@/lib/seo";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { AccessRoleProvider } from "@/hooks/use-access-role";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: brand.title,
    description: brand.description,
    path: "/",
  }),
  icons: {
    icon: [
      { url: "/brand/ai2-mark.svg", type: "image/svg+xml" },
      { url: "/brand/ai2-logo.png", type: "image/png" },
    ],
    apple: "/brand/ai2-logo.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const notoDevanagari = Noto_Serif_Devanagari({
  display: "swap",
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
});

const LIGHT_THEME_COLOR = "#f7f7f7";
const DARK_THEME_COLOR = "#0a0a0a";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = siteJsonLd();

  return (
    <html
      className={`${geist.variable} ${geistMono.variable} ${notoDevanagari.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link href={`${SITE_URL}/llms.txt`} rel="llms-txt" />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: theme color bootstrap
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD for Google
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
          type="application/ld+json"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <SessionProvider
            basePath={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth`}
          >
            <AccessRoleProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </AccessRoleProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
