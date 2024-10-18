import type { EditorCommandAction } from "../state/EditorCommand";
import { Accidental, Rhythm } from "../types/constants";

const kbdKeyToCommandMap = new Map<
  string,
  | EditorCommandAction
  | "backspace"
  | "newLine"
  | "noteUp"
  | "noteDown"
  | "nextNote"
  | "prevNote"
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
  ["ArrowLeft", "prevNote"],
  ["ArrowRight", "nextNote"],

  ["Backspace", "backspace"],
  ["Enter", "newLine"],
]);

/** Setup keyboard shortcuts listener for the notation editor. Returns a cleanup function. */
export function setupKeyboardListener(
  dispatchEditorCommand: (command: EditorCommandAction) => void,
  onMoveNote: (step: number) => void,
  onNextNote: () => void,
  onPrevNote: () => void,
  onBackspace: () => void,
  onNewLine: () => void,
) {
  const listener = (e: KeyboardEvent) => {
    const command = kbdKeyToCommandMap.get(e.key);
    if (command === "noteUp") {
      e.preventDefault();
      onMoveNote(1);
    } else if (command === "noteDown") {
      e.preventDefault();
      onMoveNote(-1);
    } else if (command === "nextNote") {
      e.preventDefault();
      onNextNote();
    } else if (command === "prevNote") {
      e.preventDefault();
      onPrevNote();
    } else if (command === "backspace") onBackspace();
    else if (command === "newLine") onNewLine();
    else if (command !== undefined) dispatchEditorCommand(command);
  };

  window.addEventListener("keydown", listener);

  return () => window.removeEventListener("keydown", listener);
}
