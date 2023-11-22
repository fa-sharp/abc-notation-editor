import { VoiceItem } from "abcjs";
import { AbcNotation, Midi, Note } from "tonal";
import { AbcjsNote } from "../types/abcjs";

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

  #updateMeasures() {
    const measures: Measure[] = [];
    this.tuneLines.forEach((line, lineIdx) => {
      const fullMeasureDuration = TimeSignature[this.timeSig].duration;

      let currentMeasure: Measure = {
        line: lineIdx,
        lineStartIdx: 0,
        lineEndIdx: 0,
        notes: [],
        duration: 0,
      };
      measures.push(currentMeasure);

      for (let i = 0; i < line.length; i++) {
        const item = line[i]!;
        currentMeasure.lineEndIdx++;
        if (item.el_type === "note") {
          const note = item as AbcjsNote;
          if (note.rest?.type === "spacer") return;

          currentMeasure.notes.push(note);
          currentMeasure.duration += note.duration;
          if (currentMeasure.duration >= fullMeasureDuration) {
            currentMeasure = {
              notes: [],
              duration: 0,
              line: lineIdx,
              lineStartIdx: currentMeasure.lineEndIdx,
              lineEndIdx: currentMeasure.lineEndIdx,
            };
            measures.push(currentMeasure);
          }
        }
        // If this is the last item on the line, and there are more lines, remove extra measure
        if (
          i === line.length - 1 &&
          this.tuneLines[lineIdx + 1] &&
          measures.at(-1)?.notes.length === 0
        ) {
          measures.splice(measures.length - 1, 1);
        }
      }
    });
    this.measures = measures;
  }

  updateTuneData(lines: VoiceItem[][]) {
    this.tuneLines = lines;
    this.#updateMeasures();
  }

  addNote(
    note: number | string,
    rhythm: Rhythm,
    options?: {
      accidental?: "none" | "sharp" | "flat";
      beamed?: boolean;
      rest?: boolean;
      dotted?: boolean;
    }
  ) {
    const abcNote =
      typeof note === "number"
        ? AbcNotation.scientificToAbcNotation(
            Midi.midiToNoteName(note, {
              sharps: options?.accidental === "sharp",
            })
          )
        : AbcNotation.scientificToAbcNotation(
            getNote(note, options?.accidental)
          );
    this.abc += `${options?.beamed ? "" : " "}${
      !options?.rest ? abcNote : "z"
    }${getAbcRhythm(rhythm, options?.dotted)}`;

    const currentMeasure = this.measures.at(-1);
    if (
      currentMeasure &&
      currentMeasure.duration + (1 / rhythm) * (options?.dotted ? 3 / 2 : 1) >=
        TimeSignature[this.timeSig].duration
    )
      this.abc += " |";
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
}

interface Measure {
  notes: AbcjsNote[];
  line: number;
  lineStartIdx: number;
  lineEndIdx: number;
  duration: number;
}

const TimeSignature = Object.freeze({
  "4/4": {
    duration: 1,
  },
});

enum Rhythm {
  Whole = 1,
  Half = 2,
  Quarter = 4,
  Eighth = 8,
  Sixteenth = 16,
}

function getNote(
  noteName: string,
  accidental: "none" | "sharp" | "flat" = "none"
) {
  if (accidental === "none") return noteName;
  const note = Note.get(noteName);
  const destName = note.letter + (accidental === "sharp" ? "#" : "b");
  return Note.enharmonic(
    Note.transpose(noteName, accidental === "sharp" ? "m2" : "m-2"),
    destName
  );
}

function getAbcRhythm(currentRhythm: Rhythm, dotted = false) {
  return !dotted
    ? currentRhythm === Rhythm.Half
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
