import React, { useState } from "react";

interface GameEdition {
  id: string;
  name: string;
  penaltyCount: number;
  activities: string[];
}

function Admin() {
  const [currentView, setView] = useState<"dashboard" | "create" | "edit" | "delete">("dashboard");

  const [editions] = useState<GameEdition[]>([
    { id: "1", name: "Good Morals Edition", penaltyCount: 34, activities: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5", "Question 6"] },
    { id: "2", name: "Temple Edition", penaltyCount: 23, activities: ["Question 1", "Question 2", "Question 3"] },
    { id: "3", name: "Bhagavad Gita Edition", penaltyCount: 40, activities: ["Question 1", "Question 2"] },
  ]);
  const [selectedEdition, setSelectedEdition] = useState<GameEdition | null>(null);

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#FFF5E4] flex flex-col">

      {/* Mockup Frame — fills full area */}
      <div className="flex flex-col flex-1">

        {/* Dynamic Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">

          {/* VIEW 1: DASHBOARD */}
          {currentView === "dashboard" && (
            <div className="bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-5 h-full flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Game Configurations</h3>
                <button
                  onClick={() => setView("create")}
                  className="bg-[#5CB85C] hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Create
                </button>
              </div>
              <div className="border-2 border-[#00ADFF] rounded-lg overflow-hidden flex-1 bg-white">
                <div className="bg-slate-50 border-b-2 border-[#00ADFF] grid grid-cols-12 px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-6">Configuration</div>
                  <div className="col-span-3">Penalty Activities</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {editions.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 px-4 py-3 items-center text-sm text-slate-700 font-medium">
                      <div className="col-span-6">{item.name}</div>
                      <div className="col-span-3 pl-4">{item.penaltyCount}</div>
                      <div className="col-span-3 flex justify-end gap-1.5">
                        <button
                          onClick={() => { setSelectedEdition(item); setView("edit"); }}
                          className="bg-[#3B71CA] hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setSelectedEdition(item); setView("delete"); }}
                          className="bg-[#DC4C64] hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: CREATE */}
          {currentView === "create" && (
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-4 max-w-md mx-auto w-full pt-4">
                <label className="block text-center text-lg font-bold text-slate-800">
                  Enter Game Configurations Name
                </label>
                <div className="bg-[#FFC288] p-1 rounded-xl border border-[#FA9232]">
                  <input
                    type="text"
                    placeholder="Type name here..."
                    className="w-full bg-[#FFF5E4] border-none rounded-lg px-4 py-2.5 text-sm focus:outline-none placeholder-gray-500"
                    disabled
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <div className="bg-[#FA9232] px-6 py-2 rounded-lg text-[#B05000] font-bold text-sm shadow-sm flex-1 text-center border border-orange-500/20">
                    Enter Penalty Activity
                  </div>
                  <button className="text-3xl text-[#5CB85C] font-black focus:outline-none hover:scale-105 transition-transform">
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setView("dashboard")}
                  className="bg-[#FFC288] hover:bg-orange-300 border border-orange-400 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  BACK
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: EDIT */}
          {currentView === "edit" && selectedEdition && (
            <div className="h-full flex flex-col justify-between">
              <div className="grid grid-cols-12 gap-4 h-full items-start">
                <div className="col-span-8 space-y-3">
                  <div className="mb-1">
                    <h2 className="text-xl font-extrabold text-slate-800 leading-tight">{selectedEdition.name}</h2>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Edit Activities</span>
                  </div>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {selectedEdition.activities.map((activity, idx) => (
                      <div key={idx} className="bg-[#FFC288] rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm border border-orange-300/30">
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-4 bg-[#FFC288] rounded-xl p-4 border border-orange-300/60 shadow-sm space-y-3">
                  <div className="border-b border-orange-400/30 pb-2">
                    <span className="text-sm font-black text-slate-800 block">EDIT BAR</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Question 1</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-xs text-slate-900 font-medium font-sans leading-relaxed shadow-inner border border-orange-300/40 whitespace-pre-line">
                    {"What is the capital\nof Canada?\na.) Toronto\nb.) Kingston\nc.) Montreal\nd.) Ottawa"}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setView("dashboard")}
                  className="bg-white hover:bg-gray-100 border border-gray-300 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  BACK
                </button>
              </div>
            </div>
          )}

          {/* VIEW 4: DELETE */}
          {currentView === "delete" && selectedEdition && (
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 leading-tight">{selectedEdition.name}</h2>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Delete Activity</span>
                  </div>
                  <button className="bg-[#DC4C64] hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
                    DELETE ALL
                  </button>
                </div>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {selectedEdition.activities.map((activity, idx) => (
                    <div key={idx} className="bg-[#FFC288] rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 flex justify-between items-center shadow-sm">
                      <span>{activity}</span>
                      <button className="text-red-700 hover:text-red-900 font-black text-lg px-2 focus:outline-none">—</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setView("dashboard")}
                  className="bg-white hover:bg-gray-100 border border-gray-300 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  BACK
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </main>
  );
}

export default Admin;