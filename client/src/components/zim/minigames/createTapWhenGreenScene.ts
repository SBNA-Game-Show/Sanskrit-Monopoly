import * as zim from "zimjs";
import type { ZimSceneController } from "../../../types/zim/zimSceneTypes";

export type TapWhenGreenState = {
  status: "waiting" | "green" | "success" | "failed";
};

export type TapWhenGreenActions = {
  submitResult: (success: boolean) => void;
};

export function createTapWhenGreenScene(
  stage: zim.Stage,
  initialState: TapWhenGreenState,
  actions?: TapWhenGreenActions,
): ZimSceneController<TapWhenGreenState> {
  function draw(state: TapWhenGreenState) {
    stage.removeAllChildren();

    const bgColor = state.status === "green" ? "#22c55e" : "#111827";

    const background = new zim.Rectangle(500, 320, bgColor);
    background.center(stage);

    const message =
      state.status === "green"
        ? "TAP NOW"
        : state.status === "success"
          ? "SUCCESS"
          : state.status === "failed"
            ? "TOO EARLY"
            : "WAIT...";

    const label = new zim.Label({
      text: message,
      size: 42,
      color: "#ffffff",
      align: "center",
    });

    label.center(stage);

    background.on("click", () => {
      actions?.submitResult(state.status === "green");
    });

    stage.update();
  }

  draw(initialState);

  return {
    update(state) {
      draw(state);
    },

    dispose() {
      stage.removeAllChildren();
      stage.update();
    },
  };
}
