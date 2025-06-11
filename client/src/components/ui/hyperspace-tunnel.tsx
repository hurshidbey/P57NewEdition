"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { motion, useMotionValue, useTransform, useSpring, useVelocity, type MotionValue } from "framer-motion";
import React, { type HTMLAttributes, useEffect, useMemo, useCallback, useRef } from "react";

interface HyperspaceTunnelProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  tunnelDepth?: number;
  ringCount?: number;
  particleCount?: number;
  speed?: number;
}

interface RingProps {
  depth: number;
  index: number;
  totalRings: number;
  speed: number;
  color: MotionValue<string>;
}

const Ring = React.memo(({ depth, index, totalRings, speed, color }: RingProps) => {
  const progress = index / totalRings;
  const size = useTransform(useMotionValue(progress), [0, 1], ["100%", "10%"]);
  const opacity = useTransform(useMotionValue(progress), [0, 0.5, 1], [0, 1, 0]);

  return (
    <motion.div
      className="absolute inset-0 m-auto rounded-full border"
      style={{
        width: size,
        height: size,
        opacity,
        borderColor: color.get(),
      }}
      animate={{
        scale: [1, 1.5, 1],
        rotate: [0, 360],
      }}
      transition={{
        duration: speed * (1 + progress),
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    />
  );
});

Ring.displayName = "Ring";

export const HyperspaceTunnel: React.FC<HyperspaceTunnelProps> = React.memo(
  ({ children, className, tunnelDepth = 1000, ringCount = 20, particleCount = 100, speed = 10, ...props }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });
    const velocityX = useVelocity(smoothMouseX);
    const velocityY = useVelocity(smoothMouseY);

    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (containerRef.current) {
          const { left, top, width, height } = containerRef.current.getBoundingClientRect();
          const x = (event.clientX - left) / width - 0.5;
          const y = (event.clientY - top) / height - 0.5;
          mouseX.set(x);
          mouseY.set(y);
        }
      },
      [mouseX, mouseY]
    );

    const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [10, -10]);
    const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-10, 10]);

    const mouseDistance = useTransform(
      [smoothMouseX, smoothMouseY], 
      (latest: number[]) => {
        const [x, y] = latest as [number, number];
        return Math.sqrt(Number(x) * Number(x) + Number(y) * Number(y));
      }
    );
    const color = useTransform(mouseDistance, [0, 0.5], ["hsl(200, 100%, 50%)", "hsl(320, 100%, 50%)"]);

    const velocity = useTransform(
      [velocityX, velocityY], 
      (latest: number[]) => {
        const [vx, vy] = latest as [number, number];
        return Math.sqrt(Number(vx) * Number(vx) + Number(vy) * Number(vy));
      }
    );
    const scale = useTransform(velocity, [0, 1000], [0.95, 1.05]);

    const createRing = useCallback(
      (i: number) => <Ring key={i} depth={tunnelDepth} index={i} totalRings={ringCount} speed={speed} color={color} />,
      [tunnelDepth, ringCount, speed, color]
    );

    const rings = useMemo(() => Array.from({ length: ringCount }, (_, i) => createRing(i)), [ringCount, createRing]);

    return (
      <div
        ref={containerRef}
        className={cn("relative overflow-hidden bg-black", className)}
        style={{
          perspective: `${tunnelDepth}px`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          mouseX.set(0);
          mouseY.set(0);
        }}
        {...props}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            rotateX,
            rotateY,
            scale,
          }}
        >
          <div className="relative w-full h-full">{rings}</div>
        </motion.div>
        <div className="relative z-10 flex items-center justify-center h-full">{children}</div>
      </div>
    );
  }
);

HyperspaceTunnel.displayName = "HyperspaceTunnel";

export function FeaturedCard() {
  return (
    <Card className=" w-[350px] text-neutral-200 bg-[#1C1C1C] border-none shadow-[0px_10px_20px_rgba(0,_0,_0,_0.6),_0px_6px_12px_rgba(0,_0,_0,_0.5),_0px_3px_6px_rgba(0,_0,_0,_0.4),_0px_1px_3px_rgba(0,_0,_0,_0.3),_0px_1px_2px_rgba(255,_255,_255,_0.06)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.04)_inset,_0px_-2px_6px_rgba(0,_0,_0,_0.25)_inset,_0px_1px_1px_rgba(255,_255,_255,_0.02),_1px_1px_2px_rgba(255,_255,_255,_0.01)]">
      <CardHeader>
        <CardTitle>Explore the Universe</CardTitle>
        <CardDescription>Embark on an interstellar journey</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Discover new worlds, encounter alien civilizations, and unravel the mysteries of the cosmos in this epic space
          adventure.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full">
          Launch Mission
        </Button>
      </CardFooter>
    </Card>
  );
}