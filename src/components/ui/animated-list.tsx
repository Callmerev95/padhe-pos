"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

type AnimatedListProps = {
  children: ReactNode;
  stagger?: number;
  className?: string;
};

export function AnimatedList({
  children,
  stagger = 0.08,
  className,
}: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      layout                     // 🔥 penting untuk pagination
      initial={false}            // 🔥 TIDAK reset ke hidden
      animate="show"
      variants={{
        show: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
