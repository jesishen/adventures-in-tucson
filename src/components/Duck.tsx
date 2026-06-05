"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Pixel duck — side view, 9 × 11 cells at 5 px each → 45 × 55 px
// ─────────────────────────────────────────────────────────────────────────────
const S  = 5;
const Y  = "#F5CF35";   // yellow body
const O  = "#E87820";   // orange beak / feet
const BK = "#111111";   // black
type Px  = [number, number, string];

// ── Awake body — dot eye at (3,2) ────────────────────────────────────────────
const BODY_AWAKE: Px[] = [
  [2,0,Y],[3,0,Y],[4,0,Y],[5,0,Y],
  [1,1,Y],[2,1,Y],[3,1,Y],[4,1,Y],[5,1,Y],[6,1,Y],
  [1,2,Y],[2,2,Y],[3,2,BK],[4,2,Y],[5,2,Y],[6,2,Y],[7,2,O],
  [1,3,Y],[2,3,Y],[3,3,Y],[4,3,Y],[5,3,Y],[6,3,Y],[7,3,O],[8,3,O],
  [0,4,Y],[1,4,Y],[2,4,Y],[3,4,Y],[4,4,Y],[5,4,Y],[6,4,Y],[7,4,Y],
  [0,5,Y],[1,5,Y],[2,5,Y],[3,5,Y],[4,5,Y],[5,5,Y],[6,5,Y],[7,5,Y],[8,5,Y],
  [0,6,Y],[1,6,Y],[2,6,Y],[3,6,Y],[4,6,Y],[5,6,Y],[6,6,Y],[7,6,Y],
  [1,7,Y],[2,7,Y],[3,7,Y],[4,7,Y],[5,7,Y],[6,7,Y],[7,7,Y],
  [2,8,Y],[3,8,Y],[4,8,Y],[5,8,Y],[6,8,Y],
];

// ── Sleep body — closed eye (horizontal line), no feet ──────────────────────
const BODY_SLEEP: Px[] = [
  [2,0,Y],[3,0,Y],[4,0,Y],[5,0,Y],
  [1,1,Y],[2,1,Y],[3,1,Y],[4,1,Y],[5,1,Y],[6,1,Y],
  // row 2: closed eye = 3-pixel horizontal bar at (2,2)(3,2)(4,2)
  [1,2,Y],[2,2,BK],[3,2,BK],[4,2,BK],[5,2,Y],[6,2,Y],[7,2,O],
  [1,3,Y],[2,3,Y],[3,3,Y],[4,3,Y],[5,3,Y],[6,3,Y],[7,3,O],[8,3,O],
  [0,4,Y],[1,4,Y],[2,4,Y],[3,4,Y],[4,4,Y],[5,4,Y],[6,4,Y],[7,4,Y],
  [0,5,Y],[1,5,Y],[2,5,Y],[3,5,Y],[4,5,Y],[5,5,Y],[6,5,Y],[7,5,Y],[8,5,Y],
  [0,6,Y],[1,6,Y],[2,6,Y],[3,6,Y],[4,6,Y],[5,6,Y],[6,6,Y],[7,6,Y],
  [1,7,Y],[2,7,Y],[3,7,Y],[4,7,Y],[5,7,Y],[6,7,Y],[7,7,Y],
  [2,8,Y],[3,8,Y],[4,8,Y],[5,8,Y],[6,8,Y],
  // legs/feet tucked — not included
];

// ── Walk-cycle feet ───────────────────────────────────────────────────────────
const FEET_A: Px[] = [
  [2,9,O],[5,9,O],[6,9,O],
  [1,10,O],[2,10,O],[3,10,O],[5,10,O],[6,10,O],[7,10,O],
];
const FEET_B: Px[] = [
  [1,9,O],[2,9,O],[6,9,O],
  [0,10,O],[1,10,O],[2,10,O],[6,10,O],[7,10,O],[8,10,O],
];

function toShadow(px: Px[]) {
  return px.map(([c, r, col]) => `${c * S}px ${r * S}px 0 0 ${col}`).join(",");
}

const SHA  = toShadow([...BODY_AWAKE, ...FEET_A]);  // awake frame A
const SHB  = toShadow([...BODY_AWAKE, ...FEET_B]);  // awake frame B
const SSH  = toShadow(BODY_SLEEP);                   // sleep (closed eyes, no feet)

const DW       = 9  * S;     // 45 px
const DH       = 11 * S;     // 55 px
const SPEED    = 0.38;        // slow casual waddle
const SLEEP_MS = 15_000;      // 15 s idle before sleep

// ─────────────────────────────────────────────────────────────────────────────

export default function Duck() {
  const [ready,       setReady]       = useState(false);
  const [pos,         setPos]         = useState({ x: 0, y: 0 });
  const [dropping,    setDropping]    = useState(true);
  const [walking,     setWalking]     = useState(false);
  const [walkPaused,  setWalkPaused]  = useState(false);
  const [settling,    setSettling]    = useState(false);
  const [asleep,      setAsleep]      = useState(false);
  const [isDragging,  setIsDragging]  = useState(false);
  const [facingRight, setFacingRight] = useState(true);

  // Refs — readable inside closures without stale values
  const walkRef      = useRef(false);
  const pausedRef    = useRef(false);
  const dirRef       = useRef(1);
  const rafRef       = useRef<number | null>(null);
  const sleepRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef      = useRef(false);
  const dragOff      = useRef({ x: 0, y: 0 });
  const didMove      = useRef(false);
  const posRef       = useRef({ x: 0, y: 0 });
  const perchedCard  = useRef<DOMRect | null>(null);

  // Keep posRef in sync
  useEffect(() => { posRef.current = pos; }, [pos]);

  const floorY = () => window.innerHeight - DH - 20;

  // ── Gravity fall (after drag release) ────────────────────────────────────
  function doFall(fromY: number, toY: number, onLanded: () => void) {
    if (fromY >= toY) {
      setPos(p => ({ ...p, y: toY }));
      posRef.current = { ...posRef.current, y: toY };
      onLanded();
      return;
    }
    let y = fromY;
    let vy = 1.5;
    function fall() {
      vy = Math.min(vy * 1.14 + 0.25, 20);
      y += vy;
      if (y >= toY) {
        y = toY;
        posRef.current = { ...posRef.current, y };
        setPos(p => ({ ...p, y }));
        onLanded();
        return;
      }
      posRef.current = { ...posRef.current, y };
      setPos(p => ({ ...p, y }));
      rafRef.current = requestAnimationFrame(fall);
    }
    rafRef.current = requestAnimationFrame(fall);
  }

  // ── Gravity card detection — finds nearest card BELOW drop point ──────────
  function findLanding(px: number, py: number) {
    const cx = px + DW / 2;
    const duckBottom = py + DH;
    const cards = document.querySelectorAll("[data-duck-card]");
    let best: DOMRect | null = null;
    let bestGap = Infinity;
    for (const el of Array.from(cards)) {
      const r = el.getBoundingClientRect();
      // duck centre X must be within card left–right bounds
      if (cx < r.left || cx > r.right) continue;
      // card top must be at/below duck bottom (allow 20 px overlap tolerance)
      const gap = r.top - duckBottom;
      if (gap >= -20 && gap < bestGap) { bestGap = gap; best = r; }
    }
    return best
      ? { targetY: best.top - DH + 8, card: best }
      : { targetY: floorY(), card: null };
  }

  // ── Sleep timer ───────────────────────────────────────────────────────────
  const armSleep = useCallback(() => {
    if (sleepRef.current) clearTimeout(sleepRef.current);
    sleepRef.current = setTimeout(() => {
      walkRef.current = false;
      pausedRef.current = false;
      if (rafRef.current)  cancelAnimationFrame(rafRef.current);
      if (pauseRef.current) clearTimeout(pauseRef.current);
      setWalking(false);
      setWalkPaused(false);
      setSettling(true);
      setTimeout(() => { setSettling(false); setAsleep(true); }, 500);
    }, SLEEP_MS);
  }, []);

  // ── Random-pause scheduler (self-rescheduling via ref) ───────────────────
  const pauseSchedulerRef = useRef<() => void>(() => {});
  pauseSchedulerRef.current = () => {
    if (pauseRef.current) clearTimeout(pauseRef.current);
    const delay = 2800 + Math.random() * 5200;       // next pause in 2.8–8s
    pauseRef.current = setTimeout(() => {
      if (!walkRef.current) return;
      pausedRef.current = true;
      setWalkPaused(true);
      const dur = 1100 + Math.random() * 1400;        // pause lasts 1.1–2.5s
      setTimeout(() => {
        if (!walkRef.current) return;
        pausedRef.current = false;
        setWalkPaused(false);
        pauseSchedulerRef.current();                   // schedule the next one
      }, dur);
    }, delay);
  };

  // ── Start walking ─────────────────────────────────────────────────────────
  const startWalk = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    walkRef.current = true;
    pausedRef.current = false;
    setWalking(true);
    setWalkPaused(false);
    setAsleep(false);
    setSettling(false);
    armSleep();
    pauseSchedulerRef.current();

    function step() {
      if (!walkRef.current) return;
      if (!pausedRef.current) {
        setPos(prev => {
          const card = perchedCard.current;
          let nx = prev.x + SPEED * dirRef.current;
          let ny: number;
          if (card) {
            ny = card.top - DH + 8;
            // wandered off edge → fall back to floor
            if (nx < card.left - DW * 0.35 || nx > card.right - DW * 0.65) {
              perchedCard.current = null;
              ny = floorY();
            } else {
              if (nx >= card.right - DW) { dirRef.current = -1; setFacingRight(false); }
              if (nx <= card.left)       { dirRef.current =  1; setFacingRight(true);  }
            }
          } else {
            ny = floorY();
            const maxX = window.innerWidth - DW;
            if (nx >= maxX) { nx = maxX; dirRef.current = -1; setFacingRight(false); }
            if (nx <= 0)    { nx = 0;    dirRef.current =  1; setFacingRight(true);  }
          }
          return { x: nx, y: ny };
        });
      }
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
  }, [armSleep]);

  // ── Stop walking ──────────────────────────────────────────────────────────
  const stopWalk = useCallback(() => {
    walkRef.current = false;
    pausedRef.current = false;
    if (rafRef.current)  cancelAnimationFrame(rafRef.current);
    if (pauseRef.current) clearTimeout(pauseRef.current);
    setWalking(false);
    setWalkPaused(false);
  }, []);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const x = window.innerWidth  - DW - 32;
    const y = window.innerHeight - DH - 20;
    setPos({ x, y });
    posRef.current = { x, y };
    setReady(true);
    const t = setTimeout(() => setDropping(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!dropping && ready) armSleep();
  }, [dropping, ready, armSleep]);

  // Stable refs for use inside the global mouseup/mousemove effect
  const startWalkRef = useRef(startWalk);
  const armSleepRef  = useRef(armSleep);
  useEffect(() => { startWalkRef.current = startWalk; }, [startWalk]);
  useEffect(() => { armSleepRef.current  = armSleep;  }, [armSleep]);

  // ── Shared release handler (used by both mouse and touch) ────────────────
  function handleRelease() {
    if (!dragRef.current) return;
    dragRef.current = false;
    setIsDragging(false);

    const { x: px, y: py } = posRef.current;
    const { targetY, card } = findLanding(px, py);

    if (card) {
      perchedCard.current = card;
      const sx = Math.max(card.left, Math.min(px, card.right - DW));
      posRef.current = { x: sx, y: py };
      setPos({ x: sx, y: py });
      doFall(py, targetY, () => startWalkRef.current());
    } else {
      perchedCard.current = null;
      doFall(py, targetY, () => armSleepRef.current());
    }
  }

  // ── Global drag listeners (mouse + touch) ─────────────────────────────────
  useEffect(() => {
    // Mouse
    function onMouseMove(e: MouseEvent) {
      if (!dragRef.current) return;
      didMove.current = true;
      const nx = e.clientX - dragOff.current.x;
      const ny = e.clientY - dragOff.current.y;
      posRef.current = { x: nx, y: ny };
      setPos({ x: nx, y: ny });
    }

    // Touch
    function onTouchMove(e: TouchEvent) {
      if (!dragRef.current) return;
      e.preventDefault(); // prevent page scroll while dragging duck
      didMove.current = true;
      const t = e.touches[0];
      const nx = t.clientX - dragOff.current.x;
      const ny = t.clientY - dragOff.current.y;
      posRef.current = { x: nx, y: ny };
      setPos({ x: nx, y: ny });
    }

    function onTouchEnd() {
      handleRelease();
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   handleRelease);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend",  onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   handleRelease);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    if (rafRef.current)   cancelAnimationFrame(rafRef.current);
    if (sleepRef.current)  clearTimeout(sleepRef.current);
    if (pauseRef.current)  clearTimeout(pauseRef.current);
  }, []);

  // ── Shared drag start ─────────────────────────────────────────────────────
  function startDrag(clientX: number, clientY: number) {
    didMove.current = false;
    dragRef.current = true;
    setIsDragging(true);
    stopWalk();
    if (sleepRef.current) clearTimeout(sleepRef.current);
    setAsleep(false);
    setSettling(false);
    dragOff.current = {
      x: clientX - posRef.current.x,
      y: clientY - posRef.current.y,
    };
  }

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  }

  function handleTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }

  // Tap = no movement → toggle walk/sleep (mirrors click for touch)
  function handleClick() {
    if (didMove.current) return;
    armSleep();
    if (asleep || settling) { startWalk(); return; }
    if (walking) stopWalk(); else startWalk();
  }

  if (!ready) return null;

  // ── Derived render state ──────────────────────────────────────────────────
  const isSleeping = asleep || settling;
  const isMoving   = walking && !walkPaused;

  const wrapAnim = dropping
    ? "duck-drop 0.65s cubic-bezier(0.34,1.3,0.64,1) forwards"
    : settling
      ? "duck-settle 0.5s ease-out forwards"
      : isMoving
        ? "duck-bob 0.45s ease-in-out infinite"
        : "none";

  // After settle animation finishes, keep the squished pose via transform
  const wrapTransform = (asleep && !settling)
    ? "translateY(4px) scaleY(0.88)"
    : undefined;

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      title={asleep ? "click to wake up!" : walking ? "click to stop" : "click to waddle!"}
      style={{
        position: "fixed",
        left:   pos.x,
        top:    pos.y,
        width:  DW,
        height: DH,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none", // let our handlers manage touch, not the browser
        zIndex: 9999,
      }}
    >
      {/* ── ZZZ — rendered outside scaleX so they always float up-right ── */}
      {asleep && (
        <div
          style={{
            position: "absolute",
            top: 2,
            left: DW + 1,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {(["z", "z", "Z"] as const).map((letter, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                fontFamily: "sans-serif",
                fontWeight: "bold",
                fontSize: `${8 + i * 3}px`,
                color: "var(--dark-spruce)",
                animation: `zzz-rise 1.9s ease-out ${(i * 0.65).toFixed(2)}s infinite`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      )}

      {/* ── Sprite wrapper: handles drop/bob/settle animations ── */}
      <div style={{ animation: wrapAnim, transform: wrapTransform }}>

        {/* Flip for direction */}
        <div
          style={{
            transform: facingRight ? "none" : "scaleX(-1)",
            transformOrigin: `${DW / 2}px center`,
            position: "relative",
          }}
        >
          {/* Sleep sprite — closed eyes, no feet */}
          {isSleeping && (
            <div
              style={{
                width: S, height: S,
                boxShadow: SSH,
                imageRendering: "pixelated",
              }}
            />
          )}

          {/* Awake frame A */}
          {!isSleeping && (
            <div
              style={{
                width: S, height: S,
                boxShadow: SHA,
                imageRendering: "pixelated",
                animation: isMoving ? "duck-frame1 0.52s steps(1) infinite" : "none",
              }}
            />
          )}

          {/* Awake frame B */}
          {!isSleeping && (
            <div
              style={{
                position: "absolute", inset: 0,
                width: S, height: S,
                boxShadow: SHB,
                imageRendering: "pixelated",
                opacity: 0,
                animation: isMoving ? "duck-frame2 0.52s steps(1) infinite" : "none",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
