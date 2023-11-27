import { useState } from "react";
import { ABCEditor } from "@abc-editor/react";

export default function BasicExample() {
  const [abc, setAbc] = useState("");
  return (
    <div
      className="not-content"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <ABCEditor width={600} maxHeight={400} onChange={setAbc} />
      <br />
      Generated ABC:
      <textarea readOnly rows={6} cols={50} value={abc} />
    </div>
  );
}
