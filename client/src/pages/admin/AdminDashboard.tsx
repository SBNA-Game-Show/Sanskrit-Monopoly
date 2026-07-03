import React from "react";
import type { GameEdition } from "./AdminTypes";

interface DashboardProps {
  editions: GameEdition[];
  navigateTo: (page: string, params?: Record<string, string>) => void;
  onDelete: (id: string, name: string) => void;
}

export const AdminDashboard: React.FC<DashboardProps> = ({ editions, navigateTo, onDelete }) => {
  return (
    <div className="bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-5 h-full flex flex-col shadow-sm max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Game Configurations Panel</h3>
        </div>
        <button
          onClick={() => navigateTo("/admin/create")}
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
            editions.map((item) => (
              <div key={item.id} className="grid grid-cols-12 px-4 py-4 items-center text-sm text-slate-700 font-semibold hover:bg-orange-50/30 transition-colors">
                <div className="col-span-6 text-base text-slate-900">{item.name}</div>
                <div className="col-span-3 pl-4">
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {(item.tiles || []).length} Rule Enforcements
                  </span>
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  <button
                    onClick={() => navigateTo(`/admin/${item.id}`, { editionId: item.id })}
                    className="bg-[#3B71CA] hover:bg-blue-600 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-colors shadow-sm"
                  >
                    Configure Rules
                  </button>
                  <button
                    onClick={() => onDelete(item.id, item.name)}
                    className="bg-[#DC4C64] hover:bg-red-600 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-colors shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};