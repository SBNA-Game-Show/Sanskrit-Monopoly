import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { db } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import type { GameEdition, MonopolyTile } from "./AdminTypes";
import { ZimSceneHost } from "../../components/zim/ZimSceneHost";
import { createZimBoard } from "../../components/zim/createZimBoardPreview";
import type { GameEdition as SharedGameEdition } from "../../types/game/gameTypes";
import { TILE_TYPE_COLORS, PROPERTY_GROUP_COLORS } from "../../constants/zim/board";

export const AdminEditEdition: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const [selectedEdition, setSelectedEdition] = useState<GameEdition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [editNameValue, setEditNameValue] = useState<string>("");
  const [editingTileIndex, setEditingTileIndex] = useState<number | null>(null);
  const [targetTileName, setTargetTileName] = useState("");
  const [tileType, setTileType] = useState<MonopolyTile["type"] | "">("");
  const [tileValue, setTileValue] = useState<number>(0);
  const [propertyCost, setPropertyCost] = useState<number>(0);
  const [rentCost, setRentCost] = useState<number>(0);
  const [sellingCost, setSellingCost] = useState<number>(0);
  const [propertyGroup, setPropertyGroup] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "game_editions", id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const rawTiles = data.tiles || [];
        const tilesWithColors = rawTiles.map((tile: any) => {
          let color = "#ffffff";
          if (tile.type === "property" && tile.group) {
            color = (PROPERTY_GROUP_COLORS as any)[tile.group] || "#ffffff";
          } else {
            color = (TILE_TYPE_COLORS as any)[tile.type] || TILE_TYPE_COLORS.special || "#f4e8c8";
          }
          return { ...tile, color };
        });

        setSelectedEdition({
          id: snapshot.id,
          name: data.name || "Unnamed Edition",
          tiles: tilesWithColors,
          activities: data.activities || []
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

  const selectedEditionRef = useRef(selectedEdition);
  useEffect(() => {
    selectedEditionRef.current = selectedEdition;
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
    if (!selectedEdition || editingTileIndex === null || !id || !tileType) return;

    const isPurchasableTile = tileType === "property" || tileType === "railroad" || tileType === "utility";
    const updatedTiles = [...selectedEdition.tiles];

    updatedTiles[editingTileIndex] = {
      id: updatedTiles[editingTileIndex].id,
      name: targetTileName.trim() || updatedTiles[editingTileIndex].name,
      type: tileType as MonopolyTile["type"],
      points: tileType === "minigame" || tileType === "quiz" ? tileValue : 0,
      price: isPurchasableTile ? propertyCost : 0,
      rent: isPurchasableTile ? rentCost : 0,
      sellValue: isPurchasableTile ? sellingCost : 0,
      group: tileType === "property" ? (propertyGroup as any) : "",
    };

    try {
      await updateDoc(doc(db, "game_editions", id), { tiles: updatedTiles });
      setEditingTileIndex(null);
    } catch (err) {
      alert("Update Failed: " + err);
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
    <div className="max-w-6xl mx-auto w-full space-y-4">
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
        <button onClick={() => navigate("/admin")} className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors">Back to Dashboard</button>
      </div>

      <div className="grid grid-cols-12 gap-5 items-start">
        {/* Left Side: ZIM Interactive Board Preview */}
        <div className="col-span-7 bg-[#FFFDF9] border border-[#FFE4C4] rounded-2xl p-4 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Interactive Board preview</h4>
          <div className="w-full aspect-square rounded-xl overflow-hidden border border-orange-200 bg-[#202733] shadow-md">
            <ZimSceneHost
              key={selectedEdition.id}
              edition={selectedEdition as unknown as SharedGameEdition}
              state={{ 
                players: [], 
                currentTurnUid: null, 
                lastRoll: null, 
                ownedTiles: {},
                edition: selectedEdition
              } as any}
              stateKey={JSON.stringify(selectedEdition.tiles)}
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