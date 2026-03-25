export type ReplayState = {
  stepIndex: number;
  filterIndex: number | null;
  filterRange: string;
};

export const initialReplayState: ReplayState = {
  stepIndex: 0,
  filterIndex: null,
  filterRange: "",
};

type ReplayAction =
  | { type: "SET_STEP_INDEX"; payload: number }
  | { type: "SET_FILTER_INDEX"; payload: number | null }
  | { type: "SET_FILTER_RANGE"; payload: string }
  | { type: "RESET" };

export const replayReducer = (
  state: ReplayState,
  action: ReplayAction,
): ReplayState => {
  switch (action.type) {
    case "SET_STEP_INDEX":
      return { ...state, stepIndex: action.payload };
    case "SET_FILTER_INDEX":
      return { ...state, filterIndex: action.payload };
    case "SET_FILTER_RANGE":
      return { ...state, filterRange: action.payload };
    case "RESET":
      return initialReplayState;
    default:
      return state;
  }
};
