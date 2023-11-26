import { useState } from "react";
import Editor from "../editor/Editor";

export default function BasicExample() {
  const [abc, setAbc] = useState("");
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Editor width={800} maxHeight={200} onChange={setAbc} />
      <br />
      Generated ABC:
      <textarea readOnly rows={10} cols={50} value={abc} />
    </div>
  );
}
