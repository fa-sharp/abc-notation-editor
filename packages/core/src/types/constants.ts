export enum Accidental {
  None = "none",
  Sharp = "sharp",
  Flat = "flat",
  Natural = "natural",
  DoubleSharp = "dblsharp",
  DoubleFlat = "dblflat",
}

export const AccidentalToAlt = {
  [Accidental.DoubleFlat]: -2,
  [Accidental.Flat]: -1,
  [Accidental.Natural]: 0,
  [Accidental.Sharp]: 1,
  [Accidental.DoubleSharp]: 2,
};

export enum Rhythm {
  Whole = 1,
  Half = 2,
  Quarter = 4,
  Eighth = 8,
  Sixteenth = 16,
}

export enum Clef {
  Treble = "treble",
  Bass = "bass",
}
