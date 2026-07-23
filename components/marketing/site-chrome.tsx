"use client";

import Image from "next/image";
import Link from "next/link";
import { Ai2AccessMenu, Ai2OpenCta } from "@/components/brand/Ai2AccessMenu";
import { brand, navLinks } from "@/lib/brand";

export function MarketingNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Ai2AccessMenu
          className="rounded-lg"
          imgClassName="size-8 rounded-lg"
          size={32}
        />

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
          <Ai2OpenCta align="end" variant="nav" />
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
          <Ai2OpenCta label="Open" variant="navMobile" />
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
