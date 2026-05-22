import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { uid, username, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-user">
        <p className="navbar-meta">
          {username || "Unknown user"} · {isAdmin ? "Admin" : "Player"}
        </p>
        <p className="navbar-uid">UID: {uid}</p>
      </div>

      {uid && <button onClick={handleLogout}>Logout</button>}
    </header>
  );
}

export default Navbar;
