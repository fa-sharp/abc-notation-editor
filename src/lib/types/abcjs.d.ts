import type { VoiceItemNote } from "abcjs";

export interface AbcjsNote extends VoiceItemNote {
  duration: number;
  decoration?: Array<"accent" | "staccato">;
  pitches?: Array<Pitch>;
  rest?: { type: "rest" | "spacer" };
}

interface Pitch {
  accidental?: "flat" | "sharp";
  pitch: number;
  name: string;
  highestVert?: number;
  verticalPos: number;
}
