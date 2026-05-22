import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomeRedirect() {
  const { uid, authLoading } = useAuth();

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!uid) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/welcome" replace />;
}

export default HomeRedirect;
