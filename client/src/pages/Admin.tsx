import React, { useState } from "react";

interface GameEdition {
  id: string;
  name: string;
  penaltyCount: number;
  activities: string[];
}

function Admin() {
  // View states: 'dashboard', 'create', 'edit', 'delete'
  const [currentView, setView] = useState<"dashboard" | "create" | "edit" | "delete">("dashboard");
  
  const [editions] = useState<GameEdition[]>([
    { id: "1", name: "Good Morals Edition", penaltyCount: 34, activities: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5", "Question 6"] },
    { id: "2", name: "Temple Edition", penaltyCount: 23, activities: ["Question 1", "Question 2", "Question 3"] },
    { id: "3", name: "Bhagavad Gita Edition", penaltyCount: 40, activities: ["Question 1", "Question 2"] },
  ]);
  const [selectedEdition, setSelectedEdition] = useState<GameEdition | null>(null);

  return (
    <main className="min-h-[calc(100vh-56px)] bg-orange-50 px-6 py-10">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl border border-orange-100">
        
        {/* Header Block */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
          <div>
            <h1 className="m-0 text-3xl font-extrabold text-slate-800">Admin</h1>
            <p className="mt-1 text-slate-500 text-sm">Admin-only area.</p>
          </div>
          <span className="bg-orange-100 text-orange-700 text-xs font-mono font-bold px-3 py-1 rounded-full capitalize">
            {currentView} View
          </span>
        </div>

        {/* Mockup Frame Container */}
        <div className="w-full max-w-3xl mx-auto rounded-2xl border border-orange-200 bg-[#FFF5E4] overflow-hidden flex flex-col h-[560px]">
          
          {/* Wireframe Top Header Bar */}
          <div className="bg-[#FFC288] h-16 flex items-center justify-between px-4 relative flex-shrink-0 shadow-sm">
            <button className="bg-[#FA9232] text-sm text-slate-900 font-semibold px-4 py-1.5 rounded-lg border border-orange-400/40">
              Logo
            </button>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-800 tracking-wide">UUID</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right leading-none">
                <span className="text-xs font-bold block text-slate-800">Username</span>
              </div>
              <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center border border-red-700 shadow-sm">
                <span className="text-[9px] text-white font-black leading-none text-center">User state</span>
              </div>
            </div>
          </div>

          {/* Wireframe Dynamic Content Body */}
          <div className="p-6 flex-1 overflow-y-auto relative">
            
            {/* VIEW 1: DASHBOARD PANEL */}
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

                {/* Table Layout */}
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

            {/* VIEW 2: CREATE ACTIVITY */}
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

            {/* VIEW 3: EDIT ACTIVITY BAR */}
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
                  
                  {/* Right Sidebar Inspector panel overlay */}
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

            {/* VIEW 4: DELETE CONFIRMATION */}
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
                        <button className="text-red-700 hover:text-red-900 font-black text-lg px-2 focus:outline-none">
                          —
                        </button>
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

          {/* Wireframe Bottom Accent Ribbon Footer */}
          <div className="bg-[#FFC288] h-12 border-t border-orange-300/30 flex-shrink-0 shadow-inner" />
        </div>

      </section>
    </main>
  );
}

export default Admin;