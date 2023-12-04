import { useState } from "react";
import Editor from "../editor/Editor";

export default function BasicExample() {
  const [abc, setAbc] = useState("");
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Editor
        // autoLineBreaks={{ preferredMeasuresPerLine: 5, staffWidth: 600 }}
        minWidth={600}
        maxHeight={200}
        // scale={1.3}
        onChange={setAbc}
      />
      <br />
      Generated ABC:
      <textarea readOnly rows={10} cols={50} value={abc} />
    </div>
  );
}
