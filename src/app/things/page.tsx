"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { places } from "../../../data/tucson";

type Place = {
  id: string;
  name: string;
  type: string;
  hours: string;
  address: string;
  priceRange: number;
  notes?: string;
  website?: string | null;
};

const CATEGORIES = ["All", "Food", "Entertainment", "Shopping", "Outdoors", "Nightlife"] as const;
type Category = (typeof CATEGORIES)[number];

const PRICE_CATEGORIES: Category[] = ["Food", "Nightlife"];
const PRICES = [0, 1, 2, 3] as const;

const CATEGORY_KEY: Record<string, keyof typeof places> = {
  Food: "food",
  Entertainment: "entertainment",
  Shopping: "shopping",
  Outdoors: "outdoors",
  Nightlife: "nightlife",
};

const MAX_NOTE = 100;
const LS_KEY = "tucson-notes";

function priceLabel(p: number) {
  return p === 0 ? "All" : "$".repeat(p);
}

function useNotes() {
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setNotes(JSON.parse(stored));
    } catch {}
  }, []);

  function saveNote(id: string, text: string) {
    const next = { ...notes };
    if (text.trim()) {
      next[id] = text.trim();
    } else {
      delete next[id];
    }
    setNotes(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}
  }

  return { notes, saveNote };
}

function PlaceRow({
  place,
  userNote,
  onSaveNote,
}: {
  place: Place;
  userNote: string | undefined;
  onSaveNote: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(userNote ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  function openEdit() {
    setDraft(userNote ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commit() {
    onSaveNote(draft);
    setEditing(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  }

  return (
    <div
      className="py-4 sm:py-5"
      style={{ borderTop: "1px solid var(--dark-spruce)" }}
    >
      <div className="min-w-0 w-full">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
          <span className="font-semibold tracking-tight" style={{ color: "var(--dark-spruce)" }}>
            {place.name}
          </span>
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              title={`Visit ${place.name}`}
              className="inline-flex items-center transition-opacity opacity-30 hover:opacity-80"
              style={{ color: "var(--dark-spruce)" }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10L10 2M10 2H4.5M10 2V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          )}
          <span
            className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
            style={{ backgroundColor: "var(--whimsical-evening)", color: "var(--baby-blush)" }}
          >
            {place.type}
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--tennis-court)" }}>{place.address}</p>
        <p className="text-sm opacity-70" style={{ color: "var(--dark-spruce)" }}>{place.hours}</p>
        {place.notes && (
          <p className="mt-1 text-xs italic" style={{ color: "var(--whimsical-evening)" }}>{place.notes}</p>
        )}

        {/* User note display */}
        {userNote && !editing && (
          <p
            className="mt-2 text-xs pl-2"
            style={{ borderLeft: "2px solid var(--pinky-promise)", color: "var(--dark-spruce)" }}
          >
            {userNote}
          </p>
        )}

        {/* Inline editor */}
        {editing ? (
          <div className="mt-2 flex flex-col gap-1">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_NOTE))}
              onKeyDown={handleKey}
              onBlur={commit}
              placeholder="add a note…"
              className="w-full text-xs bg-transparent outline-none py-0.5 transition-colors"
              style={{
                color: "var(--dark-spruce)",
                borderBottom: "1px solid var(--whimsical-evening)",
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: "var(--whimsical-evening)", opacity: 0.6 }}>
                ↵ save · esc cancel
              </span>
              <span
                className="text-[10px] tabular-nums"
                style={{ color: draft.length >= MAX_NOTE ? "var(--pinky-promise)" : "var(--whimsical-evening)", opacity: draft.length >= MAX_NOTE ? 1 : 0.5 }}
              >
                {draft.length}/{MAX_NOTE}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={openEdit}
            className="mt-1 text-[10px] uppercase tracking-widest transition-colors"
            style={{
              color: "var(--whimsical-evening)",
              opacity: 0.6,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
          >
            {userNote ? "edit note" : "add a note"}
          </button>
        )}
      </div>

      {/* Price — inline on desktop, below content on mobile */}
      <div className="mt-1">
        <span className="text-xs tracking-widest" style={{ color: "var(--tennis-court)" }}>
          {"$".repeat(place.priceRange)}
          <span style={{ opacity: 0.2 }}>{"$".repeat(3 - place.priceRange)}</span>
        </span>
      </div>
    </div>
  );
}

export default function ThingsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activePrice, setActivePrice] = useState<number>(0);
  const { notes, saveNote } = useNotes();

  const showPriceFilter = PRICE_CATEGORIES.includes(activeCategory as (typeof PRICE_CATEGORIES)[number]);

  const filteredPlaces = useMemo<Place[]>(() => {
    let items: Place[] = [];
    if (activeCategory === "All") {
      items = Object.values(places).flat();
    } else {
      items = [...places[CATEGORY_KEY[activeCategory]]];
    }
    if (showPriceFilter && activePrice !== 0) {
      items = items.filter((p) => p.priceRange === activePrice);
    }
    return items;
  }, [activeCategory, activePrice, showPriceFilter]);

  function handleCategoryChange(cat: Category) {
    setActiveCategory(cat);
    setActivePrice(0);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-24">
      <header className="pt-20 sm:pt-28 pb-8 sm:pb-10">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight sm:leading-none tracking-tight"
          style={{ color: "var(--dark-spruce)" }}
        >
          things to do<br />in tucson.
        </h1>
      </header>

      {/* Filters */}
      <div
        className="py-3 sm:py-4 mb-2 space-y-2 sm:space-y-3"
        style={{ borderTop: "1px solid var(--dark-spruce)", borderBottom: "1px solid var(--dark-spruce)" }}
      >
        {/* Category tabs — wrap on mobile */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className="text-[10px] uppercase tracking-widest px-3 transition-colors"
                style={{
                  minHeight: 44,
                  backgroundColor: isActive ? "var(--pinky-promise)" : "transparent",
                  color: "var(--dark-spruce)",
                  border: isActive ? "1px solid var(--pinky-promise)" : "1px solid transparent",
                  opacity: isActive ? 1 : 0.45,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.opacity = "0.8"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.opacity = "0.45"; }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {showPriceFilter && (
          <div className="flex gap-1.5 sm:gap-2">
            {PRICES.map((p) => {
              const isActive = activePrice === p;
              return (
                <button
                  key={p}
                  onClick={() => setActivePrice(p)}
                  className="text-[10px] uppercase tracking-widest px-3 transition-colors"
                  style={{
                    minHeight: 44,
                    backgroundColor: isActive ? "var(--pinky-promise)" : "transparent",
                    color: "var(--dark-spruce)",
                    border: isActive ? "1px solid var(--pinky-promise)" : "1px solid transparent",
                    opacity: isActive ? 1 : 0.45,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.opacity = "0.8"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.opacity = "0.45"; }}
                >
                  {priceLabel(p)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p
        className="text-[10px] uppercase tracking-widest mb-2"
        style={{ color: "var(--whimsical-evening)", opacity: 0.6 }}
      >
        {filteredPlaces.length} {filteredPlaces.length === 1 ? "place" : "places"}
      </p>

      <div>
        {filteredPlaces.map((place) => (
          <PlaceRow
            key={place.id}
            place={place}
            userNote={notes[place.id]}
            onSaveNote={(text) => saveNote(place.id, text)}
          />
        ))}
      </div>

      <footer
        className="mt-20 pt-6 text-xs text-center tracking-widest uppercase"
        style={{ borderTop: "1px solid var(--dark-spruce)", color: "var(--whimsical-evening)", opacity: 0.5 }}
      >
        made with love ♡
      </footer>
    </main>
  );
}
