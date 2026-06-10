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

interface GameEdition {
  id: string;
  name: string;
  rewards: Record<string, number>;    // Maps unique tile name to point rewards
  penalties: Record<string, number>;  // Maps unique tile name to point penalties
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
  const [tileType, setTileType] = useState<"reward" | "penalty"| "jail" | "parking" | "community" >("reward");
  const [tileValue, setTileValue] = useState<number>(0);

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
          rewards: data.rewards || {},
          penalties: data.penalties || {},
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
  // Updates the Edition Name in the cloud
  const handleUpdateEditionName = async () => {
    if (!selectedEdition || !editNameValue.trim()) return;

    try {
      const editionDocRef = doc(db, "game_editions", selectedEdition.id);
      await updateDoc(editionDocRef, {
        name: editNameValue.trim()
      });
      setIsRenaming(false);
    } catch (err) {
      alert("Failed to update edition name: " + err);
    }
  };

  const handleSaveTileRules = async () => {
    if (!selectedEdition || !targetTileName.trim()) return;

    const tileKey = targetTileName.trim();
    const updatedRewards = { ...selectedEdition.rewards };
    const updatedPenalties = { ...selectedEdition.penalties };


    if (tileType === "reward") {
      updatedRewards[tileKey] = Number(tileValue);
      delete updatedPenalties[tileKey]; 
    } else if (tileType === "penalty"){
      updatedPenalties[tileKey] = Number(tileValue);
      delete updatedRewards[tileKey]; 
    } else {
        const typeMappingCodes = { jail: -1, parking: -2, community: -3 };
        updatedPenalties[tileKey] = typeMappingCodes[tileType];
        delete updatedRewards[tileKey];
    }
    try {
      const editionDocRef = doc(db, "game_editions", selectedEdition.id);
      await updateDoc(editionDocRef, {
        rewards: updatedRewards,
        penalties: updatedPenalties
      });

      setTargetTileName("");
      setTileValue(0);
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
          <div className="max-w-4xl mx-auto w-full space-y-4">
            
            {/* Header Box Module */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex justify-between items-center">
              <div>
                {/* REQUIREMENT 1 INTERFACE: Inline Edition Name Editor Toggle */}
                {isRenaming ? (
                  <div className="flex items-center gap-2 bg-[#FFF5E4] p-1.5 rounded-xl border border-orange-300">
                    <input 
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      className="bg-white rounded-lg px-3 py-1 text-sm font-bold text-slate-900 focus:outline-none border border-orange-200"
                    />
                    <button 
                      onClick={handleUpdateEditionName}
                      className="bg-[#5CB85C] hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => { setIsRenaming(false); setEditNameValue(selectedEdition.name); }}
                      className="text-gray-500 text-xs font-bold px-2 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedEdition.name}</h2>
                    <button 
                      onClick={() => setIsRenaming(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold underline bg-blue-50 px-2 py-0.5 rounded-md"
                    >
                      Edit Name
                    </button>
                  </div>
                )}
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mt-1">Edition, Tiles, Reward, Penalty setup board</span>
              </div>
              <button 
                onClick={() => { setView("dashboard"); setSelectedEdition(null); setIsRenaming(false); }}
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
                  <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wide">Assign value types to specific tile titles</span>
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

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Rule Classification Type</label>
                    <div className="grid grid-cols-2 gap-2 bg-[#FFF5E4] p-1 rounded-xl border border-orange-300">
                      <select
                        value={tileType}
                        onChange={(e) => {
                          setTileType(e.target.value as any);
                          setTileValue(0); // Reset numeric fields when switching types
                        }}
                        className="w-full p-2.5 rounded-xl bg-white border border-orange-300 font-bold text-slate-800 focus:outline-none text-xs">
                        <option value="reward">Reward</option>
                        <option value="penalty">Penalty</option>
                        <option value="jail">Go to Jail</option>
                        <option value="parking">Free Parking</option>
                        <option value="community">Community</option>
                        // Can Add more option in drop down menu
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Point Modifier Absolute Magnitude</label>
                    <input 
                      type="number" 
                      min="0"
                      value={tileValue}
                      onChange={(e) => setTileValue(Math.abs(Number(e.target.value)))}
                      disabled={tileType !== "reward" && tileType !== "penalty"}
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

              {/* Rules List  */}
              <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-4 space-y-2 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-orange-100 pb-2 mb-2">
                  Tile Rules Matrix
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
                            type="button"
                            onClick={() => handleRemoveTileRule(tile)}
                            className="text-red-600 hover:text-red-800 font-bold text-sm px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus:outline-none"
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      {/* Render Penalties sub-tree */}
                      {Object.keys(selectedEdition.penalties || {}).map((tile) => {
                        const points = selectedEdition.penalties[tile];
                        const value = selectedEdition.penalties[tile];
                        const isSpecialTile = value <=0;                   
                        // Inverse Mapping Code Dictionary Lookups
                        let tileLabelText = `Penalty Action: -${value} Points / धनम्`;
                        let badgeColorClass = "text-red-500 bg-red-50 border-red-200";

                        if (value === -1) {
                          tileLabelText = "Go to Jail (कारागारः)";
                          badgeColorClass = "text-purple-600 bg-purple-50 border-purple-200";
                        } else if (value === -2) {
                          tileLabelText = "Free Parking (विश्रामस्थलम्)";
                          badgeColorClass = "text-blue-600 bg-blue-50 border-blue-200";
                        } else if (value === -3) {
                          tileLabelText = "Community Chest (सङ्घकोषः)";
                          badgeColorClass = "text-amber-600 bg-amber-50 border-amber-200";
                        } else if (value === 0) {
                          tileLabelText = "Specialized Utility Event";
                          badgeColorClass = "text-gray-600 bg-gray-50 border-gray-200";
                        }

                        return (
                        <div key={`pen-${tile}`} className="bg-white border border-orange-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 flex justify-between items-center shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-base text-slate-900 font-bold">{tile}</span>
                            <span className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-md border w-max ${badgeColorClass}`}>
                              {tileLabelText}
                            </span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveTileRule(tile)}
                            className="text-red-600 hover:text-red-800 font-bold text-sm px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus:outline-none"
                          >
                            Remove
                          </button>
                        </div>
                      );
                      })}
                    </>
                  )}
                </div>
              </div>

            </div>
            {/* SECTION: POP QUIZ MCQ CREATION MODULE */}
            <div className="grid grid-cols-12 gap-5 items-start border-t-2 border-orange-200/40 pt-4 mt-6">
              
              {/* Left Panel Form: MCQ Builder */}
              <div className="col-span-5 bg-[#CBE6FF] border border-[#A4D2FF] rounded-2xl p-4 shadow-sm space-y-3">
                <div>
                  <span className="text-sm font-black text-slate-800 block">Configure Pop Quiz Activities</span>
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Build unassigned multiple-choice questions</span>
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
                    <label className="block font-bold text-slate-700">Configure Choices</label>
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
                    <label className="block font-bold text-slate-700 mb-1">Designate Correct Answer</label>
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

              {/* Right Panel List: Active Question Register */}
              <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-orange-100 pb-2">
                  Quiz MCQ Registers
                </h4>
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {!selectedEdition.activities || selectedEdition.activities.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">No quiz questionnaires created under this edition yet.</p>
                  ) : (
                    selectedEdition.activities.map((act, index) => (
                      <div key={act.id} className="bg-white border border-blue-100 rounded-xl p-3 text-xs shadow-sm space-y-2 relative">
                        <div className="flex justify-between items-start pr-16">
                          <span className="font-bold text-sm text-slate-900">{index + 1}. {act.question}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivityItem(act.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-[11px] absolute top-3 right-3 bg-red-50 px-2 py-0.5 rounded-md transition-colors"
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