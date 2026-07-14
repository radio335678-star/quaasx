import { motion } from "framer-motion";
import Image from "next/image";
import { brand } from "@/lib/brand";

export const Greeting = () => (
  <div
    className="flex flex-col items-center px-1"
    data-testid="greeting"
    key="overview"
  >
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image
        alt={brand.name}
        className="size-11 rounded-xl sm:size-12"
        height={48}
        priority
        src={brand.mark}
        width={48}
      />
    </motion.div>
    <motion.h1
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[20ch] text-center font-semibold text-xl leading-tight tracking-tight text-foreground sm:max-w-none sm:text-2xl md:text-3xl"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {brand.greeting}
    </motion.h1>
    <motion.p
      animate={{ opacity: 1, y: 0 }}
      className="mt-2.5 max-w-md text-center text-muted-foreground/85 text-sm leading-relaxed"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.35, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {brand.greetingSubtitle}
    </motion.p>
    <motion.p
      animate={{ opacity: 1 }}
      className="mt-3 max-w-sm text-center text-[11px] leading-relaxed text-muted-foreground/45"
      initial={{ opacity: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      {brand.disclaimer}
    </motion.p>
  </div>
);
