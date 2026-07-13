import React from "react";
import type { GameEdition, MonopolyTile } from "./AdminTypes";

interface TilesProps {
  selectedEdition: GameEdition;
  editingTileIndex: number | null;
  setEditingTileIndex: (idx: number | null) => void;
  targetTileName: string;
  setTargetTileName: (val: string) => void;
  tileType: MonopolyTile["type"] | "";
  setTileType: (type: MonopolyTile["type"] | "") => void;
  tileValue: number;
  setTileValue: (val: number) => void;
  propertyCost: number;
  setPropertyCost: (val: number) => void;
  rentCost: number;
  setRentCost: (val: number) => void;
  sellingCost: number;
  setSellingCost: (val: number) => void;
  propertyGroup: string;
  setPropertyGroup: (val: string) => void;
  handleTileSaveSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AdminEditTiles: React.FC<TilesProps> = ({
  selectedEdition, editingTileIndex, setEditingTileIndex, targetTileName, setTargetTileName,
  tileType, setTileType, tileValue, setTileValue, propertyCost, setPropertyCost,
  rentCost, setRentCost, sellingCost, setSellingCost, propertyGroup, setPropertyGroup, handleTileSaveSubmit
}) => {
  return (
    <div className="grid grid-cols-12 gap-5 items-start animate-fade-in">
      <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-4 space-y-2 shadow-sm">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-orange-100 pb-2 mb-2">Active Board Map (40 Tiles Total)</h4>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {selectedEdition.tiles?.map((tile, idx) => {
            let badgeColor = "text-gray-600 bg-gray-50 border-gray-200";
            let displayLabel = tile.type.toUpperCase();

            if (tile.type === "property") badgeColor = "text-blue-600 bg-blue-50 border-blue-200";
            else if (tile.type === "railroad") { badgeColor = "text-slate-700 bg-slate-100 border-slate-300"; displayLabel = "Railroad";} 
            else if (tile.type === "utility") { badgeColor = "text-cyan-700 bg-cyan-50 border-cyan-200"; displayLabel = "Utility";}
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
                        {(tile.type === "property" || tile.type === "railroad" || tile.type === "utility") ? (
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
                <select
                  value={tileType}
                  onChange={(e) => {
                    const nextType = e.target.value as MonopolyTile["type"] | "";
                    setTileType(nextType);
                    setTileValue(0);

                    if (nextType === "railroad") {
                      setPropertyGroup("railroad"); setPropertyCost(200); setRentCost(25); setSellingCost(100);
                    } else if (nextType === "utility") {
                      setPropertyGroup("utility"); setPropertyCost(150); setRentCost(4); setSellingCost(75);
                    }
                  }}
                  className="w-full p-2 bg-transparent font-bold text-slate-800 focus:outline-none text-xs"
                >
                  <option value="">-- Select Rule Type --</option>
                  <option value="property">Property</option>
                  <option value="railroad">Railroad</option>
                  <option value="utility">Utility</option>
                  <option value="tax">Tax</option>
                  <option value="jail">Jail</option>
                  <option value="goToJail">Go To Jail</option>
                  <option value="chance">Chance</option>
                  <option value="community">Community Chest</option>
                  <option value="minigame">Mini Game</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
            </div>
            {tileType === "property" || tileType === "railroad" || tileType === "utility" ? (
              <div className="space-y-3">
                {tileType === "property" && (
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
                )}
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
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Points Modifier Value</label>
                    <input type="number" min="0" value={tileValue} onChange={(e) => setTileValue(Math.abs(Number(e.target.value)))} className="w-full p-2.5 rounded-xl border border-orange-300 font-bold focus:outline-none text-base bg-white text-slate-900 shadow-sm" />
                  </div>
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
  );
};