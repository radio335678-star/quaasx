import { MarketingFooter, MarketingNav } from "@/components/marketing/site-chrome";
import { Toaster } from "sonner";

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
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          className:
            "!bg-card !text-foreground !border-border/50 !shadow-[var(--shadow-float)]",
        }}
      />
    </div>
  );
}
