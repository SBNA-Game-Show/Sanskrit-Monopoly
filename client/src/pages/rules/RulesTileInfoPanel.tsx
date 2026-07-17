import {
  fallbackTileRuleInfo,
  tileRuleInfoByType,
} from "../../content/monopolyRules";
import type { GameTile } from "../../types/game/gameTypes";

type RulesTileInfoPanelProps = {
  tile: GameTile | null;
  tileIndex: number | null;
};

function formatMoney(amount: number) {
  return amount < 0 ? `-₩${Math.abs(amount)}` : `₩${amount}`;
}

function getTilePrice(tile: GameTile) {
  return tile.price ?? 100;
}

function getTileRent(tile: GameTile) {
  if (tile.type === "railroad") return tile.rent ?? 25;
  if (tile.type === "utility") return tile.rent ?? 4;

  return tile.rent ?? Math.max(10, Math.round(getTilePrice(tile) * 0.1));
}

function getSellValue(tile: GameTile) {
  return tile.sellValue ?? Math.round(getTilePrice(tile) * 0.5);
}

function isPurchasableTile(tile: GameTile) {
  return (
    tile.type === "property" ||
    tile.type === "railroad" ||
    tile.type === "utility"
  );
}

function getRuleInfo(tile: GameTile) {
  // Custom edition tile types fall back to a generic activity explanation.
  return tileRuleInfoByType[tile.type] ?? fallbackTileRuleInfo;
}

function getStatItems(tile: GameTile) {
  if (isPurchasableTile(tile)) {
    return [
      { label: "Price", value: formatMoney(getTilePrice(tile)) },
      { label: "Rent", value: formatMoney(getTileRent(tile)) },
      { label: "Sell", value: formatMoney(getSellValue(tile)) },
    ];
  }

  if (tile.type === "tax" && typeof tile.amount === "number") {
    return [{ label: "Pay", value: formatMoney(tile.amount) }];
  }

  return [];
}

function getTileMeta(tile: GameTile) {
  const tileType = tile.type as string;

  if (tile.type === "tax" && typeof tile.amount === "number") {
    return `Configured amount: ${formatMoney(tile.amount)}`;
  }

  if (tileType === "quiz" || tileType === "minigame") {
    return "Activity results apply before the turn can fully move on.";
  }

  if (tileType === "special" || tileType === "chance") {
    return "Event behavior depends on the card or activity drawn.";
  }

  if (tileType === "community") {
    return "Community cards resolve through the shared card overlay.";
  }

  return "Follow the rule shown here when a player lands on this tile.";
}

export function RulesTileInfoPanel({
  tile,
  tileIndex,
}: RulesTileInfoPanelProps) {
  if (!tile) {
    return (
      <aside className="rounded-2xl border border-orange-200 bg-[#fffdf9] p-6 shadow-sm">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-orange-700">
          Board Explorer
        </p>
        <h2 className="mt-3 text-2xl font-black text-slate-800">
          Pick a tile
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Click any board space to see how that tile behaves during the game.
        </p>
      </aside>
    );
  }

  const ruleInfo = getRuleInfo(tile);
  const tileNumber = tileIndex === null ? "?" : tileIndex;
  const statItems = getStatItems(tile);
  const statGridClass = statItems.length === 1 ? "grid-cols-1" : "grid-cols-3";

  return (
    <aside className="animate-slide-in-up rounded-2xl border-[2px] border-[#6b3f1d] bg-[#fff4dc] text-[#160f08] shadow-sm">
      <div
        className="h-10 rounded-t-[18px] border-b-[2px] border-[#6b3f1d]"
        style={{ backgroundColor: tile.color ?? "#f4e8c8" }}
      />

      <section className="p-3.5">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6b3f1d]">
            Tile #{tileNumber} · {tile.type}
          </p>
          <h2 className="mt-1.5 text-[24px] font-extrabold leading-tight text-[#160f08]">
            {tile.name}
          </h2>
          <p className="mt-1 text-xs font-bold text-orange-700">
            {ruleInfo.title}
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2.5 text-xs font-medium leading-relaxed text-[#6b3f1d]">
            {ruleInfo.summary}
          </p>
        </div>

        {statItems.length > 0 && (
          <div className={`mt-3 grid ${statGridClass} gap-2 text-center`}>
            {statItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-[#f5bd78] px-2 py-2 shadow-sm"
              >
                <p className="text-[10px] font-extrabold uppercase text-[#6b3f1d]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-base font-extrabold">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold leading-relaxed text-orange-50">
          {ruleInfo.note ?? getTileMeta(tile)}
        </p>
      </section>
    </aside>
  );
}
