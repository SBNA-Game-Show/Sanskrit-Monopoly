import type { GameTile } from "../../types/game/gameTypes";
import { formatMoney } from "../../utils/gameMoney";
import { getTileRent } from "../../utils/gameTiles";
import { isPurchasableTile } from "../../utils/gameTiles";
import { getRuleInfo } from "../../utils/rulesTileHelpers";

type RulesTileFlowPanelProps = {
  className?: string;
  tile: GameTile | null;
  tileIndex: number | null;
};

function getRentRulesText(tile: GameTile) {
  const rent = getTileRent(tile);

  if (tile.type === "railroad") {
    return `Base rent is ${formatMoney(rent)}. Rent can scale when the owner controls more railroads.`;
  }

  if (tile.type === "utility") {
    return "Utility rent uses the configured multiplier, usually based on the dice roll that landed the player here.";
  }

  return `Base rent is ${formatMoney(rent)}. Full color sets can make this space more dangerous.`;
}

function shouldShowSampleQuestion(tile: GameTile) {
  const tileType = tile.type as string;

  return (
    tileType === "quiz" ||
    tileType === "minigame" ||
    tileType === "special"
  );
}

export function RulesTileFlowPanel({
  className = "",
  tile,
  tileIndex,
}: RulesTileFlowPanelProps) {
  if (!tile) return null;

  const ruleInfo = getRuleInfo(tile);
  const tileNumber = tileIndex === null ? "?" : tileIndex;
  const steps = ruleInfo.steps ?? [];

  return (
    <section
      className={[
        "animate-slide-in-up rounded-2xl border border-orange-200 bg-[#fffdf9] p-4 shadow-sm",
        className,
      ].join(" ")}
    >
      {/* This panel holds the variable-length flow text, so the quick tile card can stay stable. */}
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-700">
        Selected Tile Flow
      </p>

      <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.72fr)]">
        <div>
          <h2 className="text-xl font-bold leading-tight text-slate-900">
            Tile #{tileNumber}: {ruleInfo.title}
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            {ruleInfo.summary}
          </p>

          {steps.length > 0 && (
            <ol className="mt-3 space-y-1.5 text-sm font-medium leading-relaxed text-slate-800">
              {steps.map((step) => (
                <li key={step} className="flex gap-2">
                  <span className="mt-0.5 text-orange-600">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
          {isPurchasableTile(tile) ? (
            <>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6b3f1d]">
                Rent Rules
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-[#6b3f1d]">
                {getRentRulesText(tile)}
              </p>
            </>
          ) : shouldShowSampleQuestion(tile) ? (
            <>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6b3f1d]">
                Sample Prompt
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                What does "dharma" most closely mean?
              </p>
              <div className="mt-3 grid gap-2 text-xs font-semibold text-[#6b3f1d]">
                <span className="rounded-xl bg-[#f5bd78] px-3 py-2">
                  Duty or moral order
                </span>
                <span className="rounded-xl bg-white px-3 py-2">
                  A kind of dice roll
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6b3f1d]">
                Quick Note
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-[#6b3f1d]">
                Follow the landing overlay or card prompt before the next turn
                starts.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
