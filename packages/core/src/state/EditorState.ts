import type {
  AbcElem,
  ClickListenerAnalysis,
  ClickListenerDrag,
  TuneObject,
  VoiceItem,
} from "abcjs";
import { parseOnly } from "abcjs";
import { AbcNotation, Key, TimeSignature } from "tonal";
import {
  type ChordTemplateMeasure,
  parseChordTemplate,
} from "~src/parsing/chordTemplate";
import {
  type KeySignatureType,
  type TimeSignatureType,
  parseAbcHeaders,
} from "~src/parsing/headers";
import { type Measure, parseMeasuresFromAbcjs } from "~src/parsing/measures";
import type { AbcjsNote } from "~src/types/abcjs";
import { Accidental, Clef, Rhythm } from "~src/types/constants";
import { getBeamingOfAbcjsNote } from "~src/utils/beaming";
import { History } from "~src/utils/history";
import {
  getAbcNoteFromMidiNum,
  getAbcNoteFromNoteName,
  getMidiNumForAddedNote,
  getMidiNumForEditedNote,
} from "~src/utils/notes";
import { equalUpToN } from "~src/utils/numbers";
import { getAbcRhythm, getRhythmFromAbcDuration } from "~src/utils/rhythm";
import { getMeasureDurationFromTimeSig } from "~src/utils/timeSig";

export default class EditorState {
  abc: string;
  history = new History();
  tuneObject: TuneObject | null = null;
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

  selected: {
    measureIdx: number;
    noteIdx: number;
    data?: {
      note?: string;
      rhythm?: Rhythm;
      accidental?: Accidental;
      beamed?: boolean;
      rest?: boolean;
      dotted?: boolean;
      triplet?: boolean;
      tied?: boolean;
    };
  } | null = null;
  onSelected?: (selected: EditorState["selected"]) => void;
  onNote?: (midiNum: number) => void;

  constructor(
    initialAbc?: string,
    options?: {
      chordTemplate?: string;
      ending?: EditorState["ending"];
      onSelected?: (selected: EditorState["selected"]) => void;
      onNote?: (midiNum: number) => void;
    },
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
          this.timeSig,
        );
        this.updateTuneData(parseOnly(initialAbc + "y")[0]);
        const lastMeasure = this.measures.at(-1);
        const chordToAdd = this.chordTemplate
          ?.at(this.measures.length - 1)
          ?.find((chord) =>
            equalUpToN(chord.fractionalBeat, lastMeasure?.duration ?? 0),
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
          this.timeSig,
        );
        const chordToAdd = this.chordTemplate?.[0]?.find((chord) =>
          equalUpToN(chord.fractionalBeat, 0),
        );
        if (chordToAdd) this.abc += `"^${chordToAdd.name}"`;
      }
    }
    this.ending = options?.ending;
    this.onSelected = options?.onSelected;
    this.onNote = options?.onNote;
  }

  updateTuneData(tuneObject: TuneObject) {
    this.tuneObject = tuneObject;
    // Reduce the `lines` property from ABCJS into a simpler array, assuming only one staff and one voice for now
    this.tuneLines = tuneObject.lines.reduce<VoiceItem[][]>((arr, line) => {
      const items = line.staff?.[0]?.voices?.[0];
      if (items) arr.push(items);
      return arr;
    }, []);
    this.measures = parseMeasuresFromAbcjs(this.tuneLines, this.timeSig);
    // Update selected note and re-highlight if needed
    if (this.selected) {
      const existingNote = this.measures
        .at(this.selected.measureIdx)
        ?.notes.at(this.selected.noteIdx);
      if (!existingNote) this.selected = null;
      else {
        const rhythmData = getRhythmFromAbcDuration(existingNote.duration);
        this.selected = {
          measureIdx: this.selected.measureIdx,
          noteIdx: this.selected.noteIdx,
          data: {
            note: existingNote.pitches?.[0]?.name,
            accidental: existingNote.pitches?.[0]?.accidental as Accidental,
            tied: !!existingNote.pitches?.[0]?.startTie,
            rhythm: rhythmData?.rhythm,
            dotted: rhythmData?.dotted,
            beamed: getBeamingOfAbcjsNote(existingNote),
            rest: !!existingNote.rest,
          },
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.tuneObject?.engraver?.rangeHighlight(
          existingNote.startChar,
          existingNote.endChar,
        );
      }
      this.onSelected?.(this.selected);
    }
  }

  addNote(
    midiNumOrNoteName: number | string,
    rhythm: Rhythm,
    options?: {
      accidental?: Accidental;
      beamed?: boolean;
      rest?: boolean;
      dotted?: boolean;
      triplet?: boolean;
      tied?: boolean;
    },
  ) {
    if (
      this.ending?.lastMeasure &&
      this.measures.length > this.ending.lastMeasure
    )
      return;

    const currentMeasure = this.measures.at(-1);
    if (!currentMeasure) return;

    const abcNote =
      typeof midiNumOrNoteName === "number"
        ? getAbcNoteFromMidiNum(
            midiNumOrNoteName,
            options?.accidental,
            currentMeasure,
            this.keySig,
          )
        : getAbcNoteFromNoteName(midiNumOrNoteName, options?.accidental);

    let abcToAdd = "";
    if (!options?.beamed) abcToAdd += " ";

    // Determine if this is the start of a triplet
    if (options?.triplet) {
      const startTripletIdx = currentMeasure.notes.findLastIndex(
        (n) => !!n.startTriplet,
      );
      const endTripletIdx = currentMeasure.notes.findLastIndex(
        (n) => !!n.endTriplet,
      );
      if (startTripletIdx === -1 || startTripletIdx < endTripletIdx) {
        abcToAdd += "(3";
      }
    }

    // Add the actual note and rhythm
    abcToAdd += `${!options?.rest ? abcNote : "z"}${getAbcRhythm(
      rhythm,
      options?.dotted,
    )}`;
    if (options?.tied) abcToAdd += "-";

    // Add barline if we're at the end of the measure
    const measureTotalDuration = getMeasureDurationFromTimeSig(this.timeSig);
    const durationWithAddedNote =
      currentMeasure.duration +
      (1 / rhythm) *
        (options?.dotted ? 3 / 2 : 1) *
        (options?.triplet ? 2 / 3 : 1);

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
          equalUpToN(chord.fractionalBeat, durationWithAddedNote),
        );
      if (chordToAdd) abcToAdd += ` "^${chordToAdd.name}"`;
    }

    const midiNum =
      typeof midiNumOrNoteName === "number"
        ? midiNumOrNoteName
        : getMidiNumForAddedNote(
            abcNote,
            currentMeasure,
            options?.accidental,
            this.keySig,
          );
    if (midiNum && !options?.rest) this.onNote?.(midiNum);

    // Add the note to the ABC score, and select the note
    this.history.addEdit(this.abc, (this.abc += abcToAdd));
    this.selected = {
      measureIdx: this.measures.length - 1,
      noteIdx: currentMeasure.notes.length,
      data: {
        note: abcNote,
        rhythm,
        accidental: options?.accidental,
        tied: options?.tied,
        dotted: options?.dotted,
        beamed: options?.beamed,
        rest: options?.rest,
      },
    };
  }

  selectNote(
    abcElem: AbcElem,
    analysis: ClickListenerAnalysis,
    drag?: ClickListenerDrag,
  ) {
    let measureIdx = this.measures.findIndex((m) => m.line === analysis.line);
    if (measureIdx === -1) return;
    measureIdx += analysis.measure;
    const measure = this.measures[measureIdx];
    const noteIdx = measure?.notes.findIndex(
      (note) => note.startChar === abcElem.startChar,
    );
    if (noteIdx === undefined || noteIdx === -1) return;

    const note = measure!.notes[noteIdx]!;
    const rhythmData = getRhythmFromAbcDuration(note.duration);
    this.selected = {
      measureIdx,
      noteIdx,
      data: {
        note: note.pitches?.[0]?.name,
        accidental: note.pitches?.[0]?.accidental as Accidental,
        tied: !!note.pitches?.[0]?.startTie,
        rhythm: rhythmData?.rhythm,
        dotted: rhythmData?.dotted,
        beamed: getBeamingOfAbcjsNote(note),
        rest: !!note.rest,
      },
    };
    if (drag && drag.step !== 0) this.moveNote(-drag.step);
    else {
      this.onSelected?.(this.selected);
      if (this.selected.data?.note && measure) {
        const midiNum = getMidiNumForEditedNote(
          this.selected.data.note,
          measure,
          note.startChar,
          this.keySig,
        );
        if (midiNum) this.onNote?.(midiNum);
      }
    }
  }

  selectNextNote() {
    if (!this.selected) return;
    let { noteIdx, measureIdx } = this.selected;
    let nextNote = this.measures.at(measureIdx)?.notes.at(++noteIdx);
    if (!nextNote)
      nextNote = this.measures.at(++measureIdx)?.notes.at((noteIdx = 0));
    if (nextNote) {
      const rhythmData = getRhythmFromAbcDuration(nextNote.duration);
      this.selected = {
        noteIdx,
        measureIdx,
        data: {
          note: nextNote.pitches?.[0]?.name,
          accidental: nextNote.pitches?.[0]?.accidental as Accidental,
          tied: !!nextNote.pitches?.[0]?.startTie,
          rhythm: rhythmData?.rhythm,
          dotted: rhythmData?.dotted,
          beamed: getBeamingOfAbcjsNote(nextNote),
          rest: !!nextNote.rest,
        },
      };
      this.onSelected?.(this.selected);
      if (this.selected.data?.note && this.measures[measureIdx]) {
        const midiNum = getMidiNumForEditedNote(
          this.selected.data.note,
          this.measures[measureIdx]!,
          nextNote.startChar,
          this.keySig,
        );
        if (midiNum) this.onNote?.(midiNum);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.tuneObject?.engraver?.rangeHighlight(
        nextNote.startChar,
        nextNote.endChar,
      );
    }
  }

  selectPrevNote() {
    if (!this.selected) return;
    let { noteIdx, measureIdx } = this.selected;
    let prevNote;
    if (noteIdx > 0)
      prevNote = this.measures.at(measureIdx)?.notes.at(--noteIdx);
    else if (measureIdx > 0) {
      const prevMeasure = this.measures.at(--measureIdx);
      if (!prevMeasure) return;
      noteIdx = prevMeasure.notes.length - 1;
      prevNote = prevMeasure.notes.at(noteIdx);
    }
    if (prevNote) {
      const rhythmData = getRhythmFromAbcDuration(prevNote.duration);
      this.selected = {
        noteIdx,
        measureIdx,
        data: {
          note: prevNote.pitches?.[0]?.name,
          accidental: prevNote.pitches?.[0]?.accidental as Accidental,
          tied: !!prevNote.pitches?.[0]?.startTie,
          rhythm: rhythmData?.rhythm,
          dotted: rhythmData?.dotted,
          beamed: getBeamingOfAbcjsNote(prevNote),
          rest: !!prevNote.rest,
        },
      };
      this.onSelected?.(this.selected);
      if (this.selected.data?.note && this.measures[measureIdx]) {
        const midiNum = getMidiNumForEditedNote(
          this.selected.data.note,
          this.measures[measureIdx]!,
          prevNote.startChar,
          this.keySig,
        );
        if (midiNum) this.onNote?.(midiNum);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.tuneObject?.engraver?.rangeHighlight(
        prevNote.startChar,
        prevNote.endChar,
      );
    }
  }

  editNote(data: {
    note: string;
    rhythm: Rhythm;
    beamed?: boolean;
    rest?: boolean;
    dotted?: boolean;
    tied?: boolean;
  }) {
    if (!this.selected) return;
    const measure = this.measures.at(this.selected.measureIdx);
    const existingNote = measure?.notes.at(this.selected.noteIdx);
    if (!measure || !existingNote) return;

    let newAbc = "";
    if (existingNote.startTriplet) newAbc += "(3";
    newAbc += `${!data.rest ? data.note : "z"}${getAbcRhythm(
      data.rhythm,
      data?.dotted,
    )}`;
    if (data.tied) newAbc += "-";

    // get starting and ending index of note, ignoring any chord symbol before or spaces after
    const existingNoteAbc = this.abc.slice(
      existingNote.startChar,
      existingNote.endChar,
    );
    const startIdxOfNoteWithoutChord = /(^\s*"[^"]*"\s*)?(.*)/d.exec(
      existingNoteAbc,
    )?.indices?.[2]?.[0];
    if (typeof startIdxOfNoteWithoutChord !== "number") return;
    const endIdxOfNoteWithoutSpaces =
      /\s+$/.exec(existingNoteAbc)?.index || existingNoteAbc.length;

    const startIdx = existingNote.startChar + startIdxOfNoteWithoutChord;
    let endIdx = existingNote.startChar + endIdxOfNoteWithoutSpaces;
    if (
      data.beamed &&
      this.abc[endIdx] === " " &&
      this.abc[endIdx + 1] !== '"' &&
      this.abc[endIdx + 1] !== "|"
    )
      endIdx += 1;
    else if (data.beamed === false && this.abc[endIdx] !== " ") newAbc += " ";

    this.history.addEdit(
      this.abc,
      (this.abc =
        this.abc.slice(0, startIdx) + newAbc + this.abc.slice(endIdx)),
    );

    const midiNum = getMidiNumForEditedNote(
      data.note,
      measure,
      startIdx,
      this.keySig,
    );
    if (midiNum) this.onNote?.(midiNum);
  }

  moveNote(step: number) {
    if (!this.selected?.data?.note || !this.selected.data.rhythm) return;

    const [acc] = AbcNotation.tokenize(this.selected.data.note);
    const [, newLetter, newOctave] = AbcNotation.tokenize(
      AbcNotation.transpose(
        this.selected.data.note,
        `M${step < 0 ? step - 1 : step + 1}`,
      ),
    );
    const newNote = `${acc}${newLetter}${newOctave}`;

    this.editNote({
      note: newNote,
      rhythm: this.selected.data.rhythm,
      dotted: this.selected.data.dotted,
      tied: this.selected.data.tied,
    });
  }

  changeAccidental(accidental: Accidental) {
    if (!this.selected?.data?.note || !this.selected.data.rhythm) return;

    const [, letter, octave] = AbcNotation.tokenize(this.selected.data.note);
    const noteWithoutAcc = AbcNotation.abcToScientificNotation(letter + octave);
    const newNote = getAbcNoteFromNoteName(noteWithoutAcc, accidental);
    this.editNote({
      note: newNote,
      rhythm: this.selected.data.rhythm,
      dotted: this.selected.data.dotted,
      tied: this.selected.data.tied,
    });
  }

  toggleBeaming() {
    if (
      !this.selected?.data?.note ||
      !this.selected.data.rhythm ||
      this.selected.data.beamed === undefined
    )
      return;

    this.editNote({
      note: this.selected.data.note,
      rhythm: this.selected.data.rhythm,
      dotted: this.selected.data.dotted,
      tied: this.selected.data.tied,
      beamed: !this.selected.data.beamed,
    });
  }

  toggleTie() {
    if (!this.selected?.data?.note || !this.selected.data.rhythm) return;

    this.editNote({
      note: this.selected.data.note,
      rhythm: this.selected.data.rhythm,
      dotted: this.selected.data.dotted,
      tied: !this.selected.data.tied,
    });
  }

  backspace() {
    const lastItem = this.lastItem;
    if (!lastItem) return;

    const { measureIdx, item } = lastItem;
    let newAbc = this.abc.slice(0, item.startChar).replace(/ +$/, "");

    if (this.chordTemplate) {
      const currentMeasure = this.measures.at(measureIdx);
      if (!currentMeasure) return;
      const durationWithRemovedNote =
        currentMeasure.duration - item.duration * (item.isTriplet ? 2 / 3 : 1);
      const chordToAdd = this.chordTemplate
        ?.at(this.measures.length + measureIdx)
        ?.find((chord) =>
          equalUpToN(chord.fractionalBeat, durationWithRemovedNote),
        );
      if (chordToAdd) newAbc += ` "^${chordToAdd.name}"`;
    }

    this.history.addEdit(this.abc, (this.abc = newAbc));
  }

  newLine() {
    if (this.abc.at(-1) === "\n") return;

    const lastBarlineIndex = this.abc.lastIndexOf("|");
    if (lastBarlineIndex === -1) return;
    let newAbc = this.abc.slice(0, lastBarlineIndex + 1) + "\n";

    if (this.chordTemplate) {
      const chordToAdd = this.chordTemplate
        ?.at(this.measures.length - 1)
        ?.find((chord) => equalUpToN(chord.fractionalBeat, 0));
      if (chordToAdd) newAbc += `"^${chordToAdd.name}"`;
    }

    this.history.addEdit(this.abc, (this.abc = newAbc));
  }

  undo() {
    this.abc = this.history.undo(this.abc);
  }

  redo() {
    this.abc = this.history.redo(this.abc);
  }

  shouldBeamNextNote(nextRhythm: Rhythm) {
    const lastMeasure = this.measures.at(-1);
    const lastNote = lastMeasure?.notes.at(-1);
    if (!lastNote || !lastMeasure || lastNote.endTriplet) return false;

    const currentDuration = lastMeasure.notes.reduce(
      (acc, curr) => acc + curr.duration * (curr.isTriplet ? 2 / 3 : 1),
      0,
    );
    const currentBeat = currentDuration * 4;

    // TODO handle beaming and different time signatures
    return (
      ((nextRhythm === Rhythm.Eighth && ![0, 2].includes(currentBeat)) ||
        (nextRhythm === Rhythm.Sixteenth &&
          ![0, 1, 2, 3].includes(currentBeat))) &&
      [0.125, 0.0625]
        .concat([0.125, 0.0625].map((v) => v * 1.5))
        .includes(lastNote.duration)
    );
  }

  get lastItem() {
    let measureIdx = -1;
    let lastItem: AbcjsNote | undefined;
    while (!(lastItem = this.measures.at(measureIdx)?.notes.at(-1))) {
      if (Math.abs(measureIdx) >= this.measures.length) return null;
      measureIdx--;
    }
    return { item: lastItem, measureIdx };
  }

  get currentDuration() {
    const lastMeasure = this.measures.at(-1);
    if (!lastMeasure) return -1;

    return lastMeasure.notes.reduce(
      (acc, curr) => acc + curr.duration * (curr.isTriplet ? 2 / 3 : 1),
      0,
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

  get canUndo() {
    return !!this.history.prevEdit;
  }

  get canRedo() {
    return !!this.history.nextEdit;
  }
}
