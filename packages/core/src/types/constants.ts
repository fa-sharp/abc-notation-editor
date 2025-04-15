export const Accidental = Object.freeze({
  None: "none",
  Sharp: "sharp",
  Flat: "flat",
  Natural: "natural",
  DoubleSharp: "dblsharp",
  DoubleFlat: "dblflat",
});

export type Accidental = (typeof Accidental)[keyof typeof Accidental];

export const AccidentalToAlt = Object.freeze({
  [Accidental.DoubleFlat]: -2,
  [Accidental.Flat]: -1,
  [Accidental.Natural]: 0,
  [Accidental.Sharp]: 1,
  [Accidental.DoubleSharp]: 2,
});

export const Rhythm = Object.freeze({
  Whole: 1,
  Half: 2,
  Quarter: 4,
  Eighth: 8,
  Sixteenth: 16,
});

export type Rhythm = (typeof Rhythm)[keyof typeof Rhythm];

export const Clef = Object.freeze({
  Treble: "treble",
  Bass: "bass",
});

export type Clef = (typeof Clef)[keyof typeof Clef];

export const Decoration = Object.freeze({
  None: "",
  Staccato: "staccato",
  Trill: "trill",
  Accent: "accent",
  Tenuto: "tenuto",
  Wedge: "wedge",
});

export type Decoration = (typeof Decoration)[keyof typeof Decoration];
