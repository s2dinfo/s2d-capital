"use client";
import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
interface Props { value: number; prefix?: string; suffix?: string; decimals?: number; className?: string; }
export default function AnimatedCounter({ value, prefix="", suffix="", decimals=0, className="" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, { stiffness: 50, damping: 20, mass: 1 });
  const display = useTransform(spring, (v: number) => `${prefix}${Number(v.toFixed(decimals)).toLocaleString("en-US",{minimumFractionDigits:decimals,maximumFractionDigits:decimals})}${suffix}`);
  // In-view only delays the animation. If the observer never fires, the
  // timeout applies the real value anyway — a counter stuck at 0 is wrong data.
  useEffect(() => {
    if (isInView) { spring.set(value); return; }
    const t = setTimeout(() => spring.set(value), 2000);
    return () => clearTimeout(t);
  }, [isInView, value, spring]);
  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
