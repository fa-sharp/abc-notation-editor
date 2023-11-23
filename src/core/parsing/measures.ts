import { VoiceItem } from "abcjs";
import { AbcjsNote } from "../types/abcjs";
import { TimeSignature } from "../types/constants";

export interface Measure {
  notes: AbcjsNote[];
  line: number;
  lineStartIdx: number;
  lineEndIdx: number;
  duration: number;
}

/** Turn the tune data returned from ABCJS into a useful array of measures */
export const parseMeasuresFromAbcjs = (
  tuneLines: VoiceItem[][],
  timeSig: keyof typeof TimeSignature
) => {
  const measures: Measure[] = [];
  tuneLines.forEach((line, lineIdx) => {
    const fullMeasureDuration = TimeSignature[timeSig].duration;

    let currentMeasure: Measure = {
      line: lineIdx,
      lineStartIdx: 0,
      lineEndIdx: 0,
      notes: [],
      duration: 0,
    };
    measures.push(currentMeasure);

    for (let i = 0; i < line.length; i++) {
      const item = line[i]!;
      currentMeasure.lineEndIdx++;
      if (item.el_type === "note") {
        const note = item as AbcjsNote;
        if (note.rest?.type === "spacer") return;

        currentMeasure.notes.push(note);
        currentMeasure.duration += note.duration;
        if (currentMeasure.duration >= fullMeasureDuration) {
          currentMeasure = {
            notes: [],
            duration: 0,
            line: lineIdx,
            lineStartIdx: currentMeasure.lineEndIdx,
            lineEndIdx: currentMeasure.lineEndIdx,
          };
          measures.push(currentMeasure);
        }
      }
      // If this is the last item on the line, and there are more lines, remove extra measure in array
      if (
        i === line.length - 1 &&
        tuneLines[lineIdx + 1] &&
        measures.at(-1)?.notes.length === 0
      ) {
        measures.splice(measures.length - 1, 1);
      }
    }
  });
  return measures;
};
