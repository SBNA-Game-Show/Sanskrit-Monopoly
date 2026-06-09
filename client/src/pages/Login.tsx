import { useState } from "react";
import type { FormEvent } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useToast } from "../context/ToastContext";

function getLoginErrorMessage(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: string }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

const CIRCLES = [
  [8,  4,  5,   0.5], [14, 18, 2.5, 0.4], [3,  35, 1.5, 0.3],
  [5,  58, 3,   0.4], [12, 75, 2,   0.5], [2,  88, 4,   0.3],
  [22, 92, 1.5, 0.4], [30, 2,  3,   0.4], [38, 14, 1.5, 0.3],
  [45, 82, 5,   0.5], [55, 90, 2,   0.4], [62, 6,  4,   0.3],
  [70, 20, 2,   0.4], [75, 70, 3,   0.5], [82, 88, 2,   0.3],
  [88, 50, 1.5, 0.4], [92, 10, 3,   0.4], [95, 78, 4,   0.3],
  [50, 96, 2.5, 0.5], [20, 45, 1.5, 0.3], [18, 27, 4,   0.3],
  [45, 66, 3,   0.5], [49, 25, 3.5, 0.4], [42, 37, 2.5, 0.3],
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth!, email, password);
      showToast({
        variant: "success",
        title: "Login successful",
        message: "Redirecting…",
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Login failed",
        message: getLoginErrorMessage(err),
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth!, provider);
      showToast({
        variant: "success",
        title: "Login successful",
        message: "Redirecting…",
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Login failed",
        message: getLoginErrorMessage(err),
      });
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden select-none p-4" 
      style={{ 
        background: "linear-gradient(180deg, #FFF9F2 0%, #FFE9CC 40%, #FFD6A3 75%, #FFA333 100%)" 
      }}>
        
       {/* Changing this changes the intensity of the bobbing (-16px -> -100) */}
      <style>{`  
        @keyframes bob {
          0%, 100% {  transform: translateY(0px) rotate(0deg);  }
          50% { transform: translateY(-160px) rotate(3deg);  }
        }

        .animate-bob {
          animation: bob 8s ease-in-out infinite;
        }
      `}</style>

      {/* Scattered large background circles (with Bobbing effects) */}
      {CIRCLES.map(([top, left, size, opacity], i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none animate-bob shadow-[0_8px_32px_rgba(232,146,15,0.15)]"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}rem`,
            height: `${size}rem`,
            background: "radial-gradient(circle at 30% 30%, #F5A623 0%, #D88200 100%)",
            opacity,
            animationDelay: `${i * -0.4}s`, // staggered starts
            animationDuration: `${6 + (i % 5)}s`, // staggered durations
          }}
        />
      ))}

      {/* ── Login Card ───────────────────────────────────────────────────── */}
      <div
        className="login-card relative z-10 rounded-3xl shadow-2xl px-8 py-10 w-full max-w-md mx-4 border border-white/20 backdrop-blur-md transform transition-all duration-300"
        style={{ 
          background: "linear-gradient(135deg, rgba(245, 166, 35, 0.95) 0%, rgba(224, 130, 0, 0.98) 100%)" 
        }}
      >

        <h2 className="text-3xl font-extrabold text-white text-center mb-2 tracking-wide drop-shadow-sm">
          Welcome!
        </h2>
        <p className="text-orange-100 text-center text-sm mb-8 font-light">
          Please log in.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">

          {/* Email Input */}
          <div className="flex flex-col gap-1.5 group">
            <label className="text-white font-semibold text-xs tracking-wider uppercase opacity-90 transition-colors group-focus-within:text-white">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl px-5 py-4 outline-none text-sm transition-all border border-orange-400/20 focus:border-white focus:ring-2 focus:ring-white/20"
                style={{ background: "#FFEED4", color: "#3D1F0A" }}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5 group">
            <label className="text-white font-semibold text-xs tracking-wider uppercase opacity-90 transition-colors group-focus-within:text-white">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl px-5 py-4 outline-none text-sm border border-orange-400/20 focus:border-white focus:ring-2 focus:ring-white/20"
              style={{ background: "#FFEED4", color: "#3D1F0A" }}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full rounded-2xl py-4 bg-white text-orange-600 font-bold active:scale-95 text-sm mt-2"
          >
            Sign In
          </button>
        </form>

        {/* Social Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="flex-shrink mx-4 text-white/70 text-xs uppercase tracking-wider font-semibold">
            Or Connect With
          </span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all hover:brightness-105 active:scale-95"
          style={{ background: "#FFEED4" }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.1 0 5.6 1.1 7.6 2.9l5.6-5.6C33.7 3.5 29.2 1.5 24 1.5 14.9 1.5 7.2 7 3.8 14.8l6.6 5.1C12.1 13.4 17.6 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.7-2.1 5-4.4 6.5l6.8 5.3c4-3.7 6.3-9.2 6.3-15.8z"/>
            <path fill="#FBBC05" d="M10.4 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-6.6-5.1A23 23 0 0 0 1 24c0 3.7.9 7.2 2.5 10.3l6.9-5.7z"/>
            <path fill="#34A853" d="M24 46.5c5.2 0 9.6-1.7 12.8-4.7l-6.8-5.3c-1.7 1.2-3.9 1.9-6 1.9-6.4 0-11.8-4-13.7-9.8l-6.9 5.7C7.2 41.5 15 46.5 24 46.5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Login;