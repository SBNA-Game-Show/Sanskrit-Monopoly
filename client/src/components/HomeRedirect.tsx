import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomeRedirect() {
  const { uid, isAdmin, authLoading } = useAuth();

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!uid) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin ? "/admin" : "/welcome"} replace />;
}

export default HomeRedirect;
