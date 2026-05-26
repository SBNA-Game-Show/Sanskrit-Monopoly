import { useState, type ComponentProps } from "react";
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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();

  const handleLogin: ComponentProps<"form">["onSubmit"] = async (e) => {
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
    <>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </>
  );
}

export default Login;
