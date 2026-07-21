import { useMemo, useState } from "react";
import { DEFAULT_EDITION } from "../../../../shared/defaultEdition.js";
import { ZimSceneHost } from "../../components/zim/ZimSceneHost";
import { createZimBoard } from "../../components/zim/createZimBoardPreview";
import { getTilesWithNormalizedColors } from "../../utils/editionColors";
import type { GameEdition } from "../../types/game/gameTypes";
import { RulesSectionList } from "./RulesSectionList";
import { RulesTileFlowPanel } from "./RulesTileFlowPanel";
import { RulesTileInfoPanel } from "./RulesTileInfoPanel";

type RulesBoardActions = {
  onClick: (index: number) => void;
};

function buildRulesEdition(): GameEdition {
  const defaultEdition = DEFAULT_EDITION as GameEdition;

  return {
    ...defaultEdition,
    tiles: getTilesWithNormalizedColors(defaultEdition.tiles),
  };
}

export function RulesBoardExplorer() {
  const [selectedTileIndex, setSelectedTileIndex] = useState<number>(0);

  const edition = useMemo(() => buildRulesEdition(), []);
  const selectedTile = edition.tiles[selectedTileIndex] ?? null;

  const boardActions = useMemo<RulesBoardActions>(
    () => ({
      onClick: (index) => {
        setSelectedTileIndex(index);
      },
    }),
    [],
  );

  return (
    <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[280px_minmax(500px,600px)_260px] 2xl:grid-cols-[300px_minmax(540px,620px)_280px]">
      <RulesSectionList className="order-4 xl:order-1 xl:row-span-2" />

      <div className="order-1 w-full self-start rounded-2xl border border-orange-200 bg-[#fffdf9] p-4 shadow-sm xl:order-2">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-700">
              Interactive Board
            </p>
            <h2 className="text-lg font-bold text-slate-900">
              Click a tile to learn more!
            </h2>
          </div>
        </div>

        <div className="mx-auto aspect-square w-full max-w-[580px] overflow-hidden rounded-xl border border-orange-200 bg-[#202733] shadow-md">
          <ZimSceneHost
            edition={edition}
            state={{ edition }}
            stateKey={JSON.stringify(edition.tiles)}
            createScene={createZimBoard}
            actions={boardActions}
            width={900}
            height={900}
          />
        </div>
      </div>

      <div className="order-2 self-start xl:order-3">
        <RulesTileInfoPanel tile={selectedTile} tileIndex={selectedTileIndex} />
      </div>

      <RulesTileFlowPanel
        className="order-3 xl:order-4 xl:col-span-3 xl:col-start-1"
        tile={selectedTile}
        tileIndex={selectedTileIndex}
      />
    </section>
  );
}
