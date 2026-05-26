import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

// Circles: [top%, left%, size in rem, opacity]
const CIRCLES = [
  [8,  4,  5,   0.5], [14, 18, 2.5, 0.4], [3,  35, 1.5, 0.3],
  [5,  58, 3,   0.4], [12, 75, 2,   0.5], [2,  88, 4,   0.3],
  [22, 92, 1.5, 0.4], [30, 2,  3,   0.4], [38, 14, 1.5, 0.3],
  [45, 82, 5,   0.5], [55, 90, 2,   0.4], [62, 6,  4,   0.3],
  [70, 20, 2,   0.4], [75, 70, 3,   0.5], [82, 88, 2,   0.3],
  [88, 50, 1.5, 0.4], [92, 10, 3,   0.4], [95, 78, 4,   0.3],
  [50, 96, 2.5, 0.5], [20, 45, 1.5, 0.3],
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth!, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth!, provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFF5E6" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 py-2 shadow-sm"
        style={{ background: "#F5A623" }}
      >
        {/* Logo */}
        <div
          className="rounded-lg px-4 py-2 text-white font-bold text-sm shadow"
          style={{ background: "#E8920F" }}
        >
          Logo
        </div>

        {/* Title */}
        <span className="text-white font-bold text-xl tracking-wide">
          UUID
        </span>

        {/* User avatar placeholder */}
        <div className="flex flex-col items-center gap-0.5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
            style={{ background: "#E03B2A" }}
          >
            Image
          </div>
          <span className="text-white text-xs font-medium">Username</span>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main className="relative flex-1 flex items-center justify-center overflow-hidden">

        {/* Scattered background circles */}
        {CIRCLES.map(([top, left, size, opacity], i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              top:     `${top}%`,
              left:    `${left}%`,
              width:   `${size}rem`,
              height:  `${size}rem`,
              background: "#F5A623",
              opacity,
            }}
          />
        ))}

        {/* ── Login card ───────────────────────────────────────────────────── */}
        <div
          className="relative z-10 rounded-3xl shadow-xl px-10 py-8 w-full max-w-md mx-4"
          style={{ background: "#F5A623" }}
        >
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Log in
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-white font-semibold text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 outline-none text-sm"
                style={{ background: "#FDDBA8", color: "#3D1F0A" }}
                placeholder=""
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-white font-semibold text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 outline-none text-sm"
                style={{ background: "#FDDBA8", color: "#3D1F0A" }}
                placeholder=""
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-700 text-sm text-center font-medium">
                {error}
              </p>
            )}

            {/* Submit — hidden since original had no explicit submit button visible,
                but kept for accessibility; press Enter or Google button to sign in */}
            <button type="submit" className="hidden" />
          </form>

          {/* Divider */}
          <div className="mt-6 mb-3 text-center text-white font-semibold text-sm">
            Other Sign in options:
          </div>

          {/* Google sign-in */}
          <button
            onClick={handleGoogleLogin}
            className="w-full rounded-xl py-3 flex items-center justify-center shadow transition-opacity hover:opacity-90 active:opacity-75"
            style={{ background: "#FDDBA8" }}
          >
            {/* Google "G" logo via SVG — no external dependency */}
            <svg width="24" height="24" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.1 0 5.6 1.1 7.6 2.9l5.6-5.6C33.7 3.5 29.2 1.5 24 1.5 14.9 1.5 7.2 7 3.8 14.8l6.6 5.1C12.1 13.4 17.6 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.7-2.1 5-4.4 6.5l6.8 5.3c4-3.7 6.3-9.2 6.3-15.8z"/>
              <path fill="#FBBC05" d="M10.4 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-6.6-5.1A23 23 0 0 0 1 24c0 3.7.9 7.2 2.5 10.3l6.9-5.7z"/>
              <path fill="#34A853" d="M24 46.5c5.2 0 9.6-1.7 12.8-4.7l-6.8-5.3c-1.7 1.2-3.9 1.9-6 1.9-6.4 0-11.8-4-13.7-9.8l-6.9 5.7C7.2 41.5 15 46.5 24 46.5z"/>
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}

export default Login;