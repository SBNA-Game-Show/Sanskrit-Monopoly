// ── Variants ──────────────────────────────────────────────────────────────────
//   primary    orange #FDAF5D   — Home "CREATE LOBBY", LobbyWaiting "START"
//   action     orange             — Game controls, quiz answers, overlay actions
//   toggle     orange             — Edition / Starting Money selectors
//   social     peach #fd8300    — Google sign-in
//   white      white bg           — Login "Sign In" submit
//
// ── Sizes ─────────────────────────────────────────────────────────────────────
//   sm    small pill/icon button  (Kick)
//   md    overlay buttons         (quiz answers, jail choices)   [default]
//   lg    game panel controls     (Force Roll, Roll Dice)
//   xl    home page jersey CTAs   (CREATE LOBBY, START)
//
// ── Props ─────────────────────────────────────────────────────────────────────
//   active      boolean  toggle variant only
//   glow        boolean  adds orange drop-shadow (Home page buttons)
//   fullWidth   boolean  w-full
//   neon        boolean  adds pulsing neon glow (LobbyWaiting START button)

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "action"
  | "toggle"
  | "social"
  | "white";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  glow?: boolean;
  neon?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

// ── Size map ──────────────────────────────────────────────────────────────────
const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs rounded-full",
  md: "h-[54px] px-4 text-lg rounded-2xl",
  lg: "h-[58px] w-[230px] text-lg rounded-[22px]",
  xl: "h-14 px-6 text-2xl rounded-2xl font-jersey tracking-widest",
};

// ── Variant map ───────────────────────────────────────────────────────────────
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-[#FDAF5D] text-white " +
    "hover:scale-105 active:scale-95 shadow-sm " +
    "disabled:bg-[#FFC17E] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",

  action:
    "bg-[#f6860f] text-white font-bold border-[5px] border-[#ffa23b] shadow-md " +
    "hover:bg-[#fd5d00] active:scale-95 " +
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#e84a15]",

  toggle:
    "text-white font-medium tracking-wider " +
    "disabled:cursor-not-allowed disabled:opacity-50",

  social:
    "bg-[#FFEED4] shadow-lg " +
    "hover:shadow-xl hover:brightness-105 active:scale-95 " +
    "disabled:cursor-not-allowed disabled:opacity-50",

  white:
    "bg-white text-orange-600 font-bold " +
    "hover:bg-orange-50 active:scale-95",
};

// ── Toggle active/inactive ────────────────────────────────────────────────────
const TOGGLE_ACTIVE =
  "bg-[#FF8C00] shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] translate-y-1 rounded-xl";
const TOGGLE_INACTIVE =
  "bg-[#FFA545] border-b-4 border-[#FF8C00] hover:bg-[#ffb25c] rounded-xl";

// ── Component ─────────────────────────────────────────────────────────────────
export function Button({
  variant = "primary",
  size = "md",
  active = false,
  glow = false,
  neon = false,
  fullWidth = false,
  className = "",
  style,
  children,
  ...props
}: ButtonProps) {
  const toggleClass =
    variant === "toggle" ? (active ? TOGGLE_ACTIVE : TOGGLE_INACTIVE) : "";

  const glowStyle = glow
    ? { filter: "drop-shadow(0px 0px 12px #FDAF5D)", ...style }
    : style;

  return (
    <button
      className={[
        // base
        "transition-all duration-300 select-none outline-none",
        "flex items-center justify-center cursor-pointer",
        // size
        SIZE[size],
        // variant
        VARIANT[variant],
        // toggle state
        toggleClass,
        // modifiers
        fullWidth ? "w-full" : "",
        neon ? "animate-neon" : "",
        // caller overrides
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={glowStyle}
      {...props}
    >
      {children}
    </button>
  );
}