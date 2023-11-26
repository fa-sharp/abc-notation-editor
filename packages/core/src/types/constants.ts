export enum Accidental {
  None = "none",
  Sharp = "sharp",
  Flat = "flat",
}

export enum Rhythm {
  Whole = 1,
  Half = 2,
  Quarter = 4,
  Eighth = 8,
  Sixteenth = 16,
}

export const TimeSignature = Object.freeze({
  "4/4": {
    duration: 1,
  },
});
