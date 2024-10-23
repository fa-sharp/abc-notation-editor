import { AbcNotation, Midi, Note } from "tonal";
import { Accidental } from "../types/constants";
import type { Measure } from "~src/parsing/measures";

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

export function getLastAccidentalInMeasure(abcNote: string, measure: Measure) {
  return measure.notes
    .flatMap((note) => note.pitches)
    .findLast((pitch) => {
      if (!pitch?.accidental) return false;
      const [, note, octave] = AbcNotation.tokenize(pitch.name);
      return abcNote === note + octave;
    })?.accidental;
}
