import Image from "next/image";
import Link from "next/link";
import { brand, navLinks } from "@/lib/brand";

export function MarketingNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link className="flex items-center gap-2.5" href="/">
          {/* SVG mark — use img to avoid Next Image SVG restrictions */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={brand.name}
            className="size-8 rounded-lg"
            height={32}
            src={brand.mark}
            width={32}
          />
          <span className="sr-only">{brand.name}</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              className="text-muted-foreground text-sm transition-colors hover:text-foreground"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
            href={brand.appPath}
          >
            Open {brand.name}
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              className="text-muted-foreground text-xs"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground text-sm"
            href={brand.appPath}
          >
            Open
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/40 bg-[#050505]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image
            alt={brand.company}
            className="h-8 w-auto max-w-[180px] object-contain opacity-80"
            height={32}
            src={brand.companyWordmark}
            style={{ width: "auto", height: "2rem" }}
            width={180}
          />
        </div>
        <div className="flex flex-col gap-1 text-muted-foreground text-sm md:items-end">
          <p>
            {brand.name} · {brand.fullName}
          </p>
          <p className="text-xs">
            {brand.company}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
