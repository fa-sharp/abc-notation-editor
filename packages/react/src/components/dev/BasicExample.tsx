import { synth } from "abcjs";
import { useState } from "react";
import Editor from "../editor/Editor";

export default function BasicExample() {
  const [abc, setAbc] = useState("");
  return (
    <div>
      <Editor
        initialAbc={`X:1\nQ:120\nK:C#m clef=bass\n%%stretchlast false\n`}
        scale={1.1}
        responsive
        enableKbdShortcuts
        chordTemplate={sampleChordTemplate}
        ending={{ lastBarline: "thin-thin", lastMeasure: 8 }}
        errors={{ measureDuration: true }}
        lineBreaks={[3]}
        jazzChords
        onChange={setAbc}
        onNote={noteEventHandler}
      />
      <br />
      <div>Generated ABC:</div>
      <textarea readOnly rows={10} cols={50} value={abc} />
    </div>
  );
}

const sampleChordTemplate =
  '"Fm7"z4 "^Go7"z4  |  "Fm/Ab"z4 "^Bbm6"z4  |  "Fm/C" z8  |"Gm7b5" z4"^C7b9"z4  |\n "Fm7" z4 "^Go7"z4  |  "Fm/Ab"z4 "^Bbm6" z4 |  "Fm/C" z8  |"C7b9"  z4 "^Fm7"z4  ||\n "Fm7" z4 "^Go7"z4  |  "Fm/Ab" z8 "^Bbm6"  |  "Fm/C" z8  |  "Gm7b5" z8"^C7b9"  |\n "Fm7" z8 "^Go7"  |  "Fm/Ab" z8 "^Bbm6"  |  "Fm/C" z8   | "C7b9"  z8 "^Fm7"  ||\n "Fm7" z8  |  "Bb7" z8  |  "Ebmaj7" z8  |  z8  |\n "Ebm7" z8  |  "Ab7" z8  |  "Dbmaj7" z8  |  "Gm7b5" z8"^C7b9"  ||\n "Fm7" z8 "^Go7"  |  "Fm/Ab" z8 "^Bbm6"  |  "Fm/C" z8  |  "Gm7b5" z8 "^C7b9"  |\n "Fm7" z8"^Go7"  |  "Fm/Ab" z8"^Bbm6"  |  "Fm/C" z8  | "C7b9"  z8 "^Fm7"  |]';

const noteEventHandler = (midiNum: number) => {
  console.log({ note: midiNum });
  synth
    .playEvent(
      [
        {
          duration: 0.125,
          gap: 0,
          instrument: 4,
          pitch: midiNum,
          start: 0,
          volume: 100,
        },
      ],
      [],
      1000,
    )
    .catch((err) => console.error(err));
};
