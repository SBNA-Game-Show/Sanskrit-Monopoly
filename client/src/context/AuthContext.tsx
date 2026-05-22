import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"
import { auth, db, isFirebaseConfigured } from "../firebase"


interface AuthContextValue {
  uid: string | null;
  username: string | null;
  isAdmin: boolean | null;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }) {
  const [uid, setUid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUid(firebaseUser.uid);
        setUsername(firebaseUser.displayName);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid, "private", "account"));
        setIsAdmin(userDoc.data()?.isAdmin);
        setAuthLoading(false);
      } else {
        setUid(null);
        setUsername(null);
        setIsAdmin(null);
        setAuthLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ uid, username, isAdmin, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) {
    throw Error("useAuth must be used under an AuthProvider!");
  }
  return c;
}