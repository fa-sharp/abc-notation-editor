import { expect, test } from "vitest";
import { Accidental, Rhythm } from "~src/core/types/constants";
import {
  getAbcNoteFromMidiNum,
  getAbcNoteFromNoteName,
} from "~src/core/utils/notes";
import { getAbcRhythm } from "~src/core/utils/rhythm";

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
      output
    );
  });
});

test("Returns correct ABC rhythms for given rhythmic values", () => {
  expect(getAbcRhythm(Rhythm.Half)).toBe("4");
  expect(getAbcRhythm(Rhythm.Half, true)).toBe("6");
  expect(getAbcRhythm(Rhythm.Whole)).toBe("8");
  expect(getAbcRhythm(Rhythm.Eighth, true)).toBe("3/2");
});
