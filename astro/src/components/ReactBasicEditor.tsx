import { useState } from "react";

import { ABCEditor } from "@abc-editor/react";
import "@abc-editor/react/dist/style.css";

export default function BasicExample() {
  const [abc, setAbc] = useState("");
  return (
    <div>
      <ABCEditor minWidth={700} responsive onChange={setAbc} />
      <br />
      <p>Generated ABC notation:</p>
      <textarea readOnly rows={6} cols={50} value={abc} />
    </div>
  );
}
