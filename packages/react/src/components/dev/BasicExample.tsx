import { useState } from "react";
import Editor from "../editor/Editor";

export default function BasicExample() {
  const [abc, setAbc] = useState("");
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Editor
        autoLineBreaks={{
          preferredMeasuresPerLine: 5,
          staffWidth: 700,
        }}
        minWidth={700}
        maxHeight={300}
        scale={0.9}
        onChange={setAbc}
        enableKbdShortcuts
      />
      <br />
      Generated ABC:
      <textarea readOnly rows={10} cols={50} value={abc} />
    </div>
  );
}
