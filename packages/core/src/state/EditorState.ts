import { parseOnly } from "abcjs";
import type { TuneLine, VoiceItem } from "abcjs";
import type { AbcjsNote } from "../types/abcjs";
import { type Measure, parseMeasuresFromAbcjs } from "../parsing/measures";
import { Accidental, Clef, Rhythm } from "../types/constants";
import { getAbcRhythm } from "../utils/rhythm";
import { getAbcNoteFromMidiNum, getAbcNoteFromNoteName } from "../utils/notes";
import {
  type KeySignatureType,
  type TimeSignatureType,
  parseAbcHeaders,
} from "~src/parsing/headers";
import { Key, TimeSignature } from "tonal";
import { getMeasureDurationFromTimeSig } from "~src/utils/timeSig";
import {
  type ChordTemplateMeasure,
  parseChordTemplate,
} from "~src/parsing/chordTemplate";
import { equalUpToN } from "~src/utils/numbers";

export default class EditorState {
  abc: string;
  tuneLines: VoiceItem[][] = [];
  measures: Measure[] = [];

  keySig: KeySignatureType;
  timeSig: TimeSignatureType;
  clef: Clef;

  chordTemplate?: ChordTemplateMeasure[];
  ending?: {
    lastMeasure: number;
    lastBarline?: "thin-thin" | "thin-thick";
  };

  constructor(
    initialAbc?: string,
    options?: { chordTemplate?: string; ending?: EditorState["ending"] }
  ) {
    if (initialAbc) {
      this.abc = initialAbc;
      const { clef, keySig, timeSig } = parseAbcHeaders(initialAbc);
      this.clef = clef;
      this.keySig = keySig;
      this.timeSig = timeSig;
      if (options?.chordTemplate) {
        this.chordTemplate = parseChordTemplate(
          options.chordTemplate,
          this.timeSig
        );
        this.updateTuneData(parseOnly(initialAbc + "y")[0].lines);
        const lastMeasure = this.measures.at(-1);
        const chordToAdd = this.chordTemplate
          ?.at(this.measures.length - 1)
          ?.find((chord) =>
            equalUpToN(chord.fractionalBeat, lastMeasure?.duration ?? 0)
          );
        if (chordToAdd) this.abc += ` "^${chordToAdd.name}"`;
      }
    } else {
      this.clef = Clef.Treble;
      this.keySig = Key.majorKey("C");
      this.timeSig = TimeSignature.get("4/4");
      this.abc = `%%stretchlast false\nX:1\nL:1/8\nM:4/4\nK:C clef=treble\n`;
      if (options?.chordTemplate) {
        this.chordTemplate = parseChordTemplate(
          options.chordTemplate,
          this.timeSig
        );
        const chordToAdd = this.chordTemplate?.[0]?.find((chord) =>
          equalUpToN(chord.fractionalBeat, 0)
        );
        if (chordToAdd) this.abc += `"^${chordToAdd.name}"`;
      }
    }
    this.ending = options?.ending;
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
      tied?: boolean;
    }
  ) {
    if (
      this.ending?.lastMeasure &&
      this.measures.length > this.ending.lastMeasure
    )
      return;

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
    if (options?.tied) abcToAdd += "-";

    // Add barline if we're at the end of the measure
    if (currentMeasure) {
      const measureTotalDuration = getMeasureDurationFromTimeSig(this.timeSig);
      const durationWithAddedNote =
        currentMeasure.duration +
        (1 / rhythm) *
          (options?.dotted ? 3 / 2 : 1) *
          (options?.triplet ? 2 / 3 : 1);

      // Are we at end of measure?
      if (durationWithAddedNote >= measureTotalDuration - 0.001) {
        if (
          this.ending?.lastMeasure &&
          this.measures.length === this.ending.lastMeasure
        )
          abcToAdd += this.ending.lastBarline === "thin-thick" ? " |]" : " ||";
        else {
          abcToAdd += " |";
          const chordToAdd = this.chordTemplate
            ?.at(this.measures.length)
            ?.find((chord) => equalUpToN(chord.fractionalBeat, 0));
          if (chordToAdd) abcToAdd += ` "^${chordToAdd.name}"`;
        }
      } else {
        const chordToAdd = this.chordTemplate
          ?.at(this.measures.length - 1)
          ?.find((chord) =>
            equalUpToN(chord.fractionalBeat, durationWithAddedNote)
          );
        if (chordToAdd) abcToAdd += ` "^${chordToAdd.name}"`;
      }
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

    if (this.chordTemplate) {
      const currentMeasure = this.measures.at(measureIdx);
      if (!currentMeasure) return;
      const durationWithRemovedNote =
        currentMeasure.duration -
        lastItem.duration * (lastItem.isTriplet ? 2 / 3 : 1);
      const chordToAdd = this.chordTemplate
        ?.at(this.measures.length + measureIdx)
        ?.find((chord) =>
          equalUpToN(chord.fractionalBeat, durationWithRemovedNote)
        );
      if (chordToAdd) this.abc += ` "^${chordToAdd.name}"`;
    }
  }

  newLine() {
    if (this.abc.at(-1) === "\n") return;

    const lastBarlineIndex = this.abc.lastIndexOf("|");
    if (lastBarlineIndex) this.abc = this.abc.slice(0, lastBarlineIndex + 1);
    this.abc = this.abc + "\n";

    if (this.chordTemplate) {
      const chordToAdd = this.chordTemplate
        ?.at(this.measures.length - 1)
        ?.find((chord) => equalUpToN(chord.fractionalBeat, 0));
      if (chordToAdd) this.abc += `"^${chordToAdd.name}"`;
    }
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

  get currentDuration() {
    const lastMeasure = this.measures.at(-1);
    if (!lastMeasure) return -1;

    return lastMeasure.notes.reduce(
      (acc, curr) => acc + curr.duration * (curr.isTriplet ? 2 / 3 : 1),
      0
    );
  }

  get isEndOfTriplet() {
    let measureIdx = -1;
    let lastNote: AbcjsNote | undefined;
    while (!(lastNote = this.measures.at(measureIdx)?.notes.at(-1))) {
      if (Math.abs(measureIdx) >= this.measures.length) return;
      measureIdx--;
    }
    return !!lastNote && !!lastNote.endTriplet;
  }
}
