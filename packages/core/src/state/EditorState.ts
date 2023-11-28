import type { TuneLine, VoiceItem } from "abcjs";
import { AbcjsNote } from "../types/abcjs";
import { Measure, parseMeasuresFromAbcjs } from "../parsing/measures";
import { Accidental, Rhythm, TimeSignature } from "../types/constants";
import { getAbcRhythm } from "../utils/rhythm";
import { getAbcNoteFromMidiNum, getAbcNoteFromNoteName } from "../utils/notes";

export default class EditorState {
  abc: string;
  tuneLines: VoiceItem[][] = [];
  measures: Measure[] = [];

  keySig = "C";
  timeSig: keyof typeof TimeSignature = "4/4";
  clef: "bass" | "treble" = "treble";

  constructor(template?: string) {
    this.abc =
      template ||
      `X:1\nK:${this.keySig} clef=${this.clef}\nL:1/8\nM:${this.timeSig}\n`;
  }

  updateTuneData(lines: TuneLine[]) {
    // Reduce the `lines` property from ABCJS into a simpler array, assuming only one staff and one voice for now
    this.tuneLines = lines.reduce<VoiceItem[][]>((arr, line) => {
      const items = line.staff?.[0]?.voices?.[0];
      if (items) arr.push(items);
      return arr;
    }, []);
    this.measures = parseMeasuresFromAbcjs(this.tuneLines, this.timeSig);
  }

  addNote(
    note: number | string,
    rhythm: Rhythm,
    options?: {
      accidental?: Accidental;
      beamed?: boolean;
      rest?: boolean;
      dotted?: boolean;
      triplet?: boolean;
    }
  ) {
    const abcNote =
      typeof note === "number"
        ? getAbcNoteFromMidiNum(note, options?.accidental)
        : getAbcNoteFromNoteName(note, options?.accidental);

    const currentMeasure = this.measures.at(-1);

    let abcToAdd = "";
    if (!options?.beamed) abcToAdd += " ";

    // Determine if this is the start of a triplet
    if (options?.triplet && currentMeasure) {
      const startTripletIdx = currentMeasure.notes.findLastIndex(
        (n) => !!n.startTriplet
      );
      const endTripletIdx = currentMeasure.notes.findLastIndex(
        (n) => !!n.endTriplet
      );
      if (startTripletIdx === -1 || startTripletIdx < endTripletIdx) {
        abcToAdd += "(3";
      }
    }

    // Add the actual note and rhythm
    abcToAdd += `${!options?.rest ? abcNote : "z"}${getAbcRhythm(
      rhythm,
      options?.dotted
    )}`;

    // Add barline if we're at the end of the measure
    if (
      currentMeasure &&
      currentMeasure.duration +
        (1 / rhythm) *
          (options?.dotted ? 3 / 2 : 1) *
          (options?.triplet ? 2 / 3 : 1) >=
        TimeSignature[this.timeSig].duration
    )
      abcToAdd += " |";

    // Add the note to the ABC score
    this.abc += abcToAdd;
  }

  backspace() {
    let measureIdx = -1;
    let lastItem: AbcjsNote | undefined;
    while (!(lastItem = this.measures.at(measureIdx)?.notes.at(-1))) {
      if (Math.abs(measureIdx) >= this.measures.length) return;
      measureIdx--;
    }
    this.abc = this.abc.slice(0, lastItem.startChar);
  }

  shouldBeamNextNote(nextRhythm: Rhythm) {
    const lastMeasure = this.measures.at(-1);
    const lastNote = lastMeasure?.notes.at(-1);
    if (!lastNote || !lastMeasure || lastNote.endTriplet) return false;

    const currentDuration = lastMeasure.notes.reduce(
      (acc, curr) => acc + curr.duration * (curr.isTriplet ? 2 / 3 : 1),
      0
    );
    const currentBeat = currentDuration * 4;

    return (
      ((nextRhythm === Rhythm.Eighth && ![0, 2].includes(currentBeat)) ||
        (nextRhythm === Rhythm.Sixteenth &&
          ![0, 1, 2, 3].includes(currentBeat))) &&
      [0.125, 0.0625]
        .concat([0.125, 0.0625].map((v) => v * 1.5))
        .includes(lastNote.duration)
    );
  }
}