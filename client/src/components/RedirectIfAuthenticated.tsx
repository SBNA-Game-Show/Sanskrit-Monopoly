import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RedirectIfAuthed() {
  const { uid, isAdmin, authLoading } = useAuth();

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (uid) {
    return <Navigate to={isAdmin ? "/admin" : "/welcome"} replace />;
  }

  return <Outlet />;
}

export default RedirectIfAuthed;
