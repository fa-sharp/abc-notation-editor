import { VoiceItem, parseOnly } from "abcjs";
import { TimeSignatureType } from "./headers";
import { parseMeasuresFromAbcjs } from "./measures";

export type ChordTemplateMeasure = Array<{
  name: string;
  fractionalBeat: number;
}>;

export const parseChordTemplate = (abc: string, timeSig: TimeSignatureType) => {
  const tuneObject = parseOnly(abc);
  const tuneLines = tuneObject[0].lines.reduce<VoiceItem[][]>((arr, line) => {
    // assume chords are on first staff and voice
    const items = line.staff?.[0]?.voices?.[0];
    if (items) arr.push(items);
    return arr;
  }, []);

  return parseMeasuresFromAbcjs(tuneLines, timeSig).map((measure) => {
    let fractionalBeat = 0;
    const chords: ChordTemplateMeasure = [];
    for (const note of measure.notes) {
      if (note.chord?.[0])
        chords.push({
          name: note.chord[0].name,
          fractionalBeat,
        });
      fractionalBeat += note.duration * (note.isTriplet ? 2 / 3 : 1);
    }
    return chords;
  });
};
