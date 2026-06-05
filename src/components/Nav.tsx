"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: "var(--tennis-court)" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 min-h-[56px]">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-xs tracking-widest uppercase transition-opacity hover:opacity-70 leading-none"
          style={{ color: "var(--baby-blush)" }}
        >
          Adventures in Tucson!
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-8">
          <NavLink href="/things" label="your arizona guide" />
          <NavLink href="/whim" label="fill your cup" />
        </div>

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden flex flex-col justify-center items-center gap-[5px]"
          style={{
            width: 44,
            height: 44,
            color: "var(--baby-blush)",
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              display: "block",
              width: 20,
              height: 2,
              backgroundColor: "var(--baby-blush)",
              transition: "transform 0.2s, opacity 0.2s",
              transform: open ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: 20,
              height: 2,
              backgroundColor: "var(--baby-blush)",
              transition: "opacity 0.2s",
              opacity: open ? 0 : 1,
            }}
          />
          <span
            style={{
              display: "block",
              width: 20,
              height: 2,
              backgroundColor: "var(--baby-blush)",
              transition: "transform 0.2s, opacity 0.2s",
              transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="md:hidden flex flex-col px-5 pb-4 gap-1"
          style={{ backgroundColor: "var(--tennis-court)", borderTop: "1px solid rgba(241,206,243,0.15)" }}
        >
          <NavLink href="/things" label="your arizona guide" onClick={() => setOpen(false)} mobile />
          <NavLink href="/whim" label="fill your cup" onClick={() => setOpen(false)} mobile />
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  label,
  onClick,
  mobile,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-100"
      style={{
        color: "var(--baby-blush)",
        opacity: 0.8,
        display: "flex",
        alignItems: "center",
        minHeight: 44,
        paddingBlock: mobile ? "4px" : undefined,
      }}
    >
      {label}
    </Link>
  );
}
