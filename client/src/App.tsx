import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import FirebaseSetupNotice from './components/FirebaseSetupNotice';
import HomeRedirect from './components/HomeRedirect';
import RedirectIfAuthed from './components/RedirectIfAuthed';
import RequireAdmin from './components/RequireAdmin';
import RequireAuth from './components/RequireAuth';
import { isFirebaseConfigured } from './firebase';
import Admin from './pages/Admin';
import Login from './pages/Login';
import RootLayout from './pages/RootLayout';
import Welcome from './pages/Welcome';

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
  if (!isFirebaseConfigured) {
    return <FirebaseSetupNotice />;
  }

  return <RouterProvider router={router}/>
}

export default App
