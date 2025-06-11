"use client";

import { motion } from "framer-motion";
import React from "react";

interface TextEffectProps {
  children: React.ReactNode;
  per?: "word" | "char" | "line";
  as?: React.ElementType;
  variants?: any;
  className?: string;
  preset?: "fade-in" | "fade-in-blur" | "slide-up" | "slide-down";
  delay?: number;
  duration?: number;
  speedSegment?: number;
}

const defaultVariants = {
  "fade-in": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  "fade-in-blur": {
    initial: { opacity: 0, filter: "blur(12px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
  },
  "slide-up": {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  "slide-down": {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
};

export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  per = "word",
  as: Component = "div",
  variants,
  className,
  preset = "fade-in",
  delay = 0,
  duration = 0.5,
  speedSegment = 0.1,
  ...props
}) => {
  const MotionComponent = motion(Component);
  const selectedVariants = variants || defaultVariants[preset];

  if (per === "char" || per === "word") {
    const text = typeof children === "string" ? children : "";
    const segments = per === "word" ? text.split(" ") : text.split("");

    return (
      <MotionComponent className={className} {...props}>
        {segments.map((segment, index) => (
          <motion.span
            key={index}
            initial={selectedVariants.initial}
            animate={selectedVariants.animate}
            transition={{
              duration,
              delay: delay + index * speedSegment,
              ease: "easeOut",
            }}
            style={{ display: "inline-block" }}
          >
            {segment}
            {per === "word" && index < segments.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </MotionComponent>
    );
  }

  return (
    <MotionComponent
      className={className}
      initial={selectedVariants.initial}
      animate={selectedVariants.animate}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};