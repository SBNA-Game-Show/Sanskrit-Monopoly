import { createBrowserRouter, RouterProvider } from "react-router-dom";

//RBAC
import HomeRedirect from "./components/HomeRedirect";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";
import RequireAdmin from "./components/RequireAdmin";
import RequireAuth from "./components/RequireAuth";

//Pages
import Admin from "./pages/admin/Admin";
import Login from "./pages/Login";
import RootLayout from "./pages/RootLayout";
import Home from "./pages/Home";
import Rules from "./pages/Rules";
import Lobby from "./pages/Lobby";
import ActiveLobbies from "./pages/ActiveLobbies";
//import Game from "./pages/Game";
//import AdminGame from "./pages/AdminGame";
import Result from "./pages/Result";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: "result", element: <Result /> }, // TEST ROUTE
      {
        element: <RedirectIfAuthenticated />,
        children: [{ path: "login", element: <Login /> }],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: "home", element: <Home /> },
          {
            element: <RequireAdmin />,
            children: [{ path: "admin", element: <Admin /> }],
          },
          { path: "rules", element: <Rules /> },
          { path: "lobby/:lobbyCode", element: <Lobby /> },
          { path: "active-lobbies", element: <ActiveLobbies /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
