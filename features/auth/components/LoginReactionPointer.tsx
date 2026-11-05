"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue } from "motion/react";
import { Frown, Heart, ThumbsDown, ThumbsUp } from "lucide-react";
import { Pointer } from "@/components/ui/pointer";

const query =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const reactions = [ThumbsUp, ThumbsDown, Heart, Frown] as const;

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

export function LoginReactionPointer() {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const enabled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [reaction, setReaction] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const Reaction = reactions[reaction];

  useEffect(() => {
    const card = anchorRef.current?.parentElement;
    if (!card || !enabled) return;
    const move = (event: MouseEvent) => {
      const bounds = card.getBoundingClientRect();
      const progress =
        (event.clientX - bounds.left) / Math.max(1, bounds.width);
      setReaction(
        Math.max(
          0,
          Math.min(
            reactions.length - 1,
            Math.floor(progress * reactions.length),
          ),
        ),
      );
      x.set(event.clientX + 20);
      y.set(event.clientY + 20);
    };
    card.addEventListener("mousemove", move);
    card.addEventListener("mouseenter", move);
    return () => {
      card.removeEventListener("mousemove", move);
      card.removeEventListener("mouseenter", move);
    };
  }, [enabled, x, y]);

  return (
    <>
      <span ref={anchorRef} hidden aria-hidden="true" />
      {enabled ? (
        <Pointer
          aria-hidden="true"
          style={{ top: 0, left: 0, x, y }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            key={reaction}
            animate={{ scale: [0.8, 1, 0.8], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Reaction
              size={40}
              strokeWidth={1.5}
              fill={reaction === 2 ? "currentColor" : "none"}
              className="text-primary drop-shadow-sm"
            />
          </motion.div>
        </Pointer>
      ) : null}
    </>
  );
}
