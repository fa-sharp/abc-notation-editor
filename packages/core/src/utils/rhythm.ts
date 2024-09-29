import { Rhythm } from "../types/constants";

/** Get the ABC rhythm notation from the given rhythmic value */
export function getAbcRhythm(currentRhythm: Rhythm, dotted = false) {
  return !dotted
    ? currentRhythm === Rhythm.Whole
      ? "8"
      : currentRhythm === Rhythm.Half
        ? "4"
        : currentRhythm === Rhythm.Quarter
          ? "2"
          : currentRhythm === Rhythm.Eighth
            ? ""
            : currentRhythm === Rhythm.Sixteenth
              ? "/2"
              : ""
    : currentRhythm === Rhythm.Half
      ? "6"
      : currentRhythm === Rhythm.Quarter
        ? "3"
        : currentRhythm === Rhythm.Eighth
          ? "3/2"
          : currentRhythm === Rhythm.Sixteenth
            ? "3/4"
            : "";
}

export function getRhythmFromAbcDuration(duration: number) {
  return duration === 0.5
    ? Rhythm.Half
    : duration === 0.25
      ? Rhythm.Quarter
      : duration === 0.125
        ? Rhythm.Eighth
        : undefined;
}
