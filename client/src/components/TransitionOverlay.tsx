// src/components/TransitionOverlay.tsx
//
// Exports:
//   <TransitionProvider>   — wrap your RootLayout return with this
//   useNav()               — drop-in replacement for useNavigate()
//
// Usage:
//   const nav = useNav();
//   nav("/home");           ← plays wipe-in, navigates, plays wipe-out

import { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Timing (ms) ───────────────────────────────────────────────────────────────
const WIPE_IN  = 400;   // how long the wave takes to cover the screen
const WIPE_OUT = 400;   // how long it takes to exit off the top

// ── Context ───────────────────────────────────────────────────────────────────
type TransitionCtx = { trigger: (cb: () => void) => void };
export const Ctx = createContext<TransitionCtx>({ trigger: (cb) => cb() });

// ── Provider ──────────────────────────────────────────────────────────────────
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");

  const trigger = useCallback((onCovered: () => void) => {
    setPhase("in");                          // 1. wave rises up

    setTimeout(() => {
      onCovered();                           // 2. screen is covered → navigate NOW
      setPhase("out");                       // 3. wave exits off the top

      setTimeout(() => setPhase("idle"), WIPE_OUT);
    }, WIPE_IN);
  }, []);

    return (
    <Ctx.Provider value={{ trigger }}>
        {children}
        {phase !== "idle" && <WaveCurtain phase={phase === "in" ? "in" : "out"} />}
    </Ctx.Provider>
    );  
}

// ── Drop-in navigate hook ─────────────────────────────────────────────────────
export function useNav() {
  const navigate = useNavigate();
  const { trigger } = useContext(Ctx);
  return (to: string) => trigger(() => navigate(to));
}

// ── The actual curtain ────────────────────────────────────────────────────────
function WaveCurtain({ phase }: { phase: "in" | "out" }) {
  return (
    <>
      <style>{`
        @keyframes wipeIn {
          from { transform: translateY(100%);  }
          to   { transform: translateY(0%);    }
        }
        @keyframes wipeOut {
          from { transform: translateY(0%);    }
          to   { transform: translateY(-110%); }
        }
      `}</style>

      <div
        className="fixed left-0 bottom-0 w-full pointer-events-none z-[9999]"
        style={{
          height:    "110vh",
          animation: phase === "in"
            ? `wipeIn  ${WIPE_IN}ms  cubic-bezier(0.76, 0, 0.24, 1) forwards`
            : `wipeOut ${WIPE_OUT}ms cubic-bezier(0.76, 0, 0.24, 1) forwards`,
        }}
      >
        {/* Wavy leading edge — swap the path to change the shape:
            Wave    → "M0,60 C180,10 360,80 540,45 C720,10 900,75 1080,40 C1260,5 1380,65 1440,35 L1440,80 L0,80 Z"
            Chevron → "M0,60 L720,0 L1440,60 L1440,80 L0,80 Z"
            Arc     → "M0,60 Q720,0 1440,60 L1440,80 L0,80 Z"
        */}
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ position:"absolute", top:0, left:0, width:"100%", height:"80px", transform:"translateY(-99%)", fill:"#F5A623" }}
        >
          <path d="M0,60 C180,10 360,80 540,45 C720,10 900,75 1080,40 C1260,5 1380,65 1440,35 L1440,80 L0,80 Z" />
        </svg>

        {/* Orange body */}
        <div className="w-full h-full bg-[#F5A623]" />
      </div>
    </>
  );
}