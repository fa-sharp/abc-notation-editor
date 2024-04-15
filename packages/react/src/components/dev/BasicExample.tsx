import { useState } from "react";
import Editor from "../editor/Editor";

export default function BasicExample() {
  const [abc, setAbc] = useState("");
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Editor scale={1.1} onChange={setAbc} enableKbdShortcuts />
      <br />
      Generated ABC:
      <textarea readOnly rows={10} cols={50} value={abc} />
    </div>
  );
}
