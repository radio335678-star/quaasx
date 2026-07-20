import type { Metadata } from "next";
import { WebXThemeReset } from "@/components/web-x/webx-theme-reset";

export const metadata: Metadata = {
  title: "Web-X-AI² Search",
  description:
    "Web-X-AI² — open-web search with stealth fetch and AI Mode answers.",
};

export default function WebXLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WebXThemeReset />
      {children}
    </>
  );
}
