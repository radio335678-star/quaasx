import { MarketingFooter, MarketingNav } from "@/components/marketing/site-chrome";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-dvh bg-[#0a0a0a] text-foreground">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
