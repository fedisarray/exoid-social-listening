"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const HeaderTarget = createContext<HTMLElement | null>(null);

export function WorkspaceHeaderProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  return (
    <HeaderTarget value={target}>
      <header
        ref={setTarget}
        className="sticky top-0 z-30 flex min-h-20 flex-wrap items-center justify-between gap-3 border-b bg-card px-5 py-3 empty:hidden md:px-10 lg:px-6"
      />
      {children}
    </HeaderTarget>
  );
}

export function WorkspaceHeader({ children }: { children: ReactNode }) {
  const target = useContext(HeaderTarget);
  return target ? createPortal(children, target) : null;
}
