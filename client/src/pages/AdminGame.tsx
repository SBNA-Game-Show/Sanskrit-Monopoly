// import { useState } from "react";
// import ZimMonopolyBoard from "../components/zim/ZimMonopolyBoard";

// type Player = {
//   id: number;
//   name: string;
//   money: number;
//   position: number;
//   status: string;
//   token: string;
//   properties: number;
//   score: number;
// };

// type AdminModal = "penalties" | "rewards" | "questions" | "settings" | null;

// function AdminGame({ gameState }) {
//   console.log(gameState);
//   const [players, setPlayers] = useState<Player[]>([
//     {
//       id: 1,
//       name: gameState.players[0].username,
//       money: 850,
//       position: 12,
//       status: "Active",
//       token: "🐘",
//       properties: 2,
//       score: 850,
//     },
//     {
//       id: 2,
//       name: gameState.players[1].username,
//       money: 823,
//       position: 15,
//       status: "Active",
//       token: "👟",
//       properties: 3,
//       score: 823,
//     },
//     {
//       id: 3,
//       name: gameState.players[2].username,
//       money: 489,
//       position: 7,
//       status: "Active",
//       token: "🐕",
//       properties: 1,
//       score: 489,
//     },
//     {
//       id: 4,
//       name: gameState.players[3].username,
//       money: 569,
//       position: 13,
//       status: "Active",
//       token: "🚢",
//       properties: 1,
//       score: 569,
//     },
//   ]);

//   const [currentPlayerIndex, setCurrentPlayerIndex] = useState(1);
//   const [diceResult, setDiceResult] = useState(5);
//   const [tileLanded, setTileLanded] = useState("शब्द-परीक्षा");
//   const [activeModal, setActiveModal] = useState<AdminModal>(null);

//   const currentPlayer = players[currentPlayerIndex];

//   function handleAddPlayer() {
//     if (players.length >= 5) {
//       alert("Maximum 5 players allowed.");
//       return;
//     }

//     const name = prompt("Enter player name:");
//     if (!name) return;

//     const tokens = ["🐘", "👟", "🐕", "🚢", "🐎"];

//     const newPlayer: Player = {
//       id: Date.now(),
//       name,
//       money: 500,
//       position: 0,
//       status: "Active",
//       token: tokens[players.length] || "🪙",
//       properties: 0,
//       score: 0,
//     };

//     setPlayers([...players, newPlayer]);
//   }

//   function handleRemovePlayer(id: number) {
//     const playerToRemove = players.find((player) => player.id === id);
//     const confirmed = confirm(
//       `Remove ${playerToRemove?.name || "this player"}?`,
//     );

//     if (!confirmed) return;

//     const updatedPlayers = players.filter((player) => player.id !== id);

//     setPlayers(updatedPlayers);

//     if (currentPlayerIndex >= updatedPlayers.length) {
//       setCurrentPlayerIndex(0);
//     }
//   }

//   function handleNextTurn() {
//     if (players.length === 0) return;

//     setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
//   }

//   function handleForceRoll() {
//     if (!currentPlayer) return;

//     const roll = Math.ceil(Math.random() * 6);
//     const newPosition = (currentPlayer.position + roll) % 40;
//     const newTile = newPosition % 2 === 0 ? "शब्द-परीक्षा" : "पुरस्कारः";

//     setDiceResult(roll);
//     setTileLanded(newTile);

//     setPlayers((previousPlayers) =>
//       previousPlayers.map((player, index) =>
//         index === currentPlayerIndex
//           ? {
//               ...player,
//               position: newPosition,
//               money:
//                 newTile === "पुरस्कारः"
//                   ? player.money + 100
//                   : player.money - 50,
//               score:
//                 newTile === "पुरस्कारः" ? player.score + 50 : player.score - 20,
//             }
//           : player,
//       ),
//     );
//   }

//   function handleAdjustMoney(playerId: number, amount: number) {
//     setPlayers((previousPlayers) =>
//       previousPlayers.map((player) =>
//         player.id === playerId
//           ? {
//               ...player,
//               money: player.money + amount,
//               score: player.score + amount,
//             }
//           : player,
//       ),
//     );
//   }

//   function renderModalContent() {
//     if (activeModal === "penalties") {
//       return (
//         <>
//           <h2 className="mb-4 text-[28px] font-bold text-[#ff514b]">
//             Manage Penalties / दण्डाः
//           </h2>

//           <div className="space-y-4">
//             <label className="block">
//               <span className="mb-1 block font-bold">Penalty Title</span>
//               <input
//                 className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="शब्द-परीक्षा"
//               />
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Question</span>
//               <textarea
//                 className="min-h-[90px] w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="What does जलम् mean?"
//               />
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Options</span>
//               <input
//                 className="mb-2 w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="A. Fire"
//               />
//               <input
//                 className="mb-2 w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="B. Water"
//               />
//               <input
//                 className="mb-2 w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="C. Sky"
//               />
//               <input
//                 className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="D. Earth"
//               />
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Penalty Amount</span>
//               <input
//                 className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="-50"
//               />
//             </label>
//           </div>
//         </>
//       );
//     }

//     if (activeModal === "rewards") {
//       return (
//         <>
//           <h2 className="mb-4 text-[28px] font-bold text-[#ff514b]">
//             Manage Rewards / पुरस्काराः
//           </h2>

//           <div className="space-y-4">
//             <label className="block">
//               <span className="mb-1 block font-bold">Reward Name</span>
//               <input
//                 className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="काशी विश्वनाथः"
//               />
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Description</span>
//               <textarea
//                 className="min-h-[90px] w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="You visited a sacred cultural site."
//               />
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Money Reward</span>
//               <input
//                 className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="100"
//               />
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Points Reward</span>
//               <input
//                 className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="150"
//               />
//             </label>
//           </div>
//         </>
//       );
//     }

//     if (activeModal === "questions") {
//       return (
//         <>
//           <h2 className="mb-4 text-[28px] font-bold text-[#ff514b]">
//             Manage Questions / प्रश्नाः
//           </h2>

//           <div className="space-y-4">
//             <label className="block">
//               <span className="mb-1 block font-bold">Question Type</span>
//               <select className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3">
//                 <option>Multiple Choice</option>
//                 <option>Fill in the Blank</option>
//                 <option>True / False</option>
//               </select>
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Question</span>
//               <textarea
//                 className="min-h-[90px] w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="What does सूर्यः mean?"
//               />
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Difficulty</span>
//               <select className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3">
//                 <option>Easy</option>
//                 <option>Medium</option>
//                 <option>Hard</option>
//               </select>
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Edition</span>
//               <select className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3">
//                 <option>Temples Edition</option>
//                 <option>Moral Teachings Edition</option>
//                 <option>Bhagavad Gita Edition</option>
//                 <option>Sanskrit Vocabulary Edition</option>
//               </select>
//             </label>
//           </div>
//         </>
//       );
//     }

//     if (activeModal === "settings") {
//       return (
//         <>
//           <h2 className="mb-4 text-[28px] font-bold text-[#ff514b]">
//             Game Settings
//           </h2>

//           <div className="space-y-4">
//             <label className="block">
//               <span className="mb-1 block font-bold">Max Players</span>
//               <select className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3">
//                 <option>5</option>
//                 <option>4</option>
//                 <option>3</option>
//                 <option>2</option>
//               </select>
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Dice Sound</span>
//               <select className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3">
//                 <option>On</option>
//                 <option>Off</option>
//               </select>
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Leaderboard Sync</span>
//               <select className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3">
//                 <option>On</option>
//                 <option>Off</option>
//               </select>
//             </label>

//             <label className="block">
//               <span className="mb-1 block font-bold">Turn Timer</span>
//               <input
//                 className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3"
//                 defaultValue="60 seconds"
//               />
//             </label>
//           </div>
//         </>
//       );
//     }

//     return null;
//   }

//   return (
//     <main className="min-h-screen w-full bg-[#161616] font-sans text-[#160f08]">
//       <section className="flex min-h-screen w-full flex-col bg-[#fffaf0]">
//         {/* Main Content */}
//         <section className="grid flex-1 grid-cols-[340px_1fr_340px] gap-6 bg-[#fffaf0] p-6 pt-8">
//           {/* Players Panel */}
//           <aside className="max-h-[calc(100vh-130px)] overflow-y-auto rounded-2xl bg-[#f5bd78] p-5 shadow-xl">
//             <h2 className="mb-5 text-[28px] font-bold leading-none text-[#ff514b]">
//               Players
//               <span className="mt-1 block text-[22px]">क्रीडकाः</span>
//             </h2>

//             <button
//               onClick={handleAddPlayer}
//               className="mb-5 h-[50px] w-full rounded-[20px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//             >
//               + Add Player
//             </button>

//             <div className="space-y-5">
//               {players.map((player, index) => (
//                 <div
//                   key={player.id}
//                   className={`rounded-2xl border-[6px] p-4 shadow-md ${
//                     index === currentPlayerIndex
//                       ? "border-[#6b3f1d] bg-[#ffd7a3]"
//                       : "border-[#ffa23b] bg-[#ffb45c]"
//                   }`}
//                 >
//                   {/* Player info + token */}
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="text-[15px] leading-[1.45]">
//                       <p className="font-semibold">
//                         Player {index + 1} — {player.name}
//                       </p>
//                       <p>धनम्: {player.money}</p>
//                       <p>Position: {player.position}</p>
//                       <p>Status: {player.status}</p>
//                     </div>

//                     <div className="flex h-[64px] w-[74px] shrink-0 items-center justify-center rounded-xl bg-white/25 text-[42px] grayscale">
//                       {player.token}
//                     </div>
//                   </div>

//                   {/* Buttons */}
//                   <div className="mt-4 flex justify-end gap-3">
//                     <button
//                       onClick={() => handleAdjustMoney(player.id, 50)}
//                       className="rounded-full bg-[#e84a15] px-4 py-2 text-xs font-bold text-white shadow"
//                     >
//                       +50
//                     </button>

//                     <button
//                       onClick={() => handleRemovePlayer(player.id)}
//                       className="rounded-full bg-[#b33a3a] px-4 py-2 text-xs font-bold text-white shadow"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </aside>

//           {/* Board */}
//           <section className="flex min-w-0 flex-col">
//             <div className="mb-4 rounded-2xl bg-[#f5bd78] px-6 py-4 shadow-md">
//               <p className="text-[16px] font-semibold text-[#6b3f1d]">
//                 Room Code
//               </p>
//               <h2 className="text-[30px] font-extrabold tracking-wide text-[#160f08]">
//                 {gameState.lobbyCode}
//               </h2>
//             </div>

//             <div className="flex flex-1 items-center justify-center rounded-[22px] border-[12px] border-[#6b3f1d] bg-[#202733] p-4 shadow-2xl">
//               <div className="aspect-square h-full max-h-[calc(100vh-210px)] w-full max-w-[calc(100vh-210px)]">
//                 <ZimMonopolyBoard
//                   positions={players.map((player) => player.position)}
//                   currentPlayerIndex={currentPlayerIndex}
//                 />
//               </div>
//             </div>

//             <div className="mt-5 flex justify-center gap-8">
//               <button
//                 onClick={handleForceRoll}
//                 className="h-[52px] min-w-[170px] rounded-[20px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Force Roll
//               </button>

//               <button
//                 onClick={handleNextTurn}
//                 className="h-[52px] min-w-[170px] rounded-[20px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Skip Turn
//               </button>

//               <button
//                 onClick={handleNextTurn}
//                 className="h-[52px] min-w-[170px] rounded-[20px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 End Turn
//               </button>
//             </div>
//           </section>

//           {/* Admin Controls */}
//           <aside className="rounded-2xl bg-[#f5bd78] p-6 shadow-xl">
//             <h2 className="mb-7 text-[26px] font-bold text-[#ff514b]">
//               Admin Controls
//             </h2>

//             <div className="flex flex-col items-center gap-5">
//               <button
//                 onClick={() => setActiveModal("penalties")}
//                 className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Penalties
//               </button>

//               <button
//                 onClick={() => setActiveModal("rewards")}
//                 className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Rewards
//               </button>

//               <button
//                 onClick={() => setActiveModal("questions")}
//                 className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Questions
//               </button>

//               <button
//                 onClick={() => setActiveModal("settings")}
//                 className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Settings
//               </button>

//               <button
//                 onClick={() =>
//                   alert(
//                     "End game clicked. Backend logic will be connected later.",
//                   )
//                 }
//                 className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#b33a3a] text-lg font-bold text-white shadow-md hover:bg-[#d94a4a]"
//               >
//                 End Game
//               </button>
//             </div>

//             <div className="mt-12 rounded-2xl bg-[#fff4dc] p-4 text-[18px] leading-tight shadow-inner">
//               <p className="mb-2 font-bold">Current Player</p>
//               Player: {currentPlayer?.name || "None"}
//               <br />
//               Position: {currentPlayer?.position ?? 0}
//               <br />
//               धनम्: {currentPlayer?.money ?? 0}
//               <br />
//               Score: {currentPlayer?.score ?? 0}
//             </div>
//           </aside>
//         </section>

//         {/* Footer */}
//         <footer className="min-h-[82px] bg-[#f5bd78] px-8 py-3 text-[20px] leading-tight">
//           {/* Current Turn: Player {currentPlayerIndex + 1} — {currentPlayer?.name || "None"}
//           <br />
//           Dice Result: {diceResult}
//           <br />
//           Tile Landed: {tileLanded} */}
//         </footer>
//       </section>

//       {/* Modal */}
//       {activeModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
//           <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-3xl border-[8px] border-[#ffa23b] bg-[#f5bd78] p-6 shadow-2xl">
//             {renderModalContent()}

//             <div className="mt-7 flex justify-end gap-4">
//               <button
//                 onClick={() => setActiveModal(null)}
//                 className="h-[48px] min-w-[130px] rounded-[18px] border-[5px] border-[#ffa23b] bg-[#fff4dc] px-6 font-bold text-[#160f08] shadow-md"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={() => {
//                   alert(
//                     "Saved on frontend. Config/backend connection will be added later.",
//                   );
//                   setActiveModal(null);
//                 }}
//                 className="h-[48px] min-w-[130px] rounded-[18px] border-[5px] border-[#ffa23b] bg-[#e84a15] px-6 font-bold text-white shadow-md"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

// export default AdminGame;
