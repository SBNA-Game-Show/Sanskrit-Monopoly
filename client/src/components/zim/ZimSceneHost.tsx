import { useEffect, useId, useRef } from "react";
import * as zim from "zimjs";
import type {
  CreateZimScene,
  ZimSceneController,
} from "../../types/zim/zimSceneTypes";
import type { GameEdition } from "../../types/game/gameTypes";

type ZimSceneHostProps<TState, TActions = undefined> = {
  edition?: GameEdition;
  state: TState;
  stateKey?: string;
  // make createZimScene have an optional arugment for edtion
  createScene: CreateZimScene<TState, TActions>;
  actions?: TActions;
  width?: number;
  height?: number;
  backgroundColor?: string;
};

export function ZimSceneHost<TState, TActions = undefined>({
  edition,
  state,
  stateKey,
  createScene,
  actions,
  width = 900,
  height = 900,
  backgroundColor = "#202733",
}: ZimSceneHostProps<TState, TActions>) {
  const reactId = useId();
  const hostId = `zim-scene-${reactId.replace(/:/g, "")}`;

  const frameRef = useRef<zim.Frame | null>(null);
  const controllerRef = useRef<ZimSceneController<TState> | null>(null);
  const latestStateRef = useRef(state);
  const lastAppliedStateKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    latestStateRef.current = state;

    if (stateKey && lastAppliedStateKeyRef.current === stateKey) {
      return;
    }

    lastAppliedStateKeyRef.current = stateKey;

    console.count("ZIM board update");

    controllerRef.current?.update(state);
  }, [state, stateKey]);

  useEffect(() => {
    const frame = new zim.Frame({
      scaling: hostId,
      width,
      height,
      color: backgroundColor,
      ready: () => {
        //if edtion is passed down as a prop, create scene with edition as addtional argument
        if (edition) {
          controllerRef.current = createScene(
            frame.stage,
            latestStateRef.current,
            actions,
            edition,
          );
          //otherwise, just create the scene without the edition
        } else {
          controllerRef.current = createScene(
            frame.stage,
            latestStateRef.current,
            actions,
          );
        }
      },
    });

    frameRef.current = frame;

    return () => {
      controllerRef.current?.dispose();
      frameRef.current?.dispose?.();

      controllerRef.current = null;
      frameRef.current = null;

      const holder = document.getElementById(hostId);

      if (holder) {
        holder.innerHTML = "";
      }
    };
  }, [actions, backgroundColor, createScene, height, hostId, width]);

  return (
    <div className="h-full w-full">
      <div
        id={hostId}
        className="h-full w-full [&>canvas]:!h-full [&>canvas]:!w-full"
      />
    </div>
  );
}
