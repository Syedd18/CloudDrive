"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  delay?: number;
  className?: string;
  asChild?: boolean;
}

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

    let x = 0;
    let y = 0;

    // Calculate base position based on side
    switch (side) {
      case "top":
        y = triggerRect.top - tooltipRect.height - padding;
        break;
      case "bottom":
        y = triggerRect.bottom + padding;
        break;
      case "left":
        x = triggerRect.left - tooltipRect.width - padding;
        break;
      case "right":
        x = triggerRect.right + padding;
        break;
    }

    // Calculate alignment
    if (side === "top" || side === "bottom") {
      switch (align) {
        case "start":
          x = triggerRect.left;
          break;
        case "center":
          x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "end":
          x = triggerRect.right - tooltipRect.width;
          break;
      }
    } else {
      switch (align) {
        case "start":
          y = triggerRect.top;
          break;
        case "center":
          y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          break;
        case "end":
          y = triggerRect.bottom - tooltipRect.height;
          break;
      }
    }

    // Ensure tooltip stays within viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    x = Math.max(padding, Math.min(x, viewport.width - tooltipRect.width - padding));
    y = Math.max(padding, Math.min(y, viewport.height - tooltipRect.height - padding));

    setPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener("scroll", calculatePosition, true);
      window.addEventListener("resize", calculatePosition);
      
      return () => {
        window.removeEventListener("scroll", calculatePosition, true);
        window.removeEventListener("resize", calculatePosition);
      };
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getAnimationOrigin = () => {
    switch (side) {
      case "top": return { y: 4 };
      case "bottom": return { y: -4 };
      case "left": return { x: 4 };
      case "right": return { x: -4 };
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="inline-flex"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, ...getAnimationOrigin() }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...getAnimationOrigin() }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: position.x,
              top: position.y,
              zIndex: 9999,
            }}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg",
              "bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900",
              "shadow-lg pointer-events-none whitespace-nowrap",
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
