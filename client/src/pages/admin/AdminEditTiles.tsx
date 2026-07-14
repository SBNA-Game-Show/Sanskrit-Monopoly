import React, { useState, useMemo, useRef, useEffect } from "react";
import type { GameEdition, MonopolyTile } from "./AdminTypes";
import type { GameEdition as SharedGameEdition } from "../../types/game/gameTypes";
import { ZimSceneHost } from "../../components/zim/ZimSceneHost";
import { createZimBoard } from "../../components/zim/createZimBoardPreview";
import { TILE_TYPE_COLORS, PROPERTY_GROUP_COLORS } from "../../constants/zim/board";

interface TilesProps {
  selectedEdition: GameEdition;
  updateEdition: (data: Partial<GameEdition>, errorLabel: string) => Promise<boolean>;
}

export const AdminEditTiles: React.FC<TilesProps> = ({ selectedEdition, updateEdition }) => {
  const [editingTileIndex, setEditingTileIndex] = useState<number | null>(null);
  const [targetTileName, setTargetTileName] = useState("");
  const [tileType, setTileType] = useState<MonopolyTile["type"] | "">("");
  const [tileValue, setTileValue] = useState<number>(0);
  const [propertyCost, setPropertyCost] = useState<number>(0);
  const [rentCost, setRentCost] = useState<number>(0);
  const [sellingCost, setSellingCost] = useState<number>(0);
  const [propertyGroup, setPropertyGroup] = useState<string>("");

  const selectedEditionRef = useRef(selectedEdition);
  useEffect(() => {
    selectedEditionRef.current = selectedEdition;
  }, [selectedEdition]);

  // Dynamically compute tiles with colors based on type and property group
  const editionWithColors = useMemo(() => {
    if (!selectedEdition) return selectedEdition;
    const tilesWithColors = selectedEdition.tiles.map((tile) => {
      let color = "#ffffff";
      if (tile.type === "start") {
        color = "#ffffff";
      } else if (tile.type === "property" && tile.group) {
        color = (PROPERTY_GROUP_COLORS as any)[tile.group] || "#ffffff";
      } else {
        color = (TILE_TYPE_COLORS as any)[tile.type] || TILE_TYPE_COLORS.special || "#f4e8c8";
      }
      return { ...tile, color };
    });
    return {
      ...selectedEdition,
      tiles: tilesWithColors,
    };
  }, [selectedEdition]);

  const boardActions = useMemo(() => ({
    onClick: (idx: number) => {
      const edition = selectedEditionRef.current;
      if (!edition) return;
      const tile = edition.tiles[idx];
      if (!tile) return;

      setEditingTileIndex(idx);
      setTargetTileName(tile.name);
      setTileType(tile.type);
      setTileValue(tile.points ?? 0);
      setPropertyCost(tile.price ?? 0);
      setRentCost(tile.rent ?? 0);
      setSellingCost(tile.sellValue ?? 0);
      setPropertyGroup(tile.group || "");
    }
  }), []);

  const handleTileSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTileIndex === null || !tileType) return;

    const isPurchasableTile = tileType === "property" || tileType === "railroad" || tileType === "utility";
    const updatedTiles = [...selectedEdition.tiles];

    updatedTiles[editingTileIndex] = {
      id: updatedTiles[editingTileIndex].id,
      name: targetTileName.trim() || updatedTiles[editingTileIndex].name,
      type: tileType,
      points: tileType === "minigame" || tileType === "quiz" ? tileValue : 0,
      price: isPurchasableTile ? propertyCost : 0,
      rent: isPurchasableTile ? rentCost : 0,
      sellValue: isPurchasableTile ? sellingCost : 0,
      group: tileType === "property" ? (propertyGroup as MonopolyTile["group"]) : "",
    };

    const ok = await updateEdition({ tiles: updatedTiles }, "Update Failed");
    if (ok) setEditingTileIndex(null);
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4">
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* Left Side: ZIM Interactive Board Preview */}
        <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-2xl p-4 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Interactive Board preview</h4>
          <div className="w-full aspect-square rounded-xl overflow-hidden border border-orange-200 bg-[#202733] shadow-md">
            <ZimSceneHost
              key={editionWithColors.id}
              edition={editionWithColors as unknown as SharedGameEdition}
              state={{ 
                players: [], 
                currentTurnUid: null, 
                lastRoll: null, 
                ownedTiles: {},
                edition: editionWithColors
              } as any}
              stateKey={JSON.stringify(editionWithColors.tiles)}
              createScene={createZimBoard}
              actions={boardActions}
              width={900}
              height={900}
            />
          </div>
        </div>

        {/* Right Side: Edit Tile Configuration panel */}
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
                    <option value="start">Starting Point (GO)</option>
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
              <p className="text-xs text-orange-900 max-w-[200px] mx-auto leading-relaxed">Click any tile on the interactive board to load its configuration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
