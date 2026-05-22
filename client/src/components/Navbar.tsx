import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { uid, username, isAdmin } = useAuth();
  const navigate = useNavigate();

  function navigateToLoginPage() {
    navigate("/login");
  }

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    navigateToLoginPage();
  };

  return (
    <>
      <h1>Sanskrit Monopoly</h1>
      <h2>uid: {uid}</h2>
      <h2>username: {username}</h2>
      <h2>isAdmin: {isAdmin ? "true" : "false"}</h2>
      {uid && <button onClick={handleLogout}>Logout</button>}
      <hr />
    </>
  );
}

export default Navbar;