import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import FirebaseSetupNotice from './components/FirebaseSetupNotice';
import { isFirebaseConfigured } from './firebase';
import RootLayout from './pages/RootLayout';
import JoinLobby from './pages/JoinLobby';
import Login from './pages/Login';

const router = createBrowserRouter([
  { path:'/', 
    element: <RootLayout />,
    children: [
      { index: true, element: <JoinLobby /> },
      { path: 'login', element: <Login /> },
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
