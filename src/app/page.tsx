"use client";

import Link from "next/link";
import { useState } from "react";

function TiltCard({
  href,
  title,
  defaultDeg,
  hoverDeg,
}: {
  href: string;
  title: string;
  defaultDeg: number;
  hoverDeg: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      data-duck-card="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px",
        width: "100%",
        maxWidth: 220,
        minHeight: 220,
        color: "var(--dark-spruce)",
        textDecoration: "none",
        backgroundImage: "url(/border.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        transform: hovered
          ? `rotate(${hoverDeg}deg) scale(1.04)`
          : `rotate(${defaultDeg}deg)`,
        transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <p
        className="text-xl font-bold lowercase tracking-wide text-center"
        style={{ color: "var(--dark-spruce)" }}
      >
        {title}
      </p>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-12 text-center">
      <h1
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5"
        style={{ color: "var(--dark-spruce)" }}
      >
        Adventures in Tucson!
      </h1>

      <p
        className="text-sm leading-relaxed mb-12 w-4/5"
        style={{ color: "var(--tennis-court)", fontWeight: 400 }}
      >
        Hi Bebbers! It's Jebbers. I know you're moving soon, and I'm honestly
        so excited for you! I know that you'll do amazing out there even if you
        need some time to get in the groove of things. You've mentioned being a
        little scared — anyone would be! So I built a little something to get
        you started out there whether you want to find some places to check out
        or you'd want a little structure to complete a mini bucket list.
        Hopefully this helps you get started out there. :)
      </p>

      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-6 sm:gap-10 w-full">
        <TiltCard
          href="/things"
          title="your arizona guide"
          defaultDeg={-2}
          hoverDeg={-5}
        />
        <TiltCard
          href="/whim"
          title="fill your cup"
          defaultDeg={2}
          hoverDeg={5}
        />
      </div>
    </main>
  );
}