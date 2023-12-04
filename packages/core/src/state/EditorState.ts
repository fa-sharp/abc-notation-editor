import type { TuneLine, VoiceItem } from "abcjs";
import { AbcjsNote } from "../types/abcjs";
import { Measure, parseMeasuresFromAbcjs } from "../parsing/measures";
import { Accidental, Clef, Rhythm } from "../types/constants";
import { getAbcRhythm } from "../utils/rhythm";
import { getAbcNoteFromMidiNum, getAbcNoteFromNoteName } from "../utils/notes";
import {
  KeySignatureType,
  TimeSignatureType,
  parseAbcHeaders,
} from "~src/parsing/headers";
import { Key, TimeSignature } from "tonal";
import { getMeasureDurationFromTimeSig } from "~src/utils/timeSig";

export default class EditorState {
  abc: string;
  tuneLines: VoiceItem[][] = [];
  measures: Measure[] = [];

  keySig: KeySignatureType;
  timeSig: TimeSignatureType;
  clef: Clef;

  constructor(initialAbc?: string) {
    if (initialAbc) {
      this.abc = initialAbc;
      const { clef, keySig, timeSig } = parseAbcHeaders(initialAbc);
      this.clef = clef;
      this.keySig = keySig;
      this.timeSig = timeSig;
    } else {
      this.clef = Clef.Treble;
      this.keySig = Key.majorKey("C");
      this.timeSig = TimeSignature.get("4/4");
      this.abc = `X:1\nL:1/8\nM:4/4\nK:C clef=treble\n`;
    }
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
    if (currentMeasure) {
      const measureTotalDuration = getMeasureDurationFromTimeSig(this.timeSig);
      const durationWithAddedNote =
        currentMeasure.duration +
        (1 / rhythm) *
          (options?.dotted ? 3 / 2 : 1) *
          (options?.triplet ? 2 / 3 : 1);
      if (durationWithAddedNote >= measureTotalDuration - 0.001)
        abcToAdd += " |";
    }

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

  get isEndOfTriplet() {
    const lastMeasure = this.measures.at(-1);
    const lastNote = lastMeasure?.notes.at(-1);
    return !!lastNote && !!lastNote.endTriplet;
  }
}
