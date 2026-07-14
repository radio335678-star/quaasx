import { motion } from "framer-motion";
import Image from "next/image";
import { brand } from "@/lib/brand";

export const Greeting = () => (
  <div className="flex flex-col items-center px-4" key="overview">
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image
        alt={brand.name}
        className="size-12 rounded-xl"
        height={48}
        priority
        src={brand.mark}
        width={48}
      />
    </motion.div>
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="text-center font-semibold text-2xl tracking-tight text-foreground md:text-3xl"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {brand.greeting}
    </motion.div>
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 text-center text-muted-foreground/80 text-sm"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {brand.greetingSubtitle}
    </motion.div>
    <motion.p
      animate={{ opacity: 1 }}
      className="mt-6 max-w-md text-center text-[11px] text-muted-foreground/50"
      initial={{ opacity: 0 }}
      transition={{ delay: 0.7, duration: 0.4 }}
    >
      {brand.disclaimer}
    </motion.p>
  </div>
);
