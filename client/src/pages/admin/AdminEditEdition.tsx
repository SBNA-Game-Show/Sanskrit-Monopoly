import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import type { GameEdition } from "./AdminTypes";
import { AdminEditTiles } from "./AdminEditTiles";
import { AdminEditQuestions } from "./AdminEditQuestions";

export const AdminEditEdition: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"tiles" | "questions">("tiles");
  const [selectedEdition, setSelectedEdition] = useState<GameEdition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [editNameValue, setEditNameValue] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "game_editions", id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSelectedEdition({
          id: snapshot.id,
          name: data.name || "Unnamed Edition",
          tiles: data.tiles || [],
          activities: data.activities || [],
          draft: data.draft === undefined ? true : data.draft
        } as GameEdition);
        setEditNameValue(data.name || "");
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore single item sync error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  const handleUpdateEditionName = async () => {
    if (!id) return;
    try {
      await updateDoc(doc(db, "game_editions", id), { name: editNameValue.trim() });
      setIsRenaming(false);
    } catch (err) {
      alert("Failed to update name: " + err);
    }
  };

  const updateEdition = async (data: Partial<GameEdition>, errorLabel: string): Promise<boolean> => {
    if (!id) return false;
    try {
      await updateDoc(doc(db, "game_editions", id), data);
      return true;
    } catch (err) {
      alert(`${errorLabel}: ${err}`);
      return false;
    }
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-56px)] bg-[#FFF5E4] flex items-center justify-center">
        <p className="text-slate-700 font-bold animate-pulse text-lg">Loading Parameters Array...</p>
      </main>
    );
  }

  if (!selectedEdition) {
    return (
      <main className="min-h-[calc(100vh-56px)] bg-[#FFF5E4] flex flex-col items-center justify-center space-y-2">
        <p className="text-red-600 font-bold text-lg">Error: Configuration File Not Found</p>
        <button onClick={() => navigate("/admin")} className="bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl">Back to List</button>
      </main>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      {/* 1. UNIVERSAL TOP HEADER BAR */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex justify-between items-center">
        <div>
          {isRenaming ? (
            <div className="flex items-center gap-2 bg-[#FFF5E4] p-1.5 rounded-xl border border-orange-300">
              <input type="text" value={editNameValue} onChange={(e) => setEditNameValue(e.target.value)} className="bg-white rounded-lg px-3 py-1 text-sm font-bold text-slate-900 focus:outline-none border border-orange-200" />
              <button type="button" onClick={handleUpdateEditionName} className="bg-[#5CB85C] hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Save</button>
              <button type="button" onClick={() => { setIsRenaming(false); setEditNameValue(selectedEdition.name); }} className="text-gray-500 text-xs font-bold px-2 hover:text-gray-700">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedEdition.name}</h2>
              <button type="button" onClick={() => setIsRenaming(true)} className="text-xs text-blue-600 hover:text-blue-800 font-bold underline bg-blue-50 px-2.5 py-1 rounded-lg transition-colors shadow-sm">Rename Edition</button>
            </div>
          )}
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mt-1">Edition, Tiles, Reward, Penalty setup board</span>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-inner">
            <span className="text-xs font-black text-slate-700 tracking-tight">Draft</span>
            <button
              type="button"
              role="switch"
              aria-checked={selectedEdition.draft ?? true}
              onClick={() => updateEdition({ draft: !(selectedEdition.draft ?? true) }, "Failed to update draft status")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                (selectedEdition.draft ?? true) ? "bg-slate-800" : "bg-[#5CB85C]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#00ADFF] transition-transform ${
                  (selectedEdition.draft ?? true) ? "translate-x-1" : "translate-x-6"
                }`}
              />
            </button>
          </div>
        <button onClick={() => navigate("/admin")} className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors">Back to Dashboard</button>
        </div>
      </div>

      {/* 2. NAVIGATION TAB TOGGLES BAR */}
      <div className="flex items-center gap-8 border-b-2 border-orange-100 pb-2 px-2">
        <button
          type="button"
          onClick={() => setSelectedTab("tiles")}
          className={`text-2xl font-black tracking-tight transition-all pb-1 ${
            selectedTab === "tiles" ? "text-slate-900 border-b-4 border-orange-500 scale-100 opacity-100" : "text-slate-400 hover:text-slate-600 scale-95 opacity-70"
          }`}
        >
          Tiles
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab("questions")}
          className={`text-2xl font-black tracking-tight transition-all pb-1 ${
            selectedTab === "questions" ? "text-slate-900 border-b-4 border-orange-500 scale-100 opacity-100" : "text-slate-400 hover:text-slate-600 scale-95 opacity-70"
          }`}
        >
          Questions
        </button>
      </div>

      {/* 3. CONDITIONAL CHILD VIEWS - each tab now owns its own state and handlers */}
      {selectedTab === "tiles" ? (
        <AdminEditTiles selectedEdition={selectedEdition} updateEdition={updateEdition} />
      ) : (
        <AdminEditQuestions selectedEdition={selectedEdition} updateEdition={updateEdition} />
      )}
    </div>
  );
};
