import type { GameTile } from "../../types/game/gameTypes";
import { formatMoney } from "../../utils/gameMoney";
import { getTileRent } from "../../utils/gameTiles";
import { getSellValue } from "../../utils/gameTiles";
import { getTilePrice } from "../../utils/gameTiles";

type PropertySummaryCardProps = {
  tile: GameTile;
  label?: string;
};

export function PropertySummaryCard({
  tile,
  label = "Property",
}: PropertySummaryCardProps) {
  return (
    <div className="w-full max-w-[488px] justify-self-center self-start overflow-hidden rounded-[22px] border-[5px] border-[#6b3f1d] bg-[#fff4dc] text-left text-[#160f08] shadow-inner">
      <div
        className="h-16 border-b-[5px] border-[#6b3f1d]"
        style={{ backgroundColor: tile.color ?? "#ffffff" }}
      />

      <div className="p-6">
        {/* Match the larger purchase-property card proportions when reused in auctions. */}
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#6b3f1d]">
          {label}
        </p>

        <h3 className="mt-2 text-[34px] font-extrabold leading-tight text-[#160f08]">
          {tile.name}
        </h3>

        <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold leading-relaxed text-[#6b3f1d]">
          {tile.description ?? "Review this property before taking action."}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
            <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
              Price
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              {formatMoney(getTilePrice(tile))}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
            <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
              Rent
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              {formatMoney(getTileRent(tile))}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
            <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
              Sell
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              {formatMoney(getSellValue(tile))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
