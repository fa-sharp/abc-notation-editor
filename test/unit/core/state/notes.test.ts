import { test, beforeEach, expect } from "vitest";
import { parseOnly } from "abcjs";
import EditorState from "~src/core/state/EditorState";
import { Accidental, Rhythm } from "~src/core/types/constants";

interface TestCtx {
  state: EditorState;
}

const initialAbcHeader = "X:1\nK:C clef=treble\nL:1/8\nM:4/4\n";
/** C Major, treble clef, 4/4 template with a few notes */
const initialAbc = initialAbcHeader + "C2 D2 F2 E2 | _G2";

beforeEach<TestCtx>((ctx) => {
  const state = new EditorState(initialAbc);
  const [tuneObject] = parseOnly(initialAbc);
  state.updateTuneData(tuneObject.lines);
  ctx.state = state;
});

test<TestCtx>("Can add quarter note to ABC score", ({ state }) => {
  state.addNote("E4", Rhythm.Quarter);
  expect(state.abc).toBe(initialAbc + " E2");
});

test<TestCtx>("Can add eighth note to ABC score", ({ state }) => {
  state.addNote("E4", Rhythm.Eighth);
  expect(state.abc).toBe(initialAbc + " E");
});

test<TestCtx>("Can add note with accidental to ABC score", ({ state }) => {
  state.addNote("E4", Rhythm.Eighth, { accidental: Accidental.Flat });
  expect(state.abc).toBe(initialAbc + " _E");
});

test<TestCtx>("Correctly adds barlines when adding notes", ({ state }) => {
  state.addNote("A4", Rhythm.Half);
  state.updateTuneData(parseOnly(state.abc)[0].lines);
  state.addNote("B3", Rhythm.Quarter);
  expect(state.abc.trim().at(-1)).toBe("|");
});

test<TestCtx>("Still adds barlines if measure is too long", ({ state }) => {
  state.addNote("A4", Rhythm.Half);
  state.updateTuneData(parseOnly(state.abc)[0].lines);
  state.addNote("B3", Rhythm.Half);
  expect(state.abc.trim().at(-1)).toBe("|");
});

test<TestCtx>("Can delete last note of ABC score", ({ state }) => {
  state.backspace();
  expect(state.abc.trim()).toBe(initialAbcHeader + "C2 D2 F2 E2");

  state.updateTuneData(parseOnly(state.abc)[0].lines);

  state.backspace();
  expect(state.abc.trim()).toBe(initialAbcHeader + "C2 D2 F2");
});
