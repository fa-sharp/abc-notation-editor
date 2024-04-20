import type { VoiceItemNote } from "abcjs";

export interface AbcjsNote extends VoiceItemNote {
  // Properties from abcjs
  duration: number;
  decoration?: Array<"accent" | "staccato">;
  pitches?: Array<Pitch>;
  rest?: { type: "rest" | "spacer" };
  startTriplet?: number;
  endTriplet?: boolean;
  chord?: Array<{ name: string }>;

  // Custom added properties
  isTriplet?: boolean;
}

interface Pitch {
  accidental?: "flat" | "sharp";
  pitch: number;
  name: string;
  highestVert?: number;
  verticalPos: number;
}
