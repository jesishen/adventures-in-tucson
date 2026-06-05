"use client";

import { whimCards } from "../../../data/whim";

type WhimCardType = {
  id: string;
  title: string;
  items: string[];
};

function WhimCard({ card }: { card: WhimCardType }) {
  return (
    <div
      className="p-5 sm:p-6 flex flex-col cursor-default h-full"
      style={{
        backgroundImage: "url(/card-border.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        color: "var(--dark-spruce)",
      }}
    >
      {/* Title */}
      <p
        className="text-[10px] uppercase tracking-[0.2em] mb-3 sm:mb-4 pb-2 sm:pb-3"
        style={{
          color: "var(--whimsical-evening)",
          borderBottom: "1px solid currentColor",
        }}
      >
        {card.title}
      </p>

      {/* Items */}
      <ul className="flex flex-col gap-2 sm:gap-2.5">
        {card.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs leading-snug">
            <span
              className="mt-0.5 shrink-0 text-[8px]"
              style={{ color: "var(--whimsical-evening)" }}
            >
              ◆
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WhimPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
      <header
        className="pt-20 sm:pt-28 pb-8 sm:pb-12"
        style={{ borderBottom: "1px solid var(--dark-spruce)" }}
      >
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight sm:leading-none tracking-tight mb-3 sm:mb-4"
          style={{ color: "var(--dark-spruce)" }}
        >
          Feeling on a whim.
        </h1>
        <p
          className="text-sm sm:text-base leading-relaxed"
          style={{ color: "var(--tennis-court)" }}
        >
          10 cards. Pick one. Go.
        </p>
      </header>

      {/*
        Mobile  — horizontal snap carousel, cards are 85vw wide
        Desktop — 2-column grid
      */}
      <div
        className="
          mt-8 sm:mt-12
          flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4
          -mx-4 px-4
          sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none
          sm:mx-0 sm:px-0 sm:gap-4 sm:pb-0
        "
        style={{ scrollbarWidth: "none" }}
      >
        {whimCards.map((card) => (
          <div
            key={card.id}
            className="snap-start shrink-0 w-[82vw] sm:w-auto sm:shrink"
          >
            <WhimCard card={card} />
          </div>
        ))}
      </div>

      {/* Scroll hint — mobile only */}
      <p
        className="sm:hidden mt-3 text-[10px] uppercase tracking-widest text-center"
        style={{ color: "var(--whimsical-evening)", opacity: 0.5 }}
      >
        ← swipe →
      </p>

      <footer
        className="mt-16 sm:mt-20 pt-6 text-xs text-center tracking-widest uppercase"
        style={{ borderTop: "1px solid var(--dark-spruce)", color: "var(--whimsical-evening)", opacity: 0.5 }}
      >
        made with love ♡
      </footer>
    </main>
  );
}
