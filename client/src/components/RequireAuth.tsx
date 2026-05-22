import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RequireAuth() {
  const { uid, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!uid) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireAuth;
