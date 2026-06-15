import Navbar from "../components/Navbar";
import { TransitionProvider } from "../components/TransitionOverlay";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <TransitionProvider>
      <Navbar />
      <Outlet />
    </TransitionProvider>
  );
}

export default RootLayout;
