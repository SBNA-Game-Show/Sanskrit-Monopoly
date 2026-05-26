import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RequireAuth() {
  const { uid, authLoading } = useAuth();
  const location = useLocation();

  // why the hell not
  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-orange-50 text-slate-600">
        Loading...
      </main>
    );
  }

  if (!uid) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireAuth;
