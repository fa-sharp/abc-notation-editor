import type {
  AbcElem,
  ClickListenerAnalysis,
  ClickListenerDrag,
  TuneObject,
  VoiceItem,
} from "abcjs";
import { parseOnly } from "abcjs";
import { Key, TimeSignature } from "tonal";
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
import { Accidental, Clef, Decoration, Rhythm } from "~src/types/constants";
import { History } from "~src/utils/history";
import { equalUpToN } from "~src/utils/numbers";
import { NoteManager } from "./NoteManager";
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

  errors: Array<{ type: "measureDuration"; measureIdx: number }> = [];
  errorOptions?: {
    measureDuration?: boolean;
  };
  chordTemplate?: ChordTemplateMeasure[];
  ending?: {
    lastMeasure: number;
    lastBarline?: "thin-thin" | "thin-thick";
  };

  noteManager: NoteManager;
  selectionManager: SelectionManager;

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
    this.noteManager = new NoteManager(
      () => ({
        abc: this.abc,
        clef: this.clef,
        keySig: this.keySig,
        timeSig: this.timeSig,
        measures: this.measures,
        chordTemplate: this.chordTemplate,
        ending: this.ending,
      }),
      options?.onNote,
    );
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
    if (this.errorOptions?.measureDuration) {
      const tooLongMeasures = this.measures
        .map((measure, idx) => ({ measure, idx }))
        .filter(({ measure }) => measure.duration >= 1.0001);
      tooLongMeasures.forEach(({ measure }) => {
        measure.notes.forEach((note) =>
          note.abselem?.elemset.forEach((elem) =>
            elem.setAttribute("fill", "var(--abc-editor-error)"),
          ),
        );
      });
      this.errors = tooLongMeasures.map(({ idx }) => ({
        type: "measureDuration",
        measureIdx: idx,
      }));
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
    const { newAbc, addedNoteAbc } =
      this.noteManager.addNote(midiNumOrNoteName, rhythm, options) || {};
    if (newAbc) {
      this.history.addEdit(this.abc, newAbc);
      this.abc = newAbc;
      this.selectionManager.setSelection({
        measureIdx: this.measures.length - 1,
        noteIdx: this.measures.at(-1)?.notes.length ?? 0,
        data: {
          note: addedNoteAbc,
          rhythm,
          accidental: options?.accidental,
          tied: options?.tied,
          dotted: options?.dotted,
          beamed: options?.beamed,
          rest: options?.rest,
        },
      });
    }
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
    const newAbc = this.noteManager.editNote(
      this.selectionManager.getSelected(),
      data,
    );
    if (newAbc) this.history.addEdit(this.abc, (this.abc = newAbc));
  }

  moveNote(step: number) {
    const newAbc = this.noteManager.moveNote(
      this.selectionManager.getSelected(),
      step,
    );
    if (newAbc) this.history.addEdit(this.abc, (this.abc = newAbc));
  }

  changeAccidental(accidental: Accidental) {
    const newAbc = this.noteManager.changeAccidental(
      this.selectionManager.getSelected(),
      accidental,
    );
    if (newAbc) this.history.addEdit(this.abc, (this.abc = newAbc));
  }

  toggleBeaming() {
    const newAbc = this.noteManager.toggleBeaming(
      this.selectionManager.getSelected(),
    );
    if (newAbc) this.history.addEdit(this.abc, (this.abc = newAbc));
  }

  toggleDecoration(decoration: Decoration) {
    const newAbc = this.noteManager.toggleDecoration(
      this.selectionManager.getSelected(),
      decoration,
    );
    if (newAbc) this.history.addEdit(this.abc, (this.abc = newAbc));
  }

  toggleTie() {
    const newAbc = this.noteManager.toggleTie(
      this.selectionManager.getSelected(),
    );
    if (newAbc) this.history.addEdit(this.abc, (this.abc = newAbc));
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
    return this.noteManager.shouldBeamNextNote(nextRhythm);
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
