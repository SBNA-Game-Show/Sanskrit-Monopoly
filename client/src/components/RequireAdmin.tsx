import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RequireAdmin() {
  const { isAdmin, authLoading } = useAuth();

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <Navigate to="/welcome" replace />;
  }

  return <Outlet />;
}

export default RequireAdmin;
