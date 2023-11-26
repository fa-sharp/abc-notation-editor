import { Accidental, Rhythm } from "../types/constants";

export interface EditorCommandState {
  rhythm: Rhythm;
  rest: boolean;
  accidental: Accidental;
  dotted: boolean;
  beamed: boolean;
  triplet: boolean;
  showKeyboard: boolean;
  midiEnabled: boolean;
}

export type EditorCommandAction =
  | { type: "setBeamed"; beamed: boolean }
  | { type: "setDotted"; dotted: boolean }
  | { type: "setAccidental"; accidental: Accidental }
  | { type: "toggleAccidental"; accidental: Accidental }
  | {
      type: "setRhythm";
      rhythm: Rhythm;
    }
  | { type: "toggleRest" }
  | { type: "toggleTriplet" }
  | { type: "toggleShowKeyboard" }
  | { type: "toggleDotted" }
  | { type: "toggleBeamed" }
  | { type: "toggleMidi" };

export function editorCommandReducer(
  state: EditorCommandState,
  action: EditorCommandAction
) {
  const newState = { ...state };
  switch (action.type) {
    case "setRhythm":
      newState.rhythm = action.rhythm;
      break;
    case "setAccidental":
      newState.accidental = action.accidental;
      break;
    case "toggleAccidental":
      newState.accidental =
        newState.accidental === action.accidental
          ? Accidental.None
          : action.accidental;
      break;
    case "setBeamed":
      newState.beamed = action.beamed;
      break;
    case "toggleBeamed":
      newState.beamed = !newState.beamed;
      break;
    case "toggleRest":
      newState.rest = !newState.rest;
      break;
    case "toggleTriplet":
      newState.triplet = !newState.triplet;
      break;
    case "toggleShowKeyboard":
      newState.showKeyboard = !newState.showKeyboard;
      break;
    case "toggleDotted":
      newState.dotted = !newState.dotted;
      break;
    case "setDotted":
      newState.dotted = action.dotted;
      break;
    case "toggleMidi":
      newState.midiEnabled = !newState.midiEnabled;
      break;
  }
  return newState;
}
