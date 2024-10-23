import { useState } from "react";
import Editor from "../editor/Editor";

const onNoteAdded = (midiNum: number) => console.log({ noteAdded: midiNum });

export default function BasicExample() {
  const [abc, setAbc] = useState("");
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Editor
        initialAbc={`X:1\nQ:120\nK:C clef=bass\n%%stretchlast false\n`}
        scale={1.1}
        onChange={setAbc}
        enableKbdShortcuts
        chordTemplate={sampleChordTemplate}
        ending={{ lastBarline: "thin-thin", lastMeasure: 8 }}
        lineBreaks={[3]}
        jazzChords
        onNoteAdded={onNoteAdded}
      />
      <br />
      Generated ABC:
      <textarea readOnly rows={10} cols={50} value={abc} />
    </div>
  );
}

const sampleChordTemplate =
  '"Fm7"z4 "^Go7"z4  |  "Fm/Ab"z4 "^Bbm6"z4  |  "Fm/C" z8  |"Gm7b5" z4"^C7b9"z4  |\n "Fm7" z4 "^Go7"z4  |  "Fm/Ab"z4 "^Bbm6" z4 |  "Fm/C" z8  |"C7b9"  z4 "^Fm7"z4  ||\n "Fm7" z4 "^Go7"z4  |  "Fm/Ab" z8 "^Bbm6"  |  "Fm/C" z8  |  "Gm7b5" z8"^C7b9"  |\n "Fm7" z8 "^Go7"  |  "Fm/Ab" z8 "^Bbm6"  |  "Fm/C" z8   | "C7b9"  z8 "^Fm7"  ||\n "Fm7" z8  |  "Bb7" z8  |  "Ebmaj7" z8  |  z8  |\n "Ebm7" z8  |  "Ab7" z8  |  "Dbmaj7" z8  |  "Gm7b5" z8"^C7b9"  ||\n "Fm7" z8 "^Go7"  |  "Fm/Ab" z8 "^Bbm6"  |  "Fm/C" z8  |  "Gm7b5" z8 "^C7b9"  |\n "Fm7" z8"^Go7"  |  "Fm/Ab" z8"^Bbm6"  |  "Fm/C" z8  | "C7b9"  z8 "^Fm7"  |]';
