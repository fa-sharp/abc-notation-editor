import type { AbcElem, VoiceItemNote } from "abcjs";

export interface AbcjsNote extends VoiceItemNote, AbcElem {
  // Properties from abcjs
  abselem: AbcElem["abselem"] & { beam?: object };
  decoration?: Array<"accent" | "staccato">;
  pitches?: Array<NonNullable<AbcElem["pitches"]>[number] & Pitch>;
  rest?: { type: "rest" | "spacer" };

  // Custom added properties
  isTriplet?: boolean;
}

interface Pitch {
  accidental?: "flat" | "sharp" | "natural" | "dblsharp" | "dblflat";
}
