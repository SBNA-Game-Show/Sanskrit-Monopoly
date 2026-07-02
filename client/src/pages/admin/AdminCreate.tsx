import React, { useState } from "react";

interface CreateProps {
  onCreate: (name: string) => Promise<void>;
  navigateTo: (page: string) => void;
}

export const AdminCreate: React.FC<CreateProps> = ({ onCreate, navigateTo }) => {
  const [newEditionName, setNewEditionName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(newEditionName);
    setNewEditionName("");
  };

  return (
    <div className="bg-[#FFFDF9] border border-[#FFE4C4] rounded-xl p-6 shadow-sm max-w-lg mx-auto w-full">
      <h2 className="text-center text-lg font-black text-slate-800 uppercase tracking-wide mb-4">
        Create New Game Edition
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            onClick={() => navigateTo("/admin")}
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
  );
};