import { AbcNotation, Midi, Note } from "tonal";
import type { KeySignatureType } from "~src/parsing/headers";
import type { Measure } from "~src/parsing/measures";
import { Accidental, AccidentalToAlt } from "../types/constants";

/**
 * Get the note in ABC notation from the given MIDI pitch (0-127). Can pass in the current measure
 * and key signature to try to be smart about accidentals.
 */
export function getAbcNoteFromMidiNum(
  midiNum: number,
  accidental: Accidental = Accidental.None,
  measure?: Measure,
  keySig?: KeySignatureType,
) {
  if (accidental === Accidental.Natural)
    return (
      "=" + AbcNotation.scientificToAbcNotation(Midi.midiToNoteName(midiNum))
    );
  if (accidental === Accidental.None) {
    const noteName = Midi.midiToNoteName(midiNum, {
      sharps: keySig ? !keySig.keySignature.includes("b") : false,
    });
    const noteData = Note.get(noteName);
    const foundEnharmonic = keySig
      ? findEnharmonic(midiNum, noteName, keySig)
      : null;
    if (measure) {
      const abcNote = AbcNotation.scientificToAbcNotation(
        foundEnharmonic?.note || noteName,
      );
      const [, note, octave] = AbcNotation.tokenize(abcNote);
      const lastAcc = getLastAccidentalInMeasure(note + octave, measure);
      if (lastAcc) {
        if (
          (foundEnharmonic ? foundEnharmonic.data.alt : noteData.alt) ===
          AccidentalToAlt[lastAcc]
        )
          return note + octave;
        return noteData.alt === 0 ? "=" + abcNote : abcNote;
      }
    }
    if (foundEnharmonic) {
      if (foundEnharmonic.inScale) {
        const [, note, octave] = AbcNotation.tokenize(
          AbcNotation.scientificToAbcNotation(foundEnharmonic.note),
        );
        return note + octave;
      } else {
        const needNatural = foundEnharmonic.data.alt === 0;
        return `${needNatural ? "=" : ""}${AbcNotation.scientificToAbcNotation(foundEnharmonic.note)}`;
      }
    }
    if (keySig && noteData.alt === 0) {
      return "=" + AbcNotation.scientificToAbcNotation(noteName);
    }
    return AbcNotation.scientificToAbcNotation(noteName);
  }
  return AbcNotation.scientificToAbcNotation(
    Midi.midiToNoteName(midiNum, {
      sharps: accidental === Accidental.Sharp,
    }),
  );
}

function findEnharmonic(
  midiNum: number,
  noteName: string,
  keySig: KeySignatureType,
) {
  const scaleNotes =
    keySig.type === "major" ? keySig.scale : keySig.natural.scale;
  const noteInScale = scaleNotes.find((note) => {
    const currNote = Note.get(note);
    return midiNum % 12 === currNote.chroma;
  });
  if (noteInScale) {
    const note = Note.enharmonic(noteName, noteInScale);
    return {
      note,
      data: Note.get(note),
      inScale: true,
    };
  }
  if (keySig.type === "minor") {
    const noteInMelodicMinorScale = keySig.melodic.scale.find((note) => {
      const currNote = Note.get(note);
      return midiNum % 12 === currNote.chroma;
    });
    const note = Note.enharmonic(noteName, noteInMelodicMinorScale);
    return {
      note,
      data: Note.get(note),
      inScale: false,
    };
  }
  return null;
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
  if (lastAcc) return midiNum + AccidentalToAlt[lastAcc];

  const noteData = Note.get(AbcNotation.abcToScientificNotation(abcNote));
  if (keySig) {
    const noteInScale = (
      keySig?.type === "major" ? keySig.scale : keySig.natural.scale
    ).find((note) => noteData.letter === Note.get(note).letter);
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
  if (lastAcc) return midiNum + AccidentalToAlt[lastAcc];

  const noteData = Note.get(AbcNotation.abcToScientificNotation(abcNote));
  if (keySig) {
    const noteInScale = (
      keySig?.type === "major" ? keySig.scale : keySig.natural.scale
    ).find((note) => noteData.letter === Note.get(note).letter);
    if (noteInScale && noteData.oct)
      return Midi.toMidi(noteInScale + noteData.oct);
  }

  return midiNum;
}
