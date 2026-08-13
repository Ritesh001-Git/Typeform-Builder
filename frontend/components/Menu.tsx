"use client";

import { useEffect, useRef, useState } from "react";

interface MenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export function Menu({ trigger, items }: { trigger: React.ReactNode; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="focus-ring rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink"
        aria-label="Open menu"
      >
        {trigger}
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 z-20 mt-1 w-44 animate-fade-in rounded-xl border border-line bg-white p-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`focus-ring block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-paper ${
                item.danger ? "text-danger" : "text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
