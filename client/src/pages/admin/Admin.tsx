import { useState, useEffect, useRef } from "react";
import { db } from "../../firebase"; 
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

import type { GameEdition, MonopolyTile } from "./AdminTypes";
import { AdminDashboard } from "./AdminDashboard";
import { AdminCreate } from "./AdminCreate";
import { AdminEditEdition } from "./AdminEditEdition";

function Admin() {
  const [editions, setEditions] = useState<GameEdition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<GameEdition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [editNameValue, setEditNameValue] = useState<string>("");
  const [routePath, setRoutePath] = useState<string>("/admin");
  const selectedIdRef = useRef<string | null>(null);

  const navigateTo = (path: string, params?: Record<string, string>) => {
    setRoutePath(path);
    if (params?.editionId) {
      selectedIdRef.current = params.editionId;
      const match = editions.find(e => e.id === params.editionId);
      if (match) {
        setSelectedEdition(match);
        setEditNameValue(match.name);
      }
    } else {
      selectedIdRef.current = null;
      setSelectedEdition(null);
    }
  };

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
      
      if (selectedIdRef.current) {
        const currentMatch = liveEditions.find(e => e.id === selectedIdRef.current);
        if (currentMatch) setSelectedEdition(currentMatch);
      }
      setLoading(false);
    });
    return () => unsubscribe(); 
  }, [editions.length]); // Added array dependency tracking to safely resolve race conditions

  const handleCreateEdition = async (name: string) => {
    const baselineTiles: MonopolyTile[] = Array.from({ length: 40 }, (_, index) => ({
      id: `tile-${index}-${Math.random().toString(36).substring(2, 7)}`, 
      name: `Tile ${index}`,
      type: "property", 
      money: 0, price: 100, rent: 10, sellValue: 50, group: ""
    }));
    try {
      await addDoc(collection(db, "game_editions"), { name: name.trim(), tiles: baselineTiles, activities: [] });
      navigateTo("/admin");
    } catch (err) {
      alert("Firestore Write Failed: " + err);
    }
  };

  const handleUpdateEditionName = async () => {
    if (!selectedEdition) return;
    try {
      await updateDoc(doc(db, "game_editions", selectedEdition.id), { name: editNameValue.trim() });
      setIsRenaming(false);
    } catch (err) {
      alert("Failed to update name: " + err);
    }
  };

  const handleSaveTileRules = async (tileData: Partial<MonopolyTile> & { index: number }) => {
    if (!selectedEdition) return;
    const updatedTiles = [...selectedEdition.tiles];
    const { index, ...rest } = tileData;
    updatedTiles[index] = { ...updatedTiles[index], ...rest };
    try {
      await updateDoc(doc(db, "game_editions", selectedEdition.id), { tiles: updatedTiles });
    } catch (err) {
      alert("Update Failed: " + err);
    }
  };

  const handleDeleteEdition = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, "game_editions", id));
    } catch (err) {
      alert("Delete Failed: " + err);
    }
  };

  const handleAddPopQuizActivity = async (quiz: { question: string; options: string[]; correctAnswer: string }) => {
    if (!selectedEdition) return;
    const updated = [...(selectedEdition.activities || []), { id: "quiz_" + Date.now(), ...quiz }];
    try {
      await updateDoc(doc(db, "game_editions", selectedEdition.id), { activities: updated });
    } catch (err) {
      alert("Failed to save quiz: " + err);
    }
  };

  const handleRemoveActivityItem = async (id: string) => {
    if (!selectedEdition) return;
    const updated = selectedEdition.activities?.filter(act => act.id !== id) || [];
    try {
      await updateDoc(doc(db, "game_editions", selectedEdition.id), { activities: updated });
    } catch (err) {
      alert("Failed to remove item: " + err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-56px)] bg-[#FFF5E4] flex items-center justify-center">
        <p className="text-slate-700 font-bold animate-pulse text-lg">Querying Cloud Firestore Matrix...</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#FFF5E4] flex flex-col text-slate-800 select-none p-6 overflow-y-auto">
      {routePath === "/admin" && (
        <AdminDashboard editions={editions} navigateTo={navigateTo} onDelete={handleDeleteEdition} />
      )}
      
      {routePath === "/admin/create" && (
        <AdminCreate onCreate={handleCreateEdition} navigateTo={navigateTo} />
      )}

      {routePath.startsWith("/admin/") && routePath !== "/admin/create" && (
        <AdminEditEdition 
          selectedEdition={selectedEdition || editions.find(e => e.id === routePath.split("/")[2])!} 
          isRenaming={isRenaming} setIsRenaming={setIsRenaming}
          editNameValue={editNameValue} setEditNameValue={setEditNameValue} handleUpdateEditionName={handleUpdateEditionName}
          handleSaveTileRules={handleSaveTileRules} handleAddPopQuizActivity={handleAddPopQuizActivity}
          handleRemoveActivityItem={handleRemoveActivityItem} navigateTo={navigateTo}
        />
      )}
    </main>
  );
}

export default Admin;