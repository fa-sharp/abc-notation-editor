import type { EditorCommandAction } from "../state/EditorCommand";
import { Accidental, Rhythm } from "../types/constants";

const kbdKeyToCommandMap = new Map<
  string,
  EditorCommandAction | "backspace" | "newLine" | "noteUp" | "noteDown"
>([
  ["1", { type: "setRhythm", rhythm: Rhythm.Whole }],
  ["2", { type: "setRhythm", rhythm: Rhythm.Half }],
  ["3", { type: "setRhythm", rhythm: Rhythm.Quarter }],
  ["4", { type: "setRhythm", rhythm: Rhythm.Eighth }],
  ["5", { type: "setRhythm", rhythm: Rhythm.Sixteenth }],

  ["d", { type: "toggleDotted" }],
  ["r", { type: "toggleRest" }],
  ["f", { type: "toggleAccidental", accidental: Accidental.Flat }],
  ["s", { type: "toggleAccidental", accidental: Accidental.Sharp }],
  ["n", { type: "toggleAccidental", accidental: Accidental.Natural }],
  ["t", { type: "toggleTriplet" }],
  ["b", { type: "toggleBeamed" }],
  ["e", { type: "toggleTied" }],

  ["ArrowUp", "noteUp"],
  ["ArrowDown", "noteDown"],

  ["Backspace", "backspace"],
  ["Enter", "newLine"],
]);

/** Setup keyboard shortcuts listener for the notation editor. Returns a cleanup function. */
export function setupKeyboardListener(
  dispatchEditorCommand: (command: EditorCommandAction) => void,
  onNoteUp: () => void,
  onNoteDown: () => void,
  onBackspace: () => void,
  onNewLine: () => void,
) {
  const listener = (e: KeyboardEvent) => {
    const command = kbdKeyToCommandMap.get(e.key);
    if (command === "noteUp") {
      e.preventDefault();
      onNoteUp();
    } else if (command === "noteDown") {
      e.preventDefault();
      onNoteDown();
    } else if (command === "backspace") onBackspace();
    else if (command === "newLine") onNewLine();
    else if (command !== undefined) dispatchEditorCommand(command);
  };

  window.addEventListener("keydown", listener);

  return () => window.removeEventListener("keydown", listener);
}
