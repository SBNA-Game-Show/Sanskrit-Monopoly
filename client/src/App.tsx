import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./pages/RootLayout";
import JoinLobby from "./pages/JoinLobby";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Rules from "./pages/Rules";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "joinlobby", element: <JoinLobby /> },
      { path: "login", element: <Login /> },
      { path: "rules", element: <Rules /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
