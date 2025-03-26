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
import { History } from "~src/utils/history";
import {
  getAbcNoteFromMidiNum,
  getAbcNoteFromNoteName,
  getMidiNumForAddedNote,
  getMidiNumForEditedNote,
} from "~src/utils/notes";
import { equalUpToN } from "~src/utils/numbers";
import { getAbcRhythm } from "~src/utils/rhythm";
import { getMeasureDurationFromTimeSig } from "~src/utils/timeSig";
import { SelectionManager } from "./SelectionManager";

export default class EditorState {
  abc: string;
  history = new History();
  tuneObject: TuneObject | null = null;
  tuneLines: VoiceItem[][] = [];
  measures: Measure[] = [];

  keySig: KeySignatureType;
  timeSig: TimeSignatureType;
  clef: Clef;

  errorOptions?: {
    measureDuration?: boolean;
  };
  chordTemplate?: ChordTemplateMeasure[];
  ending?: {
    lastMeasure: number;
    lastBarline?: "thin-thin" | "thin-thick";
  };

  selectionManager: SelectionManager;
  onNote?: (midiNum: number) => void;

  constructor(
    initialAbc?: string,
    options?: {
      chordTemplate?: string;
      ending?: EditorState["ending"];
      errors?: EditorState["errorOptions"];
      onSelected?: (selected: SelectionManager["selected"]) => void;
      onNote?: (midiNum: number) => void;
    },
  ) {
    this.errorOptions = options?.errors;
    this.ending = options?.ending;
    this.onNote = options?.onNote;
    this.selectionManager = new SelectionManager({
      onNote: options?.onNote,
      onSelected: options?.onSelected,
    });
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
  }

  updateTuneData(tuneObject: TuneObject) {
    this.tuneObject = tuneObject;
    // Reduce the `lines` property from ABCJS into a simpler array, assuming only one staff and one voice for now
    this.tuneLines = tuneObject.lines.reduce<VoiceItem[][]>((arr, line) => {
      const items = line.staff?.[0]?.voices?.[0];
      if (items) arr.push(items);
      return arr;
    }, []);
    // Parse measures and render currently selected note
    this.measures = parseMeasuresFromAbcjs(this.tuneLines, this.timeSig);
    this.selectionManager.renderSelection(this.measures, tuneObject);

    // Highlight errors if needed
    if (this.errorOptions?.measureDuration)
      this.measures
        .filter((m) => m.duration >= 1.0001)
        .forEach((measure) => {
          measure.notes.forEach((note) =>
            note.abselem?.elemset.forEach((elem) =>
              elem.setAttribute("fill", "var(--abc-editor-error)"),
            ),
          );
        });
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
    this.selectionManager.setSelection({
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
    });
  }

  selectNote(
    abcElem: AbcElem,
    analysis: ClickListenerAnalysis,
    drag?: ClickListenerDrag,
  ) {
    const result = this.selectionManager.selectNote(
      abcElem,
      analysis,
      this.measures,
      this.keySig,
      drag,
    );
    if (result?.moveStep) {
      this.moveNote(result.moveStep);
    }
  }

  selectNextNote() {
    this.selectionManager.selectNextNote(
      this.measures,
      this.keySig,
      this.tuneObject,
    );
  }

  selectPrevNote() {
    this.selectionManager.selectPrevNote(
      this.measures,
      this.keySig,
      this.tuneObject,
    );
  }

  editNote(data: {
    note: string;
    rhythm: Rhythm;
    beamed?: boolean;
    rest?: boolean;
    dotted?: boolean;
    tied?: boolean;
  }) {
    const selected = this.selectionManager.getSelected();
    if (!selected) return;
    const measure = this.measures.at(selected.measureIdx);
    const existingNote = measure?.notes.at(selected.noteIdx);
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
    const selected = this.selectionManager.getSelected();
    if (!selected?.data?.note || !selected.data.rhythm) return;
    const {
      data: { note, rhythm, dotted, tied },
    } = selected;

    const [acc] = AbcNotation.tokenize(note);
    const [, newLetter, newOctave] = AbcNotation.tokenize(
      AbcNotation.transpose(note, `M${step < 0 ? step - 1 : step + 1}`),
    );
    const newNote = `${acc}${newLetter}${newOctave}`;

    this.editNote({
      note: newNote,
      rhythm,
      dotted,
      tied,
    });
  }

  changeAccidental(accidental: Accidental) {
    const selected = this.selectionManager.getSelected();
    if (!selected?.data?.note || !selected.data.rhythm) return;
    const {
      data: { note, rhythm, dotted, tied },
    } = selected;

    const [, letter, octave] = AbcNotation.tokenize(note);
    const noteWithoutAcc = AbcNotation.abcToScientificNotation(letter + octave);
    const newNote = getAbcNoteFromNoteName(noteWithoutAcc, accidental);
    this.editNote({
      note: newNote,
      rhythm,
      dotted,
      tied,
    });
  }

  toggleBeaming() {
    const selected = this.selectionManager.getSelected();
    if (
      !selected?.data?.note ||
      !selected.data.rhythm ||
      selected.data.beamed === undefined
    )
      return;
    const {
      data: { note, rhythm, dotted, tied, beamed },
    } = selected;

    this.editNote({
      note,
      rhythm,
      dotted,
      tied,
      beamed: !beamed,
    });
  }

  toggleTie() {
    const selected = this.selectionManager.getSelected();
    if (!selected?.data?.note || !selected.data.rhythm) return;
    const {
      data: { note, rhythm, dotted, tied },
    } = selected;

    this.editNote({
      note,
      rhythm,
      dotted,
      tied: !tied,
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
