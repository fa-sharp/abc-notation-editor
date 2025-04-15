import { AbcNotation } from "tonal";
import type { ChordTemplateMeasure } from "~src/parsing/chordTemplate";
import type { KeySignatureType, TimeSignatureType } from "~src/parsing/headers";
import type { Measure } from "~src/parsing/measures";
import { Accidental, Clef, Decoration, Rhythm } from "~src/types/constants";
import { getDecorationAbc } from "~src/utils/decorations";
import {
  getAbcNoteFromMidiNum,
  getAbcNoteFromNoteName,
  getMidiNumForAddedNote,
  getMidiNumForEditedNote,
} from "~src/utils/notes";
import { equalUpToN } from "~src/utils/numbers";
import { getAbcRhythm } from "~src/utils/rhythm";
import { getMeasureDurationFromTimeSig } from "~src/utils/timeSig";
import type { SelectionState } from "./SelectionManager";

export interface NoteData {
  note: string;
  rhythm: Rhythm;
  accidental?: Accidental;
  beamed?: boolean;
  rest?: boolean;
  dotted?: boolean;
  triplet?: boolean;
  tied?: boolean;
}

export type NoteChangeCallback = (abcString: string) => void;

export class NoteManager {
  constructor(
    private getState: () => {
      abc: string;
      measures: Measure[];
      keySig: KeySignatureType;
      timeSig: TimeSignatureType;
      clef: Clef;
      chordTemplate?: ChordTemplateMeasure[];
      ending?: {
        lastMeasure: number;
        lastBarline?: "thin-thin" | "thin-thick";
      };
    },
    private onNote?: (midiNum: number) => void,
  ) {}

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
  ): { addedNoteAbc: string; newAbc: string } | null {
    const state = this.getState();
    if (
      state.ending?.lastMeasure &&
      state.measures.length > state.ending.lastMeasure
    )
      return null;

    const currentMeasure = state.measures.at(-1);
    if (!currentMeasure) return null;

    const abcNote =
      typeof midiNumOrNoteName === "number"
        ? getAbcNoteFromMidiNum(
            midiNumOrNoteName,
            options?.accidental,
            currentMeasure,
            state.keySig,
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
    const measureTotalDuration = getMeasureDurationFromTimeSig(state.timeSig);
    const durationWithAddedNote =
      currentMeasure.duration +
      (1 / rhythm) *
        (options?.dotted ? 3 / 2 : 1) *
        (options?.triplet ? 2 / 3 : 1);

    if (durationWithAddedNote >= measureTotalDuration - 0.001) {
      if (
        state.ending?.lastMeasure &&
        state.measures.length === state.ending.lastMeasure
      )
        abcToAdd += state.ending.lastBarline === "thin-thick" ? " |]" : " ||";
      else {
        abcToAdd += " |";
        const chordToAdd = state.chordTemplate
          ?.at(state.measures.length)
          ?.find((chord) => equalUpToN(chord.fractionalBeat, 0));
        if (chordToAdd) abcToAdd += ` "^${chordToAdd.name}"`;
      }
    } else {
      const chordToAdd = state.chordTemplate
        ?.at(state.measures.length - 1)
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
            state.keySig,
          );

    if (midiNum && !options?.rest) this.onNote?.(midiNum);

    const newAbc = state.abc + abcToAdd;
    return { addedNoteAbc: abcNote, newAbc };
  }

  editNote(
    selected: SelectionState | null,
    data: {
      note: string;
      rhythm: Rhythm;
      beamed?: boolean;
      rest?: boolean;
      dotted?: boolean;
      tied?: boolean;
      decorations?: Decoration[];
    },
  ): string | null {
    if (!selected) return null;
    const state = this.getState();
    const measure = state.measures.at(selected.measureIdx);
    const existingNote = measure?.notes.at(selected.noteIdx);
    if (!measure || !existingNote) return null;

    let newAbc = "";
    if (existingNote.startTriplet) newAbc += "(3";
    if (data.decorations)
      newAbc += data.decorations.map(getDecorationAbc).join("");
    newAbc += `${!data.rest ? data.note : "z"}${getAbcRhythm(
      data.rhythm,
      data?.dotted,
    )}`;
    if (data.tied) newAbc += "-";

    // get starting and ending index of note, ignoring any chord symbol before or spaces after
    const existingNoteAbc = state.abc.slice(
      existingNote.startChar,
      existingNote.endChar,
    );
    const startIdxOfNoteWithoutChord = /(^\s*"[^"]*"\s*)?(.*)/d.exec(
      existingNoteAbc,
    )?.indices?.[2]?.[0];
    if (typeof startIdxOfNoteWithoutChord !== "number") return null;
    const endIdxOfNoteWithoutSpaces =
      /\s+$/.exec(existingNoteAbc)?.index || existingNoteAbc.length;

    const startIdx = existingNote.startChar + startIdxOfNoteWithoutChord;
    let endIdx = existingNote.startChar + endIdxOfNoteWithoutSpaces;
    if (
      data.beamed &&
      state.abc[endIdx] === " " &&
      state.abc[endIdx + 1] !== '"' &&
      state.abc[endIdx + 1] !== "|"
    )
      endIdx += 1;
    else if (data.beamed === false && state.abc[endIdx] !== " ") newAbc += " ";

    const resultAbc =
      state.abc.slice(0, startIdx) + newAbc + state.abc.slice(endIdx);

    // Call onNote if we have midiNum
    const midiNum = getMidiNumForEditedNote(
      data.note,
      measure,
      startIdx,
      state.keySig,
    );
    if (midiNum) this.onNote?.(midiNum);

    return resultAbc;
  }

  moveNote(selected: SelectionState | null, step: number): string | null {
    if (!selected?.data?.note || !selected.data.rhythm) return null;
    const {
      data: { note, rhythm, dotted, tied, decorations },
    } = selected;

    const [acc] = AbcNotation.tokenize(note);
    const [, newLetter, newOctave] = AbcNotation.tokenize(
      AbcNotation.transpose(note, `M${step < 0 ? step - 1 : step + 1}`),
    );
    const newNote = `${acc}${newLetter}${newOctave}`;

    return this.editNote(selected, {
      note: newNote,
      rhythm,
      dotted,
      tied,
      decorations,
    });
  }

  changeAccidental(
    selected: SelectionState | null,
    accidental: Accidental,
  ): string | null {
    if (!selected?.data?.note || !selected.data.rhythm) return null;
    const {
      data: { note, rhythm, dotted, tied, decorations },
    } = selected;

    const [, letter, octave] = AbcNotation.tokenize(note);
    const noteWithoutAcc = AbcNotation.abcToScientificNotation(letter + octave);
    const newNote = getAbcNoteFromNoteName(noteWithoutAcc, accidental);

    return this.editNote(selected, {
      note: newNote,
      rhythm,
      dotted,
      tied,
      decorations,
    });
  }

  toggleBeaming(selected: SelectionState | null): string | null {
    if (
      !selected?.data?.note ||
      !selected.data.rhythm ||
      selected.data.beamed === undefined
    )
      return null;
    const {
      data: { note, rhythm, dotted, tied, beamed, decorations },
    } = selected;

    return this.editNote(selected, {
      note,
      rhythm,
      dotted,
      tied,
      beamed: !beamed,
      decorations,
    });
  }

  toggleDecoration(
    selected: SelectionState | null,
    decoration: Decoration,
  ): string | null {
    if (!selected?.data?.note || !selected.data.rhythm) return null;
    const {
      data: { note, rhythm, dotted, tied, beamed, decorations },
    } = selected;

    return this.editNote(selected, {
      note,
      rhythm,
      dotted,
      tied,
      beamed,
      decorations: decorations?.includes(decoration)
        ? decorations.filter((d) => d !== decoration)
        : [...(decorations || []), decoration],
    });
  }

  toggleTie(selected: SelectionState | null): string | null {
    if (!selected?.data?.note || !selected.data.rhythm) return null;
    const {
      data: { note, rhythm, dotted, tied, decorations },
    } = selected;

    return this.editNote(selected, {
      note,
      rhythm,
      dotted,
      tied: !tied,
      decorations,
    });
  }

  shouldBeamNextNote(nextRhythm: Rhythm): boolean {
    const state = this.getState();
    const lastMeasure = state.measures.at(-1);
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
}
