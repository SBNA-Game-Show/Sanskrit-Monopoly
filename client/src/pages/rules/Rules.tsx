import { RulesBoardExplorer } from "./RulesBoardExplorer";

function Rules() {
  return (
    <main className="page-shell">
      <div className="page-content max-w-[1600px]">
        <header className="mb-6">
          {/* The rules page leads with the playable board preview instead of another long text block. */}
          <h1 className="mt-2 text-3xl font-black leading-tight text-slate-900">
            Board Rules
          </h1>
          <p className="text-xs font-semibold leading-relaxed text-slate-600">
            Use the rulebook to learn how this game works!
          </p>
        </header>

        <RulesBoardExplorer />
      </div>
    </main>
  );
}

export default Rules;
