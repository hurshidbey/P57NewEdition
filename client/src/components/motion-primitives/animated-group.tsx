"use client";

import { motion } from "framer-motion";
import React from "react";

interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  variants?: any;
  initial?: string;
  animate?: string;
  exit?: string;
}

const defaultVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  },
};

export const AnimatedGroup: React.FC<AnimatedGroupProps> = ({
  children,
  className,
  variants = defaultVariants,
  initial = "hidden",
  animate = "visible",
  exit,
  ...props
}) => {
  return (
    <motion.div
      className={className}
      variants={variants.container || variants}
      initial={initial}
      animate={animate}
      exit={exit}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={variants.item || variants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};