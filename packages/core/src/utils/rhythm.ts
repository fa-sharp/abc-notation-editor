import { Rhythm } from "../types/constants";

const rhythmToAbcMap = {
  [Rhythm.Whole]: "8",
  [Rhythm.Half]: "4",
  [Rhythm.Quarter]: "2",
  [Rhythm.Eighth]: "",
  [Rhythm.Sixteenth]: "/2",
};
const dottedRhythmToAbcMap = {
  [Rhythm.Whole]: "12",
  [Rhythm.Half]: "6",
  [Rhythm.Quarter]: "3",
  [Rhythm.Eighth]: "3/2",
  [Rhythm.Sixteenth]: "3/4",
};

/** Get the ABC rhythm notation from the given rhythmic value */
export function getAbcRhythm(currentRhythm: Rhythm, dotted = false) {
  return !dotted
    ? rhythmToAbcMap[currentRhythm] || ""
    : dottedRhythmToAbcMap[currentRhythm] || "";
}

const durationToRhythmMap = new Map<
  number,
  { rhythm: Rhythm; dotted?: boolean }
>([
  [0.0625, { rhythm: Rhythm.Sixteenth }],
  [0.09375, { rhythm: Rhythm.Sixteenth, dotted: true }],
  [0.125, { rhythm: Rhythm.Eighth }],
  [0.1875, { rhythm: Rhythm.Eighth, dotted: true }],
  [0.125, { rhythm: Rhythm.Eighth }],
  [0.1875, { rhythm: Rhythm.Eighth, dotted: true }],
  [0.25, { rhythm: Rhythm.Quarter }],
  [0.375, { rhythm: Rhythm.Quarter, dotted: true }],
  [0.5, { rhythm: Rhythm.Half }],
  [0.75, { rhythm: Rhythm.Half, dotted: true }],
  [1, { rhythm: Rhythm.Whole }],
  [1.5, { rhythm: Rhythm.Whole, dotted: true }],
]);

/** Get the rhythm from the duration of the note. */
export function getRhythmFromAbcDuration(duration: number) {
  return durationToRhythmMap.get(duration)?.rhythm;
}
