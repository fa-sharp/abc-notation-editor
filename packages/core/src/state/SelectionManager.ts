import type {
  AbcElem,
  ClickListenerAnalysis,
  ClickListenerDrag,
  TuneObject,
} from "abcjs";
import type { KeySignatureType } from "~src/parsing/headers";
import type { Measure } from "~src/parsing/measures";
import type { AbcjsNote } from "~src/types/abcjs";
import type { Accidental, Rhythm } from "~src/types/constants";
import { getBeamingOfAbcjsNote } from "~src/utils/beaming";
import { getMidiNumForEditedNote } from "~src/utils/notes";
import { getRhythmFromAbcDuration } from "~src/utils/rhythm";

export interface SelectionState {
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
}

export class SelectionManager {
  private selected: SelectionState | null = null;
  private onSelected?: (selected: SelectionState | null) => void;
  private onNote?: (midiNum: number) => void;

  constructor(callbacks: {
    onSelected?: (selected: SelectionState | null) => void;
    onNote?: (midiNum: number) => void;
  }) {
    this.onSelected = callbacks.onSelected;
    this.onNote = callbacks.onNote;
  }

  selectNote(
    abcElem: AbcElem,
    analysis: ClickListenerAnalysis,
    measures: Measure[],
    keySig: KeySignatureType,
    drag?: ClickListenerDrag,
  ) {
    let measureIdx = measures.findIndex((m) => m.line === analysis.line);
    if (measureIdx === -1) return;
    measureIdx += analysis.measure;
    const measure = measures[measureIdx];
    const noteIdx = measure?.notes.findIndex(
      (note) => note.startChar === abcElem.startChar,
    );
    if (!measure || noteIdx === undefined || noteIdx === -1) return;

    const note = measure.notes[noteIdx]!;
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

    if (drag && drag.step !== 0) {
      // If dragging, handle note movement in EditorState
      return { selected: this.selected, moveStep: -drag.step };
    } else {
      // If not dragging, notify callbacks
      this.onSelected?.(this.selected);
      if (this.selected.data?.note && measure) {
        const midiNum = getMidiNumForEditedNote(
          this.selected.data.note,
          measure,
          note.startChar,
          keySig,
        );
        if (midiNum) this.onNote?.(midiNum);
      }
      return { selected: this.selected };
    }
  }

  selectNextNote(
    measures: Measure[],
    keySig: KeySignatureType,
    tuneObject?: TuneObject | null,
  ) {
    if (!this.selected) return;
    let { noteIdx, measureIdx } = this.selected;
    let nextNote = measures.at(measureIdx)?.notes.at(++noteIdx);
    if (!nextNote)
      nextNote = measures.at(++measureIdx)?.notes.at((noteIdx = 0));
    if (nextNote) {
      this.updateSelection(
        nextNote,
        measureIdx,
        noteIdx,
        measures,
        keySig,
        tuneObject,
      );
    }
  }

  selectPrevNote(
    measures: Measure[],
    keySig: KeySignatureType,
    tuneObject?: TuneObject | null,
  ) {
    if (!this.selected) return;
    let { noteIdx, measureIdx } = this.selected;
    let prevNote;
    if (noteIdx > 0) prevNote = measures.at(measureIdx)?.notes.at(--noteIdx);
    else if (measureIdx > 0) {
      const prevMeasure = measures.at(--measureIdx);
      if (!prevMeasure) return;
      noteIdx = prevMeasure.notes.length - 1;
      prevNote = prevMeasure.notes.at(noteIdx);
    }
    if (prevNote) {
      this.updateSelection(
        prevNote,
        measureIdx,
        noteIdx,
        measures,
        keySig,
        tuneObject,
      );
    }
  }

  renderSelection(measures: Measure[], tuneObject: TuneObject) {
    if (!this.selected) return;
    const note = measures
      .at(this.selected.measureIdx)
      ?.notes.at(this.selected.noteIdx);
    if (!note) {
      this.clearSelection();
    } else {
      const rhythmData = getRhythmFromAbcDuration(note.duration);
      this.selected.data = {
        note: note.pitches?.[0]?.name,
        accidental: note.pitches?.[0]?.accidental as Accidental,
        tied: !!note.pitches?.[0]?.startTie,
        rhythm: rhythmData?.rhythm,
        dotted: rhythmData?.dotted,
        beamed: getBeamingOfAbcjsNote(note),
        rest: !!note.rest,
      };
      this.onSelected?.(this.selected);
      this.highlightNote(note, tuneObject);
    }
  }

  setSelection(data: SelectionState) {
    this.selected = data;
  }

  private updateSelection(
    note: AbcjsNote,
    measureIdx: number,
    noteIdx: number,
    measures: Measure[],
    keySig: KeySignatureType,
    tuneObject?: TuneObject | null,
  ) {
    const rhythmData = getRhythmFromAbcDuration(note.duration);
    this.selected = {
      noteIdx,
      measureIdx,
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
    // Notify callbacks and highlight note
    this.onSelected?.(this.selected);
    if (this.selected.data?.note && measures[measureIdx]) {
      const midiNum = getMidiNumForEditedNote(
        this.selected.data.note,
        measures[measureIdx],
        note.startChar,
        keySig,
      );
      if (midiNum) this.onNote?.(midiNum);
    }
    this.highlightNote(note, tuneObject);
  }

  private highlightNote(note: AbcjsNote, tuneObject?: TuneObject | null) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    tuneObject?.engraver?.rangeHighlight(note.startChar, note.endChar);
  }

  getSelected() {
    return this.selected;
  }

  clearSelection() {
    this.selected = null;
    this.onSelected?.(null);
  }
}
