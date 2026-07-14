"use client";

import Image from "next/image";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Ai2Mark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    // SVG mark — plain img avoids Next image SVG restrictions
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={brand.name}
      className={cn("shrink-0 rounded-md", className)}
      height={size}
      src={brand.mark}
      width={size}
    />
  );
}

export function Ai2Logo({
  className,
  width = 280,
  height = 160,
  priority = false,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      alt={`${brand.name} — ${brand.tagline}`}
      className={cn("h-auto w-full object-contain", className)}
      height={height}
      priority={priority}
      src={brand.logo}
      width={width}
    />
  );
}
