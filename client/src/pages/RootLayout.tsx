import Navbar from "../components/Navbar";
import { Outlet, useLocation } from "react-router-dom";

function RootLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/lobby/");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Outlet />
    </>
  );
}

export default RootLayout;
