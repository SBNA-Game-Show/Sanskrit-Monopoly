import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

interface GameEdition {
  id: string;
  name: string;
  rewards: Record<string, number>;    
  penalties: Record<string, number>;  
}

function Admin() {
  // ==========================================
  // 1. STATE INITIALIZATIONS
  // ==========================================
  const [currentView, setView] = useState<"dashboard" | "create" | "edit">("dashboard");
  const [editions, setEditions] = useState<GameEdition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<GameEdition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [newEditionName, setNewEditionName] = useState("");
  const [targetTileName, setTargetTileName] = useState("");
  const [tileReward, setTileReward] = useState<number>(0);
  const [tilePenalty, setTilePenalty] = useState<number>(0);

  // ==========================================
  // 2. DATA HYDRATION HOOK (PASTE COMPONENT 3 HERE)
  // ==========================================
  useEffect(() => {
    const editionsCollectionRef = collection(db, "game_editions");
    
    const unsubscribe = onSnapshot(editionsCollectionRef, (snapshot) => {
      const liveEditions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unnamed Edition",
          rewards: data.rewards || {},
          penalties: data.penalties || {},
        } as GameEdition;
      });
      setEditions(liveEditions);
      setLoading(false);
    }, (error: any) => {
      console.error("Firestore access blocked. Initializing local workspace memory container...", error);
      const stored = localStorage.getItem("mock_game_editions");
      if (stored) {
        setEditions(JSON.parse(stored));
      } else {
        const initialSeed: GameEdition[] = [
          { id: "seed_1", name: "Good Morals Edition", rewards: { "शब्द-परीक्षा": 100 }, penalties: { "शब्द-परीक्षा": 50 } },
          { id: "seed_2", name: "Temple Edition", rewards: {}, penalties: {} }
        ];
        setEditions(initialSeed);
        localStorage.setItem("mock_game_editions", JSON.stringify(initialSeed));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ==========================================
  // 3. CORE UTILITY LOCAL STORAGE ACCELERATOR
  // ==========================================
  const saveToLocalFallback = (updatedEditions: GameEdition[]) => {
    localStorage.setItem("mock_game_editions", JSON.stringify(updatedEditions));
    setEditions(updatedEditions);
  };

  // ==========================================
  // 4. ACTION HANDLERS (PASTE COMPONENT 1 & 2 HERE)
  // ==========================================
  
  // 1. Create Edition
  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditionName.trim()) return;

    try {
      await addDoc(collection(db, "game_editions"), {
        name: newEditionName.trim(),
        rewards: {},
        penalties: {}
      });
      setNewEditionName("");
      setView("dashboard");
    } catch (err: any) {
      if (err.code === "permission-denied" || err.message?.includes("permissions")) {
        console.warn("Firebase locked down. Redirecting entry pass to Local Storage...");
        
        const newMockEdition: GameEdition = {
          id: "mock_" + Date.now(),
          name: newEditionName.trim(),
          rewards: {},
          penalties: {}
        };
        
        const updated = [...editions, newMockEdition];
        saveToLocalFallback(updated);
        
        setNewEditionName("");
        setView("dashboard");
      } else {
        alert("Error adding edition: " + err);
      }
    }
  };

  // 2. Add or Update a Tile Rule
  const handleSaveTileRules = async () => {
    if (!selectedEdition || !targetTileName.trim()) return;

    const updatedRewards = { ...selectedEdition.rewards, [targetTileName.trim()]: Number(tileReward) };
    const updatedPenalties = { ...selectedEdition.penalties, [targetTileName.trim()]: Number(tilePenalty) };
    
    const updatedEditionObj = {
      ...selectedEdition,
      rewards: updatedRewards,
      penalties: updatedPenalties
    };

  try {
      const editionDocRef = doc(db, "game_editions", selectedEdition.id);
      await updateDoc(editionDocRef, {
        rewards: updatedRewards,
        penalties: updatedPenalties
      });
      
      setSelectedEdition(updatedEditionObj);
      setTargetTileName("");
      setTileReward(0);
      setTilePenalty(0);
    } catch (err: any) {
      if (err.code === "permission-denied" || err.message?.includes("permissions")) {
        console.warn("Firebase locked down. Updating local cache footprint instead...");
        
        const updatedEditionsList = editions.map(item => 
          item.id === selectedEdition.id ? updatedEditionObj : item
        );
        
        setSelectedEdition(updatedEditionObj);
        saveToLocalFallback(updatedEditionsList);
        
        setTargetTileName("");
        setTileReward(0);
        setTilePenalty(0);
      } else {
        alert("Failed updating ruleset: " + err);
      }
    }
  };

  // 3. Remove a specific tile configuration completely (With Fail-Safe)
  const handleRemoveTileRule = async (tileKeyToRemove: string) => {
    if (!selectedEdition) return;

    const updatedRewards = { ...selectedEdition.rewards };
    const updatedPenalties = { ...selectedEdition.penalties };
    
    delete updatedRewards[tileKeyToRemove];
    delete updatedPenalties[tileKeyToRemove];

    const updatedEditionObj = {
      ...selectedEdition,
      rewards: updatedRewards,
      penalties: updatedPenalties
    };

    try {
      const editionDocRef = doc(db, "game_editions", selectedEdition.id);
      await updateDoc(editionDocRef, {
        rewards: updatedRewards,
        penalties: updatedPenalties
      });

      setSelectedEdition(updatedEditionObj);
    } catch (err: any) {
      if (err.code === "permission-denied" || err.message?.includes("permissions")) {
        console.warn("Firebase locked down. Removing tile rule locally...");
        const updatedEditionsList = editions.map(item => 
          item.id === selectedEdition.id ? updatedEditionObj : item
        );
        setSelectedEdition(updatedEditionObj);
        saveToLocalFallback(updatedEditionsList);
      } else {
        alert("Failed clearing tile rules: " + err);
      }
    }
  };

  // 4. Permanently delete an entire edition packet (With Fail-Safe)
  const handleDeleteEdition = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      await deleteDoc(doc(db, "game_editions", id));
    } catch (err: any) {
      if (err.code === "permission-denied" || err.message?.includes("permissions")) {
        console.warn("Firebase locked down. Deleting edition locally...");
        const updatedEditionsList = editions.filter(item => item.id !== id);
        saveToLocalFallback(updatedEditionsList);
      } else {
        alert("Failed erasing edition: " + err);
      }
    }
  };

  // ==========================================
  // 5. RENDER TEMPLATE LAYOUT SHUTTLE
  // ==========================================
  if (loading) {
    return (
      <main className="min-h-[calc(100vh-56px)] bg-[#FFF5E4] flex items-center justify-center font-sans">
        <p className="text-slate-700 font-bold animate-pulse text-lg">Synchronizing Sanskrit Workspace Environment...</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#FFF5E4] flex flex-col font-sans text-slate-800 select-none">
      <div className="p-6 flex-1 overflow-y-auto">

        {/* VIEW 1: DASHBOARD */}
        {currentView === "dashboard" && (
          <div className="bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-5 h-full flex flex-col shadow-sm max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Game Configurations Panel</h3>
                <p className="text-xs text-gray-500">Assign rewards & penalties to game editions.</p>
              </div>
              <button
                onClick={() => setView("create")}
                className="bg-[#5CB85C] hover:bg-green-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Create New Edition
              </button>
            </div>

            <div className="border-2 border-[#00ADFF] rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-slate-50 border-b-2 border-[#00ADFF] grid grid-cols-12 px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-6">Configuration (Editions)</div>
                <div className="col-span-3">Configured Tiles</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-100">
                {editions.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400 font-medium">No game editions found. Click Create to begin.</div>
                ) : (
                  editions.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 px-4 py-4 items-center text-sm text-slate-700 font-semibold hover:bg-orange-50/30 transition-colors">
                      <div className="col-span-6 text-base text-slate-900">{item.name}</div>
                      <div className="col-span-3 pl-4">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          {Object.keys(item.rewards || {}).length} Tiles Map
                        </span>
                      </div>
                      <div className="col-span-3 flex justify-end gap-2">
                        <button
                          onClick={() => { setSelectedEdition(item); setView("edit"); }}
                          className="bg-[#3B71CA] hover:bg-blue-600 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-colors shadow-sm"
                        >
                          Configure Rules
                        </button>
                        <button
                          onClick={() => handleDeleteEdition(item.id, item.name)}
                          className="bg-[#DC4C64] hover:bg-red-600 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-colors shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CREATE */}
        {currentView === "create" && (
          <div className="bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-6 shadow-sm max-w-lg mx-auto w-full">
            <h2 className="text-center text-lg font-black text-slate-800 uppercase tracking-wide mb-4">
              Create Game Edition
            </h2>
            
            <form onSubmit={handleCreateEdition} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Edition Name</label>
                <div className="bg-[#FFC288] p-0.5 rounded-xl border border-[#FA9232]">
                  <input
                    type="text"
                    value={newEditionName}
                    onChange={(e) => setNewEditionName(e.target.value)}
                    placeholder="e.g., Good Morals Edition..."
                    className="w-full bg-[#FFF5E4] border-none rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setView("dashboard")}
                  className="bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5CB85C] hover:bg-green-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Create Edition
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: EDIT CONTROL */}
        {currentView === "edit" && selectedEdition && (
          <div className="max-w-4xl mx-auto w-full space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedEdition.name}</h2>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tile Economics Setup Matrix</span>
              </div>
              <button 
                onClick={() => setView("dashboard")}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            <div className="grid grid-cols-12 gap-5 items-start">
              
              <div className="col-span-5 bg-[#FFC288] rounded-2xl p-4 border border-orange-300 shadow-sm space-y-4">
                <div>
                  <span className="text-sm font-black text-slate-800 block">Configure Tile Rules</span>
                  <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wide">Assign values to explicit tile properties</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Target Tile Title Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., शब्द-परीक्षा" 
                      value={targetTileName}
                      onChange={(e) => setTargetTileName(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-orange-300 font-medium text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Reward (+ धनम्)</label>
                      <input 
                        type="number" 
                        value={tileReward}
                        onChange={(e) => setTileReward(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-white border border-orange-300 font-medium text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Penalty (- धनम्)</label>
                      <input 
                        type="number" 
                        value={tilePenalty}
                        onChange={(e) => setTilePenalty(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-white border border-orange-300 font-medium text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveTileRules}
                    className="w-full bg-[#5CB85C] hover:bg-green-600 text-white font-bold p-2.5 rounded-xl transition-colors shadow-sm mt-2"
                  >
                    Bind Configuration to Tile
                  </button>
                </div>
              </div>

              <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-4 space-y-2 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-orange-100 pb-2 mb-2">
                  Mapped Tile Rules Matrix
                </h4>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {Object.keys(selectedEdition.rewards || {}).length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No custom tile economic values bound to this edition yet.</p>
                  ) : (
                    Object.keys(selectedEdition.rewards).map((tile) => (
                      <div key={tile} className="bg-white border border-orange-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 flex justify-between items-center shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-base text-slate-900 font-bold">{tile}</span>
                          <span className="text-xs text-slate-500 font-medium mt-0.5">
                            Reward: <span className="text-green-600">+{selectedEdition.rewards[tile]}</span> | 
                            Penalty: <span className="text-red-500">-{selectedEdition.penalties[tile] || 0}</span> धनम्
                          </span>
                        </div>
                        <button 
                          onClick={() => handleRemoveTileRule(tile)}
                          className="text-red-600 hover:text-red-800 font-bold text-sm px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus:outline-none"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default Admin;