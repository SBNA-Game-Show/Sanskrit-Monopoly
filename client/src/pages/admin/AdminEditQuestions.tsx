import React, { useState } from "react";
import type { GameEdition, PopQuizActivity } from "./AdminTypes";

interface QuestionsProps {
  selectedEdition: GameEdition;
  updateEdition: (data: Partial<GameEdition>, errorLabel: string) => Promise<boolean>;
}

export const AdminEditQuestions: React.FC<QuestionsProps> = ({ selectedEdition, updateEdition }) => {
  const [quizQuestion, setQuizQuestion] = useState("");
  const [currentOptions, setCurrentOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswerStr, setCorrectAnswerStr] = useState("");

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = currentOptions.map(o => o.trim()).filter(Boolean);
    if (filtered.length < 2) return alert("Please provide at least 2 choice options.");

    const updatedActivities: PopQuizActivity[] = [
      ...(selectedEdition.activities || []),
      { id: "quiz_" + Date.now(), question: quizQuestion.trim(), options: filtered, correctAnswer: correctAnswerStr }
    ];

    const ok = await updateEdition({ activities: updatedActivities }, "Failed to save quiz");
    if (ok) {
      setQuizQuestion("");
      setCurrentOptions(["", "", "", ""]);
      setCorrectAnswerStr("");
    }
  };

  const handleRemoveActivityItem = async (activityId: string) => {
    const updatedActivities = selectedEdition.activities?.filter(act => act.id !== activityId) || [];
    await updateEdition({ activities: updatedActivities }, "Failed to remove item");
  };

  return (
    <div className="grid grid-cols-12 gap-5 items-start border-t border-orange-100 pt-2 animate-fade-in">
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
              <div key={act.id || idx} className="bg-white border border-blue-100 rounded-xl p-3 text-xs shadow-sm space-y-2 relative">
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
  );
};
