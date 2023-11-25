import type { EditorCommandAction } from "../state/EditorCommand";
import { Accidental, Rhythm } from "../types/constants";

const kbdKeyToCommandMap = new Map<string, EditorCommandAction | "backspace">([
  ["1", { type: "setRhythm", rhythm: Rhythm.Whole }],
  ["2", { type: "setRhythm", rhythm: Rhythm.Half }],
  ["3", { type: "setRhythm", rhythm: Rhythm.Quarter }],
  ["4", { type: "setRhythm", rhythm: Rhythm.Eighth }],
  ["5", { type: "setRhythm", rhythm: Rhythm.Sixteenth }],

  [".", { type: "toggleDotted" }],
  ["r", { type: "toggleRest" }],
  ["f", { type: "toggleAccidental", accidental: Accidental.Flat }],
  ["s", { type: "toggleAccidental", accidental: Accidental.Sharp }],
  ["t", { type: "toggleTriplet" }],
  ["b", { type: "toggleBeamed" }],

  ["Backspace", "backspace"],
]);

/** Setup keyboard shortcuts listener for the notation editor. Returns a cleanup function. */
export function setupKeyboardListeners(
  dispatchEditorCommand: (command: EditorCommandAction) => void,
  onBackspace: () => void
) {
  const listener = (e: KeyboardEvent) => {
    const command = kbdKeyToCommandMap.get(e.key);
    if (command === "backspace") onBackspace();
    else if (command !== undefined) dispatchEditorCommand(command);
  };

  window.addEventListener("keydown", listener);

  return () => window.removeEventListener("keydown", listener);
}
