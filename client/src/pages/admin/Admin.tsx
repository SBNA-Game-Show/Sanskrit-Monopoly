import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase"; 
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import type { GameEdition} from "./AdminTypes";
import { AdminDashboard } from "./AdminDashboard";


function Admin() {
  const [editions, setEditions] = useState<GameEdition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const editionsCollectionRef = collection(db, "game_editions");
    const unsubscribe = onSnapshot(editionsCollectionRef, (snapshot) => {
      const liveEditions = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Edition",
        tiles: doc.data().tiles || [], 
        activities: doc.data().activities || []
      } as GameEdition));
      
      setEditions(liveEditions);
      setLoading(false);
    }, (error) => {
          console.error("Firestore dashboard stream sync fail:", error);
          setLoading(false);
    });
    return () => unsubscribe(); 
  }, []);

  const handleDeleteEdition = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, "game_editions", id));
    } catch (err) {
      alert("Delete Failed: " + err);
    }
  };

  const handleNavigationRoute = (path: string, params?: Record<string, string>) => {
    if (params?.editionId) {
      navigate(`/admin/edit/${params.editionId}`); 
    } else {
      navigate(path);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-56px)] bg-[#FFF5E4] flex items-center justify-center">
          <p className="text-slate-700 font-bold animate-pulse text-lg">Fetching Cloud Firestore Matrix</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#FFF5E4] flex flex-col text-slate-800 select-none p-6 overflow-y-auto">
      <AdminDashboard 
        editions={editions} 
        navigateTo={handleNavigationRoute} 
        onDelete={handleDeleteEdition} 
      />
    </main>
  );
}

export default Admin;