import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { uid, username, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header className="flex min-h-14 items-center justify-end gap-4 border-b border-orange-200 bg-white px-4 py-2">
      {uid && (
        <div className="flex flex-col items-end">
          <p className="m-0 text-sm font-semibold text-slate-700">
            {username || "Unknown user"} · {isAdmin ? "Admin" : "Player"}
          </p>

          <p className="m-0 mt-0.5 text-[0.7rem] text-slate-400">UID: {uid}</p>
        </div>
      )}

      {uid && (
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-200 hover:text-slate-900"
        >
          Logout
        </button>
      )}
    </header>
  );
}

export default Navbar;
