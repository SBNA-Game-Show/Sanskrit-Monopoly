import { useEffect, useMemo, useState } from "react";
import { GameOverlayShell } from "./GameOverlayShell";
import { ZimSceneHost } from "../../zim/ZimSceneHost";
import {
  createTapWhenGreenScene,
  type TapWhenGreenState,
  type TapWhenGreenActions,
} from "../../zim/minigames/createTapWhenGreenScene";

export function MiniGameOverlay() {
  const [miniGameState, setMiniGameState] = useState<TapWhenGreenState>({
    status: "waiting",
  });

  // original one used for checking if it works.
  // retained when thing inevtibly bork...
  //   const miniGameActions = useMemo(
  //     () => ({
  //       submitResult: (success: boolean) => {
  //         console.log("Mini-game result submitted:", {
  //           success,
  //           result: success ? "success" : "failed",
  //         });

  //         setMiniGameState({ status: success ? "success" : "failed" });
  //       },
  //     }),
  //     [],
  //   );

  const miniGameActions = useMemo(
    () => ({
      submitResult: (success: boolean) => {
        setMiniGameState({ status: success ? "success" : "failed" });
      },
    }),
    [],
  );

  useEffect(() => {
    const greenTimer = window.setTimeout(() => {
      setMiniGameState({ status: "green" });
    }, 1500);

    const failTimer = window.setTimeout(() => {
      setMiniGameState((currentState) =>
        currentState.status === "green" ? { status: "failed" } : currentState,
      );
    }, 4000);

    return () => {
      window.clearTimeout(greenTimer);
      window.clearTimeout(failTimer);
    };
  }, []);

  return (
    <GameOverlayShell>
      <h2 className="text-2xl font-bold text-gray-800">Mini Game</h2>

      <p className="mt-2 text-sm text-gray-600">
        Tap when the screen turns green.
      </p>

      <div className="mt-4 h-[320px] w-full overflow-hidden rounded-lg">
        <ZimSceneHost<TapWhenGreenState, TapWhenGreenActions>
          state={miniGameState}
          actions={miniGameActions}
          createScene={createTapWhenGreenScene}
          width={500}
          height={320}
          backgroundColor="#111827"
        />
      </div>
    </GameOverlayShell>
  );
}
