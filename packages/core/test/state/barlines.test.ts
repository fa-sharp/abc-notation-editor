import { test, beforeEach, expect } from "vitest";
import { parseOnly } from "abcjs";
import EditorState from "~src/state/EditorState";
import { Rhythm } from "~src/types/constants";

interface TestCtx {
  state: EditorState;
}

const initialAbcHeader = "X:1\nK:C clef=treble\nL:1/8\nM:4/4\n";
/** C Major, treble clef, 4/4 template with a few notes */
const initialAbc = initialAbcHeader + "C4 G4 | g2";

beforeEach<TestCtx>((ctx) => {
  const state = new EditorState(initialAbc);
  const [tuneObject] = parseOnly(initialAbc);
  state.updateTuneData(tuneObject);
  ctx.state = state;
});

test<TestCtx>("Correctly adds barlines when adding notes", ({ state }) => {
  state.addNote("A4", Rhythm.Half);
  state.updateTuneData(parseOnly(state.abc)[0]);
  state.addNote("B3", Rhythm.Quarter);
  expect(state.abc.trim().at(-1)).toBe("|");
});

test<TestCtx>("Still adds barlines if measure is too long", ({ state }) => {
  state.addNote("A4", Rhythm.Half);
  state.updateTuneData(parseOnly(state.abc)[0]);
  state.addNote("B3", Rhythm.Half);
  expect(state.abc.trim().at(-1)).toBe("|");
});

test<TestCtx>("Correctly adds barlines when adding triplets", ({ state }) => {
  state.addNote("A4", Rhythm.Quarter, { triplet: true });
  state.updateTuneData(parseOnly(state.abc)[0]);
  state.addNote("A4", Rhythm.Quarter, { triplet: true });
  state.updateTuneData(parseOnly(state.abc)[0]);
  state.addNote("A4", Rhythm.Quarter, { triplet: true });
  state.updateTuneData(parseOnly(state.abc)[0]);
  state.addNote("B3", Rhythm.Quarter);
  state.updateTuneData(parseOnly(state.abc)[0]);
  expect(state.abc.trim().at(-1)).toBe("|");
});
