import { createBrowserRouter, RouterProvider } from 'react-router-dom';

//Pages
import Admin from './pages/Admin';
import Login from './pages/Login';
import RootLayout from './pages/RootLayout';
import Welcome from './pages/Welcome';

//RBAC
import HomeRedirect from './components/HomeRedirect';
import RedirectIfAuthed from './components/RedirectIfAuthenticated';
import RequireAdmin from './components/RequireAdmin';
import RequireAuth from './components/RequireAuth';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        element: <RedirectIfAuthed />,
        children: [{ path: 'login', element: <Login /> }],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'welcome', element: <Welcome /> },
          {
            element: <RequireAdmin />,
            children: [{ path: 'admin', element: <Admin /> }],
          },
        ],
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router}/>
}

export default App
