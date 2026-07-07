import React, { useState } from "react";
import type { GameEdition, MonopolyTile } from "./AdminTypes";

interface EditProps {
  selectedEdition: GameEdition;
  isRenaming: boolean;
  setIsRenaming: (v: boolean) => void;
  editNameValue: string;
  setEditNameValue: (v: string) => void;
  handleUpdateEditionName: () => Promise<void>;
  handleSaveTileRules: (tileData: Partial<MonopolyTile> & { index: number }) => Promise<void>;
  handleAddPopQuizActivity: (quiz: { question: string; options: string[]; correctAnswer: string }) => Promise<void>;
  handleRemoveActivityItem: (id: string) => Promise<void>;
  navigateTo: (page: string) => void;
}

export const AdminEditEdition: React.FC<EditProps> = ({
  selectedEdition, isRenaming, setIsRenaming, editNameValue, setEditNameValue,
  handleUpdateEditionName, handleSaveTileRules, handleAddPopQuizActivity, handleRemoveActivityItem, navigateTo
}) => {
  const [editingTileIndex, setEditingTileIndex] = useState<number | null>(null);
  const [targetTileName, setTargetTileName] = useState("");
  const [tileType, setTileType] = useState<MonopolyTile["type"]>("property");
  const [tileValue, setTileValue] = useState<number>(0);
  const [propertyCost, setPropertyCost] = useState<number>(0);
  const [rentCost, setRentCost] = useState<number>(0);
  const [sellingCost, setSellingCost] = useState<number>(0);
  const [propertyGroup, setPropertyGroup] = useState<string>("");

  const [quizQuestion, setQuizQuestion] = useState("");
  const [currentOptions, setCurrentOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswerStr, setCorrectAnswerStr] = useState("");

  const handleTileSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTileIndex === null) return;
    await handleSaveTileRules({
      index: editingTileIndex,
      name: targetTileName,
      type: tileType,
      points: tileType === "minigame" || tileType === "quiz" ? tileValue : 0,
      price: tileType === "property" ? propertyCost : 0,
      rent: tileType === "property" ? rentCost : 0,
      sellValue: tileType === "property" ? sellingCost : 0,
      group: tileType === "property" ? (propertyGroup as any) : ""
    });
    setEditingTileIndex(null);
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = currentOptions.map(o => o.trim()).filter(Boolean);
    if (filtered.length < 2) return alert("Please provide at least 2 choice options.");
    await handleAddPopQuizActivity({ question: quizQuestion, options: filtered, correctAnswer: correctAnswerStr });
    setQuizQuestion("");
    setCurrentOptions(["", "", "", ""]);
    setCorrectAnswerStr("");
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-4">
      {/* Dynamic Renaming Header Area */}
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
              <button type="button" onClick={() => { setIsRenaming(true); setEditNameValue(selectedEdition.name); }} className="text-xs text-blue-600 hover:text-blue-800 font-bold underline bg-blue-50 px-2.5 py-1 rounded-lg transition-colors shadow-sm">Rename Edition</button>
            </div>
          )}
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mt-1">Edition, Tiles, Reward, Penalty setup board</span>
        </div>
        <button onClick={() => navigateTo("/admin")} className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors">Back to Dashboard</button>
      </div>

      {/* Main Structural Matrix Columns Grid */}
      <div className="grid grid-cols-12 gap-5 items-start">
        <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-4 space-y-2 shadow-sm">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-orange-100 pb-2 mb-2">Active Board Map (40 Tiles Total)</h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {selectedEdition.tiles?.map((tile, idx) => {
              let badgeColor = "text-gray-600 bg-gray-50 border-gray-200";
              let displayLabel = tile.type.toUpperCase();

              if (tile.type === "property") badgeColor = "text-blue-600 bg-blue-50 border-blue-200";
              else if (tile.type === "quiz") { badgeColor = "text-green-600 bg-green-50 border-green-200"; displayLabel = `Quiz • +/- ${tile.points ?? 0} pts`; }
              else if (tile.type === "minigame") { badgeColor = "text-emerald-600 bg-emerald-50 border-emerald-200"; displayLabel = `Minigame • +/- ${tile.points ?? 0} pts`; }
              else if (tile.type === "tax") { badgeColor = "text-red-600 bg-red-50 border-red-200"; displayLabel = "Tax • 200 pts"; }
              else if (tile.type === "jail") { badgeColor = "text-purple-600 bg-purple-50 border-purple-200"; displayLabel = "Jail"; }
              else if (tile.type === "goToJail") { badgeColor = "text-purple-600 bg-purple-50 border-purple-200"; displayLabel = "Go To Jail"; }
              else if (tile.type === "chance") { badgeColor = "text-indigo-600 bg-indigo-50 border-indigo-200"; displayLabel = "Chance Card"; }
              else if (tile.type === "community") { badgeColor = "text-amber-600 bg-amber-50 border-amber-200"; displayLabel = "Community Chest"; }

              const isCurrentlyEditingThis = editingTileIndex === idx;

              return (
                <div key={tile.id || idx} className={`border rounded-xl px-4 py-3 flex justify-between items-center shadow-sm transition-all ${isCurrentlyEditingThis ? "bg-orange-50 border-orange-400 ring-2 ring-orange-200" : "bg-white border-orange-100 hover:border-orange-200"}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 shadow-inner">{idx}</span>
                    <div className="flex flex-col">
                      <span className="text-base text-slate-900 font-extrabold tracking-tight">{idx === 0 ? "STARTING POINT" : tile.name}</span>
                      {idx !== 0 && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}>{displayLabel}</span>
                          {tile.type === "property" ? (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {tile.group && <span className="text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider bg-white shadow-sm border-gray-300 text-slate-700 capitalize">{tile.group}</span>}
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border shadow-sm">Cost: {tile.price ?? 0} Pts</span>
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shadow-sm">Rent: {tile.rent ?? 0} Pts</span>
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 shadow-sm">Sell: {tile.sellValue ?? 0} Pts</span>
                            </div>
                          ) : (
                            (tile.type === "minigame" || tile.type === "quiz") && <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border">Points: {tile.points ?? 0} Pts</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {idx === 0 ? (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl border italic select-none">STARTING POINT</span>
                  ) : (
                    <button type="button" onClick={() => { setEditingTileIndex(idx); setTargetTileName(tile.name); setTileType(tile.type); setTileValue(tile.points ?? 0); setPropertyCost(tile.price ?? 0); setRentCost(tile.rent ?? 0); setSellingCost(tile.sellValue ?? 0); setPropertyGroup(tile.group || ""); }} className={`text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all transform active:scale-95 ${isCurrentlyEditingThis ? "bg-orange-500 text-white cursor-default" : "bg-[#5CB85C] hover:bg-green-600 text-white"}`}>{isCurrentlyEditingThis ? "Editing..." : "Edit Tile"}</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar Form Config Panel */}
        <div className="col-span-5 bg-[#FFC288] rounded-2xl p-4 border border-orange-300 shadow-sm space-y-4 sticky top-4">
          {editingTileIndex !== null ? (
            <form onSubmit={handleTileSaveSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-sm font-black text-slate-800 block">Update Space for Tile #{editingTileIndex}</span>
                <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wide">Modifying: "{selectedEdition.tiles[editingTileIndex]?.name}"</span>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Target Space Title Name</label>
                <input type="text" value={targetTileName} onChange={(e) => setTargetTileName(e.target.value)} className="w-full p-2.5 rounded-xl bg-white border border-orange-300 font-medium text-slate-900 focus:outline-none" required />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Rule Classification Type</label>
                <div className="bg-white p-1 rounded-xl border border-orange-300">
                  <select value={tileType} onChange={(e) => { setTileType(e.target.value as any); setTileValue(0); }} className="w-full p-2 bg-transparent font-bold text-slate-800 focus:outline-none text-xs">
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
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Property Color Set Group</label>
                    <div className="bg-white p-1 rounded-xl border border-orange-300">
                      <select value={propertyGroup} onChange={(e) => setPropertyGroup(e.target.value)} className="w-full p-1.5 bg-transparent font-bold text-slate-800 focus:outline-none text-xs capitalize">
                        <option value="">-- Select Color Group --</option>
                        <option value="red">Red</option>
                        <option value="brown">Brown</option>
                        <option value="lightBlue">Light Blue</option>
                        <option value="pink">Pink</option>
                        <option value="orange">Orange</option>
                        <option value="yellow">Yellow</option>
                        <option value="green">Green</option>
                        <option value="darkBlue">Dark Blue</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Property Purchase Cost</label>
                    <input type="number" min="0" value={propertyCost} onChange={(e) => setPropertyCost(Math.abs(Number(e.target.value)))} className="w-full p-2 rounded-xl bg-white border border-orange-300 font-bold text-slate-900 focus:outline-none text-sm shadow-sm" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rent Price</label>
                    <input type="number" min="0" value={rentCost} onChange={(e) => setRentCost(Math.abs(Number(e.target.value)))} className="w-full p-2 rounded-xl bg-white border border-orange-300 font-bold text-slate-900 focus:outline-none text-sm shadow-sm" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Selling Price</label>
                    <input type="number" min="0" value={sellingCost} onChange={(e) => setSellingCost(Math.abs(Number(e.target.value)))} className="w-full p-2 rounded-xl bg-white border border-orange-300 font-bold text-slate-900 focus:outline-none text-sm shadow-sm" />
                  </div>
                </div>
              ) : (
                (tileType === "minigame" || tileType === "quiz") && (
                  <div className="animate-fade-in">
                    <label className="block font-bold text-slate-700 mb-1">Points Modifier Value (Gain/Loss)</label>
                    <input type="number" min="0" value={tileValue} onChange={(e) => setTileValue(Math.abs(Number(e.target.value)))} className="w-full p-2.5 rounded-xl border border-orange-300 font-bold focus:outline-none text-base bg-white text-slate-900 shadow-sm" />
                  </div>
                )
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#5CB85C] hover:bg-green-600 text-white font-bold p-2.5 rounded-xl transition-all shadow-sm text-center text-sm">Apply Settings</button>
                <button type="button" onClick={() => setEditingTileIndex(null)} className="bg-gray-200 hover:bg-gray-300 text-slate-700 font-bold px-4 py-2 rounded-xl transition-all text-sm">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="py-12 text-center space-y-2">
              <span className="text-sm font-black text-slate-700 block">No Active Tile Selected</span>
              <p className="text-xs text-orange-900 max-w-[200px] mx-auto leading-relaxed">Click the green <strong>"Edit Tile"</strong> button on any tile to load its configuration.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pop Quiz Management Registers Workspace Block */}
      <div className="grid grid-cols-12 gap-5 items-start border-t-2 border-orange-200/40 pt-4 mt-6">
        <div className="col-span-5 bg-[#CBE6FF] border border-[#A4D2FF] rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <span className="text-sm font-black text-slate-800 block">Configure Pop Quiz Activities</span>
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Multiple-choice questions</span>
          </div>
          <form onSubmit={handleQuizSubmit} className="space-y-3 text-xs">
            <textarea rows={2} placeholder="e.g., What language is the root of the word Monopoly?" value={quizQuestion} onChange={(e) => setQuizQuestion(e.target.value)} className="w-full p-2.5 rounded-xl bg-white border border-blue-300 font-medium text-slate-900 focus:outline-none resize-none" required />
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Options</label>
              {currentOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-bold text-blue-700 w-4">{String.fromCharCode(97 + i)}.)</span>
                  <input type="text" placeholder={`Option ${String.fromCharCode(97 + i).toUpperCase()}`} value={opt} onChange={(e) => { const next = [...currentOptions]; next[i] = e.target.value; setCurrentOptions(next); }} className="flex-1 p-2 rounded-lg bg-white border border-blue-200 focus:outline-none font-medium" required={i < 2} />
                </div>
              ))}
            </div>
            <select value={correctAnswerStr} onChange={(e) => setCorrectAnswerStr(e.target.value)} className="w-full p-2.5 rounded-xl bg-white border border-blue-300 font-bold text-slate-800 focus:outline-none" required>
              <option value="">-- Choose Correct Option --</option>
              {currentOptions.filter(Boolean).map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
            </select>
            <button type="submit" className="w-full bg-[#3B71CA] hover:bg-blue-600 text-white font-bold p-2.5 rounded-xl transition-all shadow-sm mt-2">Append Pop Quiz to Edition</button>
          </form>
        </div>
        <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-4 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-orange-100 pb-2">Quiz MCQ Registers</h4>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {(!selectedEdition.activities || selectedEdition.activities.length === 0) ? (
              <p className="text-xs text-gray-400 py-6 text-center">No quiz question created under this edition yet.</p>
            ) : (
              selectedEdition.activities.map((act, idx) => (
                <div key={act.id || idx} className="bg-white border border-blue-100 rounded-xl p-3 text-xs shadow-sm space-y-2 relative animate-fade-in">
                  <div className="flex justify-between items-start pr-16">
                    <span className="font-bold text-sm text-slate-900">{idx + 1}. {act.question}</span>
                    <button type="button" onClick={() => handleRemoveActivityItem(act.id)} className="text-red-500 hover:text-red-700 font-bold text-[11px] absolute top-3 right-3 bg-red-50 px-2 py-0.5 rounded-md transition-colors focus:outline-none">Delete</button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pl-4 text-slate-600 font-medium">
                    {act.options.map((opt, oIdx) => <div key={oIdx} className={`p-1.5 rounded-lg border ${opt === act.correctAnswer ? "bg-green-50 border-green-300 text-green-800 font-bold" : "border-gray-100 bg-gray-50/50"}`}>{String.fromCharCode(97 + oIdx)}.) {opt} {opt === act.correctAnswer && "✓"}</div>)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};