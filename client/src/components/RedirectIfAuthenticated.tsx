import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RedirectIfAuthenticated() {
  const { uid, authLoading } = useAuth();

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (uid) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export default RedirectIfAuthenticated;
