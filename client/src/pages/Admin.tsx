import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase"; 
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

interface PopQuizActivity {
  id: string;
  question: string;
  options: string[];      //mcq options array
  correctAnswer: string;  // correct answer
}

interface MonopolyTile {
  id: string;
  name: string;
  type: "property" | "tax" | "jail" | "goToJail" | "chance" | "community" | "minigame" | "quiz";
  money: string; // Kept as a string format matching your database panel blueprint
  price?: string;
  rent?: string;
  sellValue?: string;
  group?: "red" | "brown" | "light blue" | "pink" | "orange" | "yellow" | "green" | "dark blue" | "" ;
}

interface GameEdition {
  id: string;
  name: string;
  tiles: MonopolyTile[];              // Array of tile objects with type and point details
  activities?: PopQuizActivity[]; // Pop quiz array
}

function Admin() {

  // 1.CONFIGURATIONS STATES
  const [currentView, setView] = useState<"dashboard" | "create" | "edit">("dashboard");
  const [editions, setEditions] = useState<GameEdition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<GameEdition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [newEditionName, setNewEditionName] = useState("");
  const [targetTileName, setTargetTileName] = useState("");
  const [tileType, setTileType] = useState<"property" | "tax" | "jail" | "goToJail" | "chance" | "community" | "minigame" | "quiz">("property");
  const [tileValue, setTileValue] = useState<number>(0);
  const [editingTileIndex, setEditingTileIndex] = useState<number | null>(null);
  const [propertyCost, setPropertyCost] = useState<number>(0);
  const [rentCost, setRentCost] = useState<number>(0);
  const [sellingCost, setSellingCost] = useState<number>(0);
  const [propertyGroup, setPropertyGroup] = useState<string>("");

  // Inline Name Renaming Buffers
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [editNameValue, setEditNameValue] = useState<string>("");

  // Keeps track of the active edition ID without triggering component re-renders
  const selectedIdRef = useRef<string | null>(null);

  // Pop Quiz MCQ Builder Form State Buffers
  const [quizQuestion, setQuizQuestion] = useState("");
  const [currentOptions, setCurrentOptions] = useState<string[]>(["", "", "", ""]); // 4 options slots
  const [correctAnswerStr, setCorrectAnswerStr] = useState("");

  // Sync the ref whenever the selected edition changes
  useEffect(() => {
    selectedIdRef.current = selectedEdition ? selectedEdition.id : null;
  }, [selectedEdition]);

  // 2. OPTIMIZED READ COUNTS IN FIRESTORE DATABASE
  useEffect(() => {
    const editionsCollectionRef = collection(db, "game_editions");
    const unsubscribe = onSnapshot(editionsCollectionRef, (snapshot) => {
      const liveEditions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unnamed Edition",
          tiles: data.tiles || [], // 💡 FIXED: Pulls the 40-tile layout array cleanly from Firestore
          activities: data.activities || []
        } as GameEdition;
      });
      
      setEditions(liveEditions);
      
      // Sync the active configuration screen efficiently using memory lookups
      if (selectedIdRef.current) {
        const currentMatch = liveEditions.find(e => e.id === selectedIdRef.current);
        if (currentMatch) {
          setSelectedEdition(currentMatch);
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Firestore stream error:", error);
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []); // Empty array fixes the high read count issue completely!

   // 3. CORE WRITE OPERATIONS (FIRESTORE ONLY)
  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditionName.trim()) return;

    // ✅ FIXED: Generates a neutral, clean 40-element layout with zero pre-assigned rules
    const baselineTiles: MonopolyTile[] = Array.from({ length: 40 }, (_, index) => {
      // Sets the title strictly to "Tile " followed by its true visual index board number (e.g., Tile 1, Tile 2)
      // Index 0 renders neutrally as "Tile 0" to maintain matching string patterns across the grid
      const neutralSpaceName = `Tile ${index}`;

      return {
        id: `tile-${index}-${Math.random().toString(36).substring(2, 7)}`, 
        name: neutralSpaceName,
        type: "property", // Safe base string fallback required by your type schema
        money: "0",       // Flat baseline values
        price: "100",
        rent: "10",
        sellValue: "50",
        group: ""
      };
    });

    try {
      await addDoc(collection(db, "game_editions"), {
        name: newEditionName.trim(),
        tiles: baselineTiles, 
        activities: []
      });
      setNewEditionName("");
      setView("dashboard");
    } catch (err) {
      alert("Firestore Write Failed: " + err);
    }
  };

  // Updates the Edition Name in the cloud
  const handleUpdateEditionName = async () => {
    if (!selectedEdition || !editNameValue.trim()) return;

    try {
      const editionDocRef = doc(db, "game_editions", selectedEdition.id);
      await updateDoc(editionDocRef, {
        name: editNameValue.trim()
      });
      
      // ✅ Soft update our local state so the screen reflects the new title instantly
      setSelectedEdition({
        ...selectedEdition,
        name: editNameValue.trim()
      });
      
      setIsRenaming(false);
    } catch (err) {
      alert("Failed to update edition name: " + err);
    }
  };

  const handleSaveTileRules = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload on form submit
    
    // Safety check: ensure we actually have an active tile loaded into the editor
    if (!selectedEdition || !selectedEdition.tiles || editingTileIndex === null) return;

    // 1. Create a safe copy of the 40-tile layout array
    const updatedTiles = [...selectedEdition.tiles];

    // 2. Update the properties at our selected index position
    updatedTiles[editingTileIndex] = {
      id: updatedTiles[editingTileIndex].id, // Keeps the original stable random ID intact
      name: targetTileName.trim() || updatedTiles[editingTileIndex].name,
      type: tileType,
      money: tileType === "property" || tileType === "minigame" || tileType === "quiz" ? String(tileValue) : "0",
      price: tileType === "property" ? String(propertyCost) : "0",
      rent: tileType === "property" ? String(rentCost) : "0",
      sellValue: tileType === "property" ? String(sellingCost) : "0",
      group: tileType === "property" ? (propertyGroup as any) : ""
    };

    try {
      const editionDocRef = doc(db, "game_editions", selectedEdition.id);
      await updateDoc(editionDocRef, {
        tiles: updatedTiles // Commits entire board state in a single optimized write package
      });

      // 3. Clear all input states and close the editing panel on success
      setTargetTileName("");
      setTileValue(0);
      setPropertyCost(0);
      setRentCost(0);
      setSellingCost(0);
      setPropertyGroup("");
      setEditingTileIndex(null); 
      alert("Changes successfully committed to Firestore!");
    } catch (err) {
      alert("Firestore Update Failed: " + err);
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

  const handleAddPopQuizActivity = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedEdition || !quizQuestion.trim() || !correctAnswerStr) return;

  // Filter out any blank slots the admin didn't fill
  const filteredOptions = currentOptions.map(opt => opt.trim()).filter(Boolean);
  if (filteredOptions.length < 2) {
    alert("Please provide at least 2 choice options.");
    return;
  }

  const newQuizObj: PopQuizActivity = {
    id: "quiz_" + Date.now(), // Unique runtime ID
    question: quizQuestion.trim(),
    options: filteredOptions,
    correctAnswer: correctAnswerStr
  };

  // Build the updated array containing the old items plus our new one
  const updatedActivities = [...(selectedEdition.activities || []), newQuizObj];

  try {
    const editionDocRef = doc(db, "game_editions", selectedEdition.id);
    await updateDoc(editionDocRef, {
      activities: updatedActivities
    });

    // Clear local form buffers on success
    setQuizQuestion("");
    setCurrentOptions(["", "", "", ""]);
    setCorrectAnswerStr("");
  } catch (err) {
    alert("Failed to save quiz: " + err);
  }
};

// Handler to delete an individual question out of the array pool
const handleRemoveActivityItem = async (activityIdToRemove: string) => {
  if (!selectedEdition || !selectedEdition.activities) return;

  const updatedActivities = selectedEdition.activities.filter(act => act.id !== activityIdToRemove);

  try {
    const editionDocRef = doc(db, "game_editions", selectedEdition.id);
    await updateDoc(editionDocRef, {
      activities: updatedActivities
    });
  } catch (err) {
    alert("Failed to remove quiz item: " + err);
  }
};

// Simple helper to handle text input keystrokes for individual options locally
const handleOptionChangeLocally = (index: number, val: string) => {
  const nextOptions = [...currentOptions];
  nextOptions[index] = val;
  setCurrentOptions(nextOptions);
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

        {/* VIEW 1: DASHBOARD PANEL */}
        {currentView === "dashboard" && (
          <div className="bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-5 h-full flex flex-col shadow-sm max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Game Configurations Panel</h3>
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
                <div className="col-span-3">Active Rules</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-100">
                {editions.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400 font-medium">No cloud configurations detected.</div>
                ) : (
                  editions.map((item) => {
                    const totalRulesCount = (item.tiles || []).length;

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
                            onClick={() => { 
                              setSelectedEdition(item); 
                              setEditNameValue(item.name); // Pre-seed rename buffer
                              setView("edit"); 
                            }}
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

        {/* VIEW 2: CREATE VIEW */}
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

        {/* VIEW 3: TILE PARAMETERS MAP VIEW */}
        {currentView === "edit" && selectedEdition && (
          <div className="max-w-5xl mx-auto w-full space-y-4">
            
            {/* Header Box Module with Inline Renaming functionality */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex justify-between items-center">
              <div>
                {isRenaming ? (
                  <div className="flex items-center gap-2 bg-[#FFF5E4] p-1.5 rounded-xl border border-orange-300">
                    <input 
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      className="bg-white rounded-lg px-3 py-1 text-sm font-bold text-slate-900 focus:outline-none border border-orange-200"
                    />
                    <button 
                      type="button"
                      onClick={handleUpdateEditionName}
                      className="bg-[#5CB85C] hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsRenaming(false); setEditNameValue(selectedEdition.name); }}
                      className="text-gray-500 text-xs font-bold px-2 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedEdition.name}</h2>
                    <button 
                      type="button"
                      onClick={() => { setIsRenaming(true); setEditNameValue(selectedEdition.name); }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold underline bg-blue-50 px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                    >
                      Rename Edition
                    </button>
                  </div>
                )}
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mt-1">
                  Edition, Tiles, Reward, Penalty setup board
                </span>
              </div>
              <button 
                onClick={() => { setView("dashboard"); setSelectedEdition(null); setIsRenaming(false); setEditingTileIndex(null); }}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            {/* GRID LAYER: COLUMNS INVERTED */}
            <div className="grid grid-cols-12 gap-5 items-start">
              
              {/* ✅ Left Column: Scrollable Tile Matrix List (Takes 7/12 width) */}
              <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-4 space-y-2 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-orange-100 pb-2 mb-2">
                  Active Board Map (40 Tiles Total)
                </h4>
                
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {!selectedEdition.tiles || selectedEdition.tiles.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No structural indices detected.</p>
                  ) : (
                    selectedEdition.tiles.map((tile, idx) => {
                      // ✅ FIXED: Cleanly maps styling classes dynamically across all updated types
                      let badgeColor = "text-gray-600 bg-gray-50 border-gray-200";
                      let displayLabel = tile.type.toUpperCase();

                      if (tile.type === "property") {
                        badgeColor = "text-blue-600 bg-blue-50 border-blue-200";
                        // displayLabel = "Property";
                      } else if (tile.type === "quiz") {
                        badgeColor = "text-green-600 bg-green-50 border-green-200";
                        displayLabel = `Quiz • +/- ${tile.money || "0"} pts`;
                      } else if (tile.type === "minigame") {
                        badgeColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
                        displayLabel = `Minigame • +/- ${tile.money || "0"} pts`;
                      } else if (tile.type === "tax") {
                        badgeColor = "text-red-600 bg-red-50 border-red-200";
                        displayLabel = "Tax • 200 pts";
                      } else if (tile.type === "jail") {
                        badgeColor = "text-purple-600 bg-purple-50 border-purple-200";
                        displayLabel = "Jail";
                      } else if (tile.type === "goToJail") {
                        badgeColor = "text-purple-600 bg-purple-50 border-purple-200";
                        displayLabel = "Go To Jail";
                      } else if (tile.type === "chance") {
                        badgeColor = "text-indigo-600 bg-indigo-50 border-indigo-200";
                        displayLabel = "Chance Card";
                      } else if (tile.type === "community") {
                        badgeColor = "text-amber-600 bg-amber-50 border-amber-200";
                        displayLabel = "Community Chest";
                      }

                      const isCurrentlyEditingThis = editingTileIndex === idx;

                      return (
                        <div 
                          key={tile.id || idx} 
                          className={`border rounded-xl px-4 py-3 flex justify-between items-center shadow-sm transition-all ${
                            isCurrentlyEditingThis 
                              ? "bg-orange-50 border-orange-400 ring-2 ring-orange-200" 
                              : "bg-white border-orange-100 hover:border-orange-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 shadow-inner">
                              {idx}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-base text-slate-900 font-extrabold tracking-tight">
                                {idx === 0 ? "STARTING POINT" : tile.name}
                              </span>
                              {idx !== 0 && (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}>
                                    {tile.type === "goToJail" ? "Go To Jail" : tile.type}
                                  </span>
                                  {tile.type === "property" ? (
                                  <div className="flex flex-wrap gap-1.5 items-center">
                                    {tile.group && (
                                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider bg-white shadow-sm border-gray-300 text-slate-700 flex items-center gap-1">
                                        {tile.group}
                                      </span>
                                    )}
                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border shadow-sm">
                                      Cost: {tile.price || "0"} Pts
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shadow-sm">
                                      Rent: {tile.rent || "0"} Pts
                                    </span>
                                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 shadow-sm">
                                      Sell: {tile.sellValue || "0"} Pts
                                    </span>
                                  </div>
                                ) : (
                                  (tile.type === "minigame" || tile.type === "quiz") && (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border">
                                      Points: {tile.money || "0"} Pts
                                    </span>
                                  )
                                )}
                              </div>
                              )}
                            </div>
                          </div>

                          {idx === 0 ? (
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl border italic select-none">
                              STARTING POINT
                            </span>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingTileIndex(idx);
                                setTargetTileName(tile.name);
                                setTileType(tile.type as any);
                                setTileValue(Number(tile.money) || 0);
                                setPropertyCost(Number(tile.price) || 0);
                                setRentCost(Number(tile.rent) || 0);
                                setSellingCost(Number(tile.sellValue) || 0);
                                setPropertyGroup(tile.group || "");
                              }}
                              className={`text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all transform active:scale-95 ${
                                isCurrentlyEditingThis
                                  ? "bg-orange-500 text-white cursor-default"
                                  : "bg-[#5CB85C] hover:bg-green-600 text-white"
                              }`}
                            >
                              {isCurrentlyEditingThis ? "Editing..." : "Edit Tile"}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ✅ Right Column: Sticky "Update Specific Space" Input Box (Takes 5/12 width) */}
              <div className="col-span-5 bg-[#FFC288] rounded-2xl p-4 border border-orange-300 shadow-sm space-y-4 sticky top-4">
                {editingTileIndex !== null ? (
                  <form onSubmit={handleSaveTileRules} className="space-y-4 text-xs">
                    <div>
                      <span className="text-sm font-black text-slate-800 block">
                        Update Space for Tile #{editingTileIndex}
                      </span>
                      <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wide">
                        Modifying: "{selectedEdition.tiles[editingTileIndex]?.name}"
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Target Space Title Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g., cool street / शब्द-परीक्षा" 
                        value={targetTileName}
                        onChange={(e) => setTargetTileName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-orange-300 font-medium text-slate-900 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Rule Classification Type</label>
                      <div className="bg-white p-1 rounded-xl border border-orange-300">
                        <select
                          value={tileType}
                          onChange={(e) => {
                            setTileType(e.target.value as any);
                            setTileValue(0); // Safely resets value back to 0 on swap
                          }}
                          className="w-full p-2 bg-transparent font-bold text-slate-800 focus:outline-none text-xs"
                        >
                          <option value="property">Property</option>
                          <option value="quiz">Quiz</option>
                          <option value="minigame">Minigame</option>
                          <option value="tax">Tax </option>
                          <option value="jail">Jail</option>
                          <option value="goToJail">Go To Jail</option>
                          <option value="chance">Chance</option>
                          <option value="community">Community Chest</option>
                        </select>
                      </div>
                    </div>

                    {tileType === "property" ? (
                      <div className="space-y-3 animate-fade-in">
                        {/* ✅ ADDED: Property Color Group Dropdown Menu */}
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Property Color Set Group</label>
                          <div className="bg-white p-1 rounded-xl border border-orange-300">
                            <select
                              value={propertyGroup}
                              onChange={(e) => setPropertyGroup(e.target.value)}
                              className="w-full p-1.5 bg-transparent font-bold text-slate-800 focus:outline-none text-xs capitalize"
                            >
                              <option value="">-- Select Color Group --</option>
                              <option value="red">Red</option>
                              <option value="brown">Brown</option>
                              <option value="light blue">Light Blue</option>
                              <option value="pink">Pink</option>
                              <option value="orange">Orange</option>
                              <option value="yellow">Yellow</option>
                              <option value="green">Green</option>
                              <option value="dark blue">Dark Blue</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Property Purchase Cost</label>
                          <input 
                            type="number" min="0" value={propertyCost}
                            onChange={(e) => setPropertyCost(Math.abs(Number(e.target.value)))}
                            className="w-full p-2 rounded-xl bg-white border border-orange-300 font-bold text-slate-900 focus:outline-none text-sm shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Rent Price</label>
                          <input 
                            type="number" min="0" value={rentCost}
                            onChange={(e) => setRentCost(Math.abs(Number(e.target.value)))}
                            className="w-full p-2 rounded-xl bg-white border border-orange-300 font-bold text-slate-900 focus:outline-none text-sm shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Selling Price</label>
                          <input 
                            type="number" min="0" value={sellingCost}
                            onChange={(e) => setSellingCost(Math.abs(Number(e.target.value)))}
                            className="w-full p-2 rounded-xl bg-white border border-orange-300 font-bold text-slate-900 focus:outline-none text-sm shadow-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      /* ✅ FIXED: Only render the Money Modifier input box if the type is explicitly Minigame or Quiz */
                      (tileType === "minigame" || tileType === "quiz") && (
                        <div className="animate-fade-in">
                          <label className="block font-bold text-slate-700 mb-1">Money Modifier Value (Gain/Loss)</label>
                          <input 
                            type="number" 
                            min="0"
                            value={tileValue}
                            onChange={(e) => setTileValue(Math.abs(Number(e.target.value)))}
                            className="w-full p-2.5 rounded-xl border border-orange-300 font-bold focus:outline-none text-base bg-white text-slate-900 shadow-sm"
                          />
                        </div>
                      )
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-[#5CB85C] hover:bg-green-600 text-white font-bold p-2.5 rounded-xl transition-all shadow-sm text-center text-sm"
                      >
                        Apply Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingTileIndex(null); setTargetTileName(""); setTileValue(0); }}
                        className="bg-gray-200 hover:bg-gray-300 text-slate-700 font-bold px-4 py-2 rounded-xl transition-all text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <span className="text-sm font-black text-slate-700 block">No Active Tile Selected</span>
                    <p className="text-xs text-orange-900 max-w-[200px] mx-auto leading-relaxed">
                      Click the green <strong>"Edit Tile"</strong> button on any to load its configuration.
                    </p>
                  </div>
                )}
              </div>

            </div>
          
            {/* SECTION: POP QUIZ MCQ CREATION MODULE */}
            <div className="grid grid-cols-12 gap-5 items-start border-t-2 border-orange-200/40 pt-4 mt-6">
              
              {/* Left Panel Form: MCQ Builder */}
              <div className="col-span-5 bg-[#CBE6FF] border border-[#A4D2FF] rounded-2xl p-4 shadow-sm space-y-3">
                <div>
                  <span className="text-sm font-black text-slate-800 block">Configure Pop Quiz Activities</span>
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Multiple-choice questions</span>
                </div>

                <form onSubmit={handleAddPopQuizActivity} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Question Text</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g., What language is the root of the word Monopoly?"
                      value={quizQuestion}
                      onChange={(e) => setQuizQuestion(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-blue-300 font-medium text-slate-900 focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700">Correct Answer</label>
                    {currentOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-bold text-blue-700 w-4">{String.fromCharCode(97 + i)}.)</span>
                        <input 
                          type="text"
                          placeholder={`Option ${String.fromCharCode(97 + i).toUpperCase()}`}
                          value={opt}
                          onChange={(e) => handleOptionChangeLocally(i, e.target.value)}
                          className="flex-1 p-2 rounded-lg bg-white border border-blue-200 focus:outline-none font-medium"
                          required={i < 2} // Requires at least options A and B
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Correct Answer</label>
                    <select
                      value={correctAnswerStr}
                      onChange={(e) => setCorrectAnswerStr(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-blue-300 font-bold text-slate-800 focus:outline-none"
                      required
                    >
                      <option value="">-- Choose Correct Option --</option>
                      {currentOptions.filter(Boolean).map((opt, index) => (
                        <option key={index} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#3B71CA] hover:bg-blue-600 text-white font-bold p-2.5 rounded-xl transition-all shadow-sm mt-2"
                  >
                    Append Pop Quiz to Edition
                  </button>
                </form>
              </div>

              {/* ✅ FIXED UI INTERFACE BLOCK: Dynamically builds the quiz elements from state */}
              <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-orange-100 pb-2">
                  Quiz MCQ Registers
                </h4>
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {!selectedEdition.activities || selectedEdition.activities.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">No quiz question created under this edition yet.</p>
                  ) : (
                    selectedEdition.activities.map((act, index) => (
                      <div key={act.id} className="bg-white border border-blue-100 rounded-xl p-3 text-xs shadow-sm space-y-2 relative animate-fade-in">
                        <div className="flex justify-between items-start pr-16">
                          <span className="font-bold text-sm text-slate-900">{index + 1}. {act.question}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivityItem(act.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-[11px] absolute top-3 right-3 bg-red-50 px-2 py-0.5 rounded-md transition-colors focus:outline-none"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pl-4 text-slate-600 font-medium">
                          {act.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded-lg border ${opt === act.correctAnswer ? "bg-green-50 border-green-300 text-green-800 font-bold" : "border-gray-100 bg-gray-50/50"}`}
                            >
                              {String.fromCharCode(97 + oIdx)}.) {opt} {opt === act.correctAnswer && "✓"}
                            </div>
                          ))}
                        </div>
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