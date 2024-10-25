import type { AbcjsNote } from "~src/types/abcjs";

export function getBeamingOfAbcjsNote(note: AbcjsNote) {
  return note.startBeam
    ? true
    : note.endBeam
      ? false
      : note.abselem.beam
        ? true
        : !note.startBeam && !note.endBeam
          ? false
          : undefined;
}
