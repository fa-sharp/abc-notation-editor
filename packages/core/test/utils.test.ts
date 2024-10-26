import { parseOnly } from "abcjs";
import { Key } from "tonal";
import { expect, test } from "vitest";
import { EditorState } from "~src";
import { Accidental, Rhythm } from "~src/types/constants";
import {
  getAbcNoteFromMidiNum,
  getAbcNoteFromNoteName,
} from "~src/utils/notes";
import { getAbcRhythm } from "~src/utils/rhythm";

test("Returns correct ABC notes from MIDI pitches", () => {
  const samples = [
    [{ midiNum: 60, accidental: undefined }, "C"],
    [{ midiNum: 60, accidental: Accidental.Sharp }, "C"],
    [{ midiNum: 61, accidental: Accidental.Sharp }, "^C"],
    [{ midiNum: 61, accidental: Accidental.Flat }, "_D"],
    [{ midiNum: 78, accidental: Accidental.Flat }, "_g"],
    [{ midiNum: 78, accidental: Accidental.Sharp }, "^f"],
  ] as const;
  samples.forEach(([input, output]) => {
    expect(getAbcNoteFromMidiNum(input.midiNum, input.accidental)).toBe(output);
  });
});

test("Returns correct ABC notes from MIDI pitches in a given key", () => {
  const samples = [
    [{ midiNum: 58, accidental: Accidental.None }, "B,"],
    [{ midiNum: 60, accidental: undefined }, "C"],
    [{ midiNum: 63, accidental: undefined }, "E"],
    [{ midiNum: 78, accidental: Accidental.Flat }, "_g"],
    [{ midiNum: 82, accidental: Accidental.None }, "b"],
  ] as const;
  samples.forEach(([input, output]) => {
    expect(
      getAbcNoteFromMidiNum(
        input.midiNum,
        input.accidental,
        undefined,
        Key.majorKey("Bb"),
      ),
    ).toBe(output);
  });
});

test("Returns correct ABC notes from MIDI pitches in a given key with previous accidentals", () => {
  const initialAbc = "X:1\nK:Bm clef=treble\nL:1/8\nM:4/4\n B=CD^EF";
  const state = new EditorState(initialAbc);
  const [tuneObject] = parseOnly(initialAbc);
  state.updateTuneData(tuneObject);

  expect(
    getAbcNoteFromMidiNum(
      60,
      Accidental.None,
      state.measures.at(-1),
      state.keySig,
    ),
  ).toBe("C");
  expect(
    getAbcNoteFromMidiNum(
      64,
      Accidental.None,
      state.measures.at(-1),
      state.keySig,
    ),
  ).toBe("=E");
});

test("Returns correct ABC notes from note names", () => {
  const samples = [
    [{ noteName: "C4", accidental: undefined }, "C"],
    [{ noteName: "D4", accidental: Accidental.Sharp }, "^D"],
    [{ noteName: "C4", accidental: Accidental.Flat }, "_C"],
    [{ noteName: "G5", accidental: Accidental.Flat }, "_g"],
    [{ noteName: "F6", accidental: Accidental.Sharp }, "^f'"],
  ] as const;
  samples.forEach(([input, output]) => {
    expect(getAbcNoteFromNoteName(input.noteName, input.accidental)).toBe(
      output,
    );
  });
});

test("Returns correct ABC rhythms for given rhythmic values", () => {
  expect(getAbcRhythm(Rhythm.Half)).toBe("4");
  expect(getAbcRhythm(Rhythm.Half, true)).toBe("6");
  expect(getAbcRhythm(Rhythm.Whole)).toBe("8");
  expect(getAbcRhythm(Rhythm.Eighth, true)).toBe("3/2");
});
