"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";

export default function HomePage() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,200,200,0.06)_0%,_transparent_55%)]"
      />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          alt={`${brand.name} — ${brand.tagline}`}
          className="mb-10 h-auto w-full max-w-md object-contain drop-shadow-[0_20px_60px_rgba(255,255,255,0.06)]"
          height={220}
          priority
          src={brand.logo}
          width={420}
        />

        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-3xl tracking-tight text-foreground md:text-5xl"
          initial={{ opacity: 0, y: 12 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {brand.headline}
        </motion.h1>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg"
          initial={{ opacity: 0, y: 12 }}
          transition={{ delay: 0.28, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {brand.equation}
        </motion.p>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          transition={{ delay: 0.42, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
            href={brand.appPath}
          >
            Open {brand.name}
          </Link>
          <Link
            className="rounded-md border border-border/60 px-6 py-3 font-medium text-foreground text-sm transition-colors hover:border-border hover:bg-white/5"
            href="/product"
          >
            See the Engine
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
