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

// function Game({ gameState }) {
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
//   const [popupTitle, setPopupTitle] = useState("");
//   const [popupMessage, setPopupMessage] = useState("");

//   const currentPlayer = players[currentPlayerIndex];

//   function speak(text: string) {
//     if (!("speechSynthesis" in window)) return;

//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.85;
//     window.speechSynthesis.speak(utterance);
//   }

//   function showPopup(title: string, message: string) {
//     setPopupTitle(title);
//     setPopupMessage(message);
//   }

//   function closePopup() {
//     setPopupTitle("");
//     setPopupMessage("");
//   }

//   function updateCurrentPlayer(updater: (player: Player) => Player) {
//     setPlayers((previousPlayers) =>
//       previousPlayers.map((player, index) =>
//         index === currentPlayerIndex ? updater(player) : player,
//       ),
//     );
//   }

//   function handleRollDice() {
//     if (!currentPlayer) return;

//     const roll = Math.ceil(Math.random() * 6);
//     const newPosition = (currentPlayer.position + roll) % 40;

//     let landedTile = "सुरक्षित-स्थानम्";
//     let message = `You rolled ${roll}. Safe space.`;

//     setDiceResult(roll);

//     updateCurrentPlayer((player) => {
//       let moneyChange = 0;
//       let scoreChange = 0;

//       if (newPosition % 3 === 0) {
//         landedTile = "पुरस्कारः";
//         moneyChange = 100;
//         scoreChange = 50;
//         message = `You rolled ${roll}. Reward received: +100 धनम्.`;
//       } else if (newPosition % 2 === 0) {
//         landedTile = "शब्द-परीक्षा";
//         moneyChange = -50;
//         scoreChange = -20;
//         message = `You rolled ${roll}. Penalty challenge: -50 धनम्.`;
//       }

//       return {
//         ...player,
//         position: newPosition,
//         money: player.money + moneyChange,
//         score: player.score + scoreChange,
//       };
//     });

//     setTileLanded(landedTile);
//     speak(`You rolled ${roll}`);
//     showPopup(landedTile, message);

//     setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
//   }

//   function handleBuyProperty() {
//     if (!currentPlayer) return;

//     if (currentPlayer.money < 100) {
//       showPopup(
//         "Not Enough धनम्",
//         "You do not have enough money to buy this property.",
//       );
//       return;
//     }

//     updateCurrentPlayer((player) => ({
//       ...player,
//       money: player.money - 100,
//       properties: player.properties + 1,
//       score: player.score + 100,
//     }));

//     showPopup(
//       "Property Bought",
//       "You bought this cultural property for 100 धनम्.",
//     );
//   }

//   function handleCollectRent() {
//     updateCurrentPlayer((player) => ({
//       ...player,
//       money: player.money + 75,
//       score: player.score + 25,
//     }));

//     showPopup("Rent Collected", "You collected 75 धनम् as rent.");
//   }

//   function handleChance() {
//     updateCurrentPlayer((player) => ({
//       ...player,
//       money: player.money + 50,
//       score: player.score + 30,
//     }));

//     showPopup("Chance", "Lucky chance! You gained 50 धनम्.");
//   }

//   function handleCommunityChest() {
//     showPopup(
//       "Community Chest",
//       "Sanskrit learning card opened. Question logic will be connected later.",
//     );
//   }

//   function handleLeaveGame() {
//     showPopup(
//       "Leave Game",
//       "Leave game clicked. Backend room logic will be connected later.",
//     );
//   }

//   return (
//     <main className="min-h-screen w-full bg-[#161616] font-sans text-[#160f08]">
//       <section className="flex min-h-screen w-full flex-col bg-[#fffaf0]">
//         {/* Main Content */}
//         <section className="grid flex-1 grid-cols-[320px_1fr_330px] gap-6 bg-[#fffaf0] p-6 pt-8">
//           {/* Players */}
//           <aside className="rounded-2xl bg-[#f5bd78] p-5 shadow-xl">
//             <h2 className="mb-5 text-[28px] font-bold leading-none text-[#ff514b]">
//               Players
//               <span className="mt-1 block text-[22px]">क्रीडकाः</span>
//             </h2>

//             <div className="space-y-4">
//               {players.map((player, index) => (
//                 <div
//                   key={player.id}
//                   className={`relative min-h-[112px] rounded-2xl border-[6px] p-3 shadow-md ${
//                     index === currentPlayerIndex
//                       ? "border-[#6b3f1d] bg-[#ffd7a3]"
//                       : "border-[#ffa23b] bg-[#ffb45c]"
//                   }`}
//                 >
//                   <div className="w-[160px] text-[16px] leading-tight">
//                     {index === 1 ? "YOU" : `Player ${index + 1}`} —{" "}
//                     {player.name}
//                     <br />
//                     धनम्: {player.money}
//                     <br />
//                     Position: {player.position}
//                     <br />
//                     Status: {player.status}
//                   </div>

//                   <div className="absolute right-4 top-7 flex h-[60px] w-[70px] items-center justify-center rounded-xl bg-white/25 text-[44px] grayscale">
//                     {player.token}
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
//           </section>

//           {/* Player Actions */}
//           <aside className="rounded-2xl bg-[#f5bd78] p-6 shadow-xl">
//             <div className="flex flex-col items-center gap-4">
//               <button
//                 onClick={handleBuyProperty}
//                 className="h-[58px] w-[220px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Buy Property
//               </button>

//               <button
//                 onClick={handleCollectRent}
//                 className="h-[58px] w-[220px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Collect Rent
//               </button>

//               <button
//                 onClick={handleChance}
//                 className="h-[58px] w-[220px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Chance
//               </button>

//               <button
//                 onClick={handleCommunityChest}
//                 className="h-[58px] w-[220px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-base font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Community Chest
//               </button>

//               <button
//                 onClick={handleLeaveGame}
//                 className="h-[58px] w-[220px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#b33a3a] text-lg font-bold text-white shadow-md hover:bg-[#d94a4a]"
//               >
//                 Leave Game
//               </button>
//             </div>

//             <div className="mt-16 text-[23px] leading-tight">
//               Position : {currentPlayer?.position ?? 0}
//               <br />
//               Money : {currentPlayer?.money ?? 0}
//               <br />
//               Properties : {currentPlayer?.properties ?? 0}
//               <br />
//               Score : {currentPlayer?.score ?? 0}
//             </div>

//             <div className="mt-8 flex items-center justify-end gap-4">
//               <div className="flex h-[70px] w-[70px] rotate-[-12deg] items-center justify-center rounded-2xl bg-gradient-to-br from-white to-gray-400 text-[32px] shadow-lg">
//                 🎲
//               </div>

//               <button
//                 onClick={handleRollDice}
//                 className="h-[58px] w-[170px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
//               >
//                 Roll Dice
//               </button>
//             </div>
//           </aside>
//         </section>

//         {/* Footer */}
//         <footer className="min-h-[82px] bg-[#f5bd78] px-8 py-3 text-[20px] leading-tight">
//           Current Turn: Player {currentPlayerIndex + 1} —{" "}
//           {currentPlayer?.name || "None"}
//           <br />
//           Dice Result: {diceResult}
//           <br />
//           Tile Landed: {tileLanded}
//         </footer>
//       </section>

//       {/* Popup */}
//       {popupTitle && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
//           <div className="w-full max-w-[480px] rounded-3xl border-[8px] border-[#ffa23b] bg-[#f5bd78] p-6 shadow-2xl">
//             <h2 className="mb-3 text-[28px] font-bold text-[#ff514b]">
//               {popupTitle}
//             </h2>
//             <p className="mb-6 text-lg leading-relaxed">{popupMessage}</p>

//             <div className="flex justify-end">
//               <button
//                 onClick={closePopup}
//                 className="h-[48px] min-w-[130px] rounded-[18px] border-[5px] border-[#ffa23b] bg-[#e84a15] px-6 font-bold text-white shadow-md"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

// export default Game;
