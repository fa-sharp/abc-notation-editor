import { useState } from "react";
import Editor from "~src/lib/components/editor/Editor";

export default function BasicExample() {
  const [abc, setAbc] = useState("");
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Editor width={500} onChange={setAbc} />
      <br />
      Generated ABC:
      <textarea readOnly rows={10} value={abc} />
    </div>
  );
}
