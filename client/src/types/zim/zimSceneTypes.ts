import type * as zim from "zimjs";

export type ZimSceneController<TState> = {
  update: (state: TState) => void;
  dispose: () => void;
};

export type CreateZimScene<TState, TActions = undefined> = (
  stage: zim.Stage,
  initialState: TState,
  actions?: TActions,
) => ZimSceneController<TState>;
