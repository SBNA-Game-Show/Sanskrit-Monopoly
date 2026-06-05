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
  rewards: Record<string, number>;    // Maps unique tile name to point rewards
  penalties: Record<string, number>;  // Maps unique tile name to point penalties
}

function Admin() {
  // ==========================================
  // 1. STATE CONFIGURATIONS
  // ==========================================
  const [currentView, setView] = useState<"dashboard" | "create" | "edit">("dashboard");
  const [editions, setEditions] = useState<GameEdition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<GameEdition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [newEditionName, setNewEditionName] = useState("");
  const [targetTileName, setTargetTileName] = useState("");
  
  // Exclusive Type Selector: "reward" | "penalty"
  const [tileType, setTileType] = useState<"reward" | "penalty">("reward");
  const [tileValue, setTileValue] = useState<number>(0);

  // ==========================================
  // 2. EXCLUSIVE FIRESTORE REAL-TIME STREAM
  // ==========================================
  useEffect(() => {
    const editionsCollectionRef = collection(db, "game_editions");
    
    // Direct link to the cloud document collections snapshot
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
      
      // Keep selected tracking pointer sync'd during updates
      if (selectedEdition) {
        const matchingCurrent = liveEditions.find(e => e.id === selectedEdition.id);
        if (matchingCurrent) {
          setSelectedEdition(matchingCurrent);
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Firestore stream error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedEdition]);

  // ==========================================
  // 3. CORE WRITE OPERATIONS (FIRESTORE ONLY)
  // ==========================================
  
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
    } catch (err) {
      alert("Firestore Write Failed: " + err);
    }
  };

  const handleSaveTileRules = async () => {
    if (!selectedEdition || !targetTileName.trim()) return;

    const tileKey = targetTileName.trim();
    
    // Create shallow copies of existing maps to perform modifications safely
    const updatedRewards = { ...selectedEdition.rewards };
    const updatedPenalties = { ...selectedEdition.penalties };

    // REQUIREMENT 2: Enforce strict mutual exclusivity per tile name
    if (tileType === "reward") {
      updatedRewards[tileKey] = Number(tileValue);
      delete updatedPenalties[tileKey]; // Clean up and erase any conflicting penalty link
    } else {
      updatedPenalties[tileKey] = Number(tileValue);
      delete updatedRewards[tileKey]; // Clean up and erase any conflicting reward link
    }

    try {
      const editionDocRef = doc(db, "game_editions", selectedEdition.id);
      await updateDoc(editionDocRef, {
        rewards: updatedRewards,
        penalties: updatedPenalties
      });

      setTargetTileName("");
      setTileValue(0);
      alert("Tile configuration saved directly to Firestore.");
    } catch (err) {
      alert("Firestore Update Failed: " + err);
    }
  };

  const handleRemoveTileRule = async (tileKeyToRemove: string) => {
    if (!selectedEdition) return;

    const updatedRewards = { ...selectedEdition.rewards };
    const updatedPenalties = { ...selectedEdition.penalties };
    
    delete updatedRewards[tileKeyToRemove];
    delete updatedPenalties[tileKeyToRemove];

    try {
      const editionDocRef = doc(db, "game_editions", selectedEdition.id);
      await updateDoc(editionDocRef, {
        rewards: updatedRewards,
        penalties: updatedPenalties
      });
    } catch (err) {
      alert("Firestore Deletion Failed: " + err);
    }
  };

  const handleDeleteEdition = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, "game_editions", id));
      if (selectedEdition?.id === id) setSelectedEdition(null);
    } catch (err) {
      alert("Firestore Purge Failed: " + err);
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
    <main className="min-h-[calc(100vh-56px)] bg-[#FFF5E4] flex flex-col text-slate-800 select-none">
      <div className="p-6 flex-1 overflow-y-auto">

        {/* VIEW 1: DASHBOARD PACKETS PANEL */}
        {currentView === "dashboard" && (
          <div className="bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-5 h-full flex flex-col shadow-sm max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Game Configurations Panel</h3>
                <p className="text-xs text-gray-500">Live Server Mode (LocalStorage Cache Disengaged).</p>
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
                <div className="col-span-3">Active Rules Mapping</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-100">
                {editions.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400 font-medium">No cloud configurations detected.</div>
                ) : (
                  editions.map((item) => {
                    const totalRulesCount = new Set([
                      ...Object.keys(item.rewards || {}),
                      ...Object.keys(item.penalties || {})
                    ]).size;

                    return (
                      <div key={item.id} className="grid grid-cols-12 px-4 py-4 items-center text-sm text-slate-700 font-semibold hover:bg-orange-50/30 transition-colors">
                        <div className="col-span-6 text-base text-slate-900">{item.name}</div>
                        <div className="col-span-3 pl-4">
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            {totalRulesCount} Rule Enforcements
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
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CREATE Packets VIEW */}
        {currentView === "create" && (
          <div className="bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-6 shadow-sm max-w-lg mx-auto w-full">
            <h2 className="text-center text-lg font-black text-slate-800 uppercase tracking-wide mb-4">
              Create New Game Edition
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

        {/* VIEW 3: DYNAMIC TILE PARAMETERS MAP VIEW */}
        {currentView === "edit" && selectedEdition && (
          <div className="max-w-4xl mx-auto w-full space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedEdition.name}</h2>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tile Economics Setup Matrix</span>
              </div>
              <button 
                onClick={() => { setView("dashboard"); setSelectedEdition(null); }}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            <div className="grid grid-cols-12 gap-5 items-start">
              
              {/* Form Config Control Sidebar */}
              <div className="col-span-5 bg-[#FFC288] rounded-2xl p-4 border border-orange-300 shadow-sm space-y-4">
                <div>
                  <span className="text-sm font-black text-slate-800 block">Configure Tile Rules</span>
                  <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wide">Assign strict value types to specific tile titles</span>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Tile Title Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., शब्द-परीक्षा" 
                      value={targetTileName}
                      onChange={(e) => setTargetTileName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-orange-300 font-medium text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* REQUIREMENT 2: Selector for Exclusive Rule Determination */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Rule Classification Type</label>
                    <div className="grid grid-cols-2 gap-2 bg-[#FFF5E4] p-1 rounded-xl border border-orange-300">
                      <button
                        type="button"
                        onClick={() => setTileType("reward")}
                        className={`py-2 rounded-lg font-bold transition-all text-center ${tileType === "reward" ? "bg-[#5CB85C] text-white shadow-sm" : "text-slate-600 hover:bg-white/40"}`}
                      >
                        Reward (+ धनम्)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTileType("penalty")}
                        className={`py-2 rounded-lg font-bold transition-all text-center ${tileType === "penalty" ? "bg-[#DC4C64] text-white shadow-sm" : "text-slate-600 hover:bg-white/40"}`}
                      >
                        Penalty (- धनम्)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Point Modifier Absolute Magnitude</label>
                    <input 
                      type="number" 
                      min="0"
                      value={tileValue}
                      onChange={(e) => setTileValue(Math.abs(Number(e.target.value)))}
                      className="w-full p-2.5 rounded-xl bg-white border border-orange-300 font-bold text-slate-900 focus:outline-none text-base"
                    />
                  </div>

                  <button
                    onClick={handleSaveTileRules}
                    className="w-full bg-[#5CB85C] hover:bg-green-600 text-white font-bold p-3 rounded-xl transition-all shadow-sm transform active:scale-[0.98] text-sm"
                  >
                    Bind Configuration to Tile
                  </button>
                </div>
              </div>

              {/* Rules List Matrix Canvas */}
              <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-4 space-y-2 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-orange-100 pb-2 mb-2">
                  Mapped Tile Rules Matrix
                </h4>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {Object.keys(selectedEdition.rewards || {}).length === 0 && Object.keys(selectedEdition.penalties || {}).length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No custom parameters bound to this database matrix path yet.</p>
                  ) : (
                    <>
                      {/* Render Rewards sub-tree */}
                      {Object.keys(selectedEdition.rewards || {}).map((tile) => (
                        <div key={`rew-${tile}`} className="bg-white border border-orange-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 flex justify-between items-center shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-base text-slate-900 font-bold">{tile}</span>
                            <span className="text-xs font-bold mt-0.5 text-green-600 bg-green-50 px-2 py-0.5 rounded-md w-max">
                              Reward Action: +{selectedEdition.rewards[tile]} Points / धनम्
                            </span>
                          </div>
                          <button 
                            onClick={() => handleRemoveTileRule(tile)}
                            className="text-red-600 hover:text-red-800 font-bold text-sm px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus:outline-none"
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      {/* Render Penalties sub-tree */}
                      {Object.keys(selectedEdition.penalties || {}).map((tile) => (
                        <div key={`pen-${tile}`} className="bg-white border border-orange-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 flex justify-between items-center shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-base text-slate-900 font-bold">{tile}</span>
                            <span className="text-xs font-bold mt-0.5 text-red-500 bg-red-50 px-2 py-0.5 rounded-md w-max">
                              Penalty Action: -{selectedEdition.penalties[tile]} Points / धनम्
                            </span>
                          </div>
                          <button 
                            onClick={() => handleRemoveTileRule(tile)}
                            className="text-red-600 hover:text-red-800 font-bold text-sm px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus:outline-none"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </>
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