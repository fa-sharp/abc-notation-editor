import { AbcNotation, Midi, Note } from "tonal";
import { Accidental } from "../types/constants";
import type { Measure } from "~src/parsing/measures";
import type { KeySignatureType } from "~src/parsing/headers";

/** Get the note in ABC notation from the given MIDI pitch (0-127) */
export function getAbcNoteFromMidiNum(
  midiNum: number,
  accidental: Accidental = Accidental.None,
) {
  if (accidental === Accidental.Natural)
    return (
      "=" + AbcNotation.scientificToAbcNotation(Midi.midiToNoteName(midiNum))
    );
  return AbcNotation.scientificToAbcNotation(
    Midi.midiToNoteName(midiNum, {
      sharps: accidental === Accidental.Sharp,
    }),
  );
}

/** Get the note in ABC notation from the given note */
export function getAbcNoteFromNoteName(
  noteName: string,
  accidental: Accidental = Accidental.None,
) {
  if (accidental === Accidental.None)
    return AbcNotation.scientificToAbcNotation(noteName);
  if (accidental === Accidental.Natural)
    return "=" + AbcNotation.scientificToAbcNotation(noteName);
  const note = Note.get(noteName);
  const wantedPitchClass =
    note.letter + (accidental === Accidental.Sharp ? "#" : "b");
  const noteNameWithAccidental = Note.enharmonic(
    Note.transpose(noteName, accidental === Accidental.Sharp ? "m2" : "m-2"),
    wantedPitchClass,
  );
  return AbcNotation.scientificToAbcNotation(noteNameWithAccidental);
}

export function getMidiNumFromAbcNote(abcNote: string) {
  return Midi.toMidi(AbcNotation.abcToScientificNotation(abcNote)) ?? undefined;
}

/** Get the last accidental for this note in the given measure  */
export function getLastAccidentalInMeasure(
  abcNote: string,
  measure: Measure,
  beforeCharIdx?: number,
) {
  return measure.notes
    .filter((note) => !beforeCharIdx || note.endChar <= beforeCharIdx)
    .flatMap((note) => note.pitches)
    .findLast((pitch) => {
      if (!pitch?.accidental) return false;
      const [, note, octave] = AbcNotation.tokenize(pitch.name);
      return abcNote === note + octave;
    })?.accidental;
}

export function getMidiNumForAddedNote(
  abcNote: string,
  measure: Measure,
  accidental?: Accidental,
  keySig?: KeySignatureType,
) {
  const midiNum = getMidiNumFromAbcNote(abcNote);
  if (midiNum === undefined) return null;
  if (accidental && accidental !== Accidental.None) return midiNum;

  const lastAcc = getLastAccidentalInMeasure(abcNote, measure);
  if (lastAcc === "sharp") return midiNum + 1;
  if (lastAcc === "flat") return midiNum - 1;
  if (lastAcc === "natural") return midiNum;

  // const isInKey = Pcset.isNoteIncludedIn([...keySig.scale]);
  const noteData = Note.get(AbcNotation.abcToScientificNotation(abcNote));
  if (keySig?.type === "major") {
    const noteInScale = keySig.scale.find(
      (note) => noteData.letter === Note.get(note).letter,
    );
    if (noteInScale && noteData.oct)
      return Midi.toMidi(noteInScale + noteData.oct);
  }
  if (keySig?.type === "minor") {
    const noteInScale = keySig.natural.scale.find(
      (note) => noteData.letter === Note.get(note).letter,
    );
    if (noteInScale && noteData.oct)
      return Midi.toMidi(noteInScale + noteData.oct);
  }

  return midiNum;
}

export function getMidiNumForEditedNote(
  abcNote: string,
  measure: Measure,
  startIdx: number,
  keySig?: KeySignatureType,
) {
  const [accidental, note, octave] = AbcNotation.tokenize(abcNote);
  if (accidental) return getMidiNumFromAbcNote(abcNote) ?? null;

  const midiNum = getMidiNumFromAbcNote(note + octave);
  if (midiNum === undefined) return null;

  const lastAcc = getLastAccidentalInMeasure(note + octave, measure, startIdx);
  if (lastAcc === "sharp") return midiNum + 1;
  if (lastAcc === "flat") return midiNum - 1;
  if (lastAcc === "natural") return midiNum;

  const noteData = Note.get(AbcNotation.abcToScientificNotation(abcNote));
  if (keySig?.type === "major") {
    const noteInScale = keySig.scale.find(
      (note) => noteData.letter === Note.get(note).letter,
    );
    if (noteInScale && noteData.oct)
      return Midi.toMidi(noteInScale + noteData.oct);
  }
  if (keySig?.type === "minor") {
    const noteInScale = keySig.natural.scale.find(
      (note) => noteData.letter === Note.get(note).letter,
    );
    if (noteInScale && noteData.oct)
      return Midi.toMidi(noteInScale + noteData.oct);
  }

  return midiNum;
}
