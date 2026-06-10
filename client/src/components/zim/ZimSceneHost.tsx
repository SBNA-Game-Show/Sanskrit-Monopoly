import { useEffect, useId, useRef } from "react";
import * as zim from "zimjs";
import type {
  CreateZimScene,
  ZimSceneController,
} from "../../types/zim/zimSceneTypes";

type ZimSceneHostProps<TState, TActions = undefined> = {
  state: TState;
  createScene: CreateZimScene<TState, TActions>;
  actions?: TActions;
  width?: number;
  height?: number;
  backgroundColor?: string;
};

export function ZimSceneHost<TState, TActions = undefined>({
  state,
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

  useEffect(() => {
    latestStateRef.current = state;
    controllerRef.current?.update(state);
  }, [state]);

  useEffect(() => {
    const frame = new zim.Frame({
      scaling: hostId,
      width,
      height,
      color: backgroundColor,
      ready: () => {
        controllerRef.current = createScene(
          frame.stage,
          latestStateRef.current,
          actions,
        );
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
