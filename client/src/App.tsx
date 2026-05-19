import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import RootLayout from './pages/RootLayout';
import JoinLobby from './pages/JoinLobby';
import Login from './pages/Login';

const router = createBrowserRouter([
  { path:'/', 
    element: <RootLayout />,
    children: [
      { path:'/', element: <JoinLobby /> },
      { path:'/login', element: <Login /> },
    ], 
  },
])

function App() {
  return <RouterProvider router={router}/>
}

export default App
