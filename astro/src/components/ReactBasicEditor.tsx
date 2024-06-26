import { useState } from "react";

import { ABCEditor } from "@abc-editor/react";
import "@abc-editor/react/dist/style.css";

export default function ReactBasicEditor() {
  const [abc, setAbc] = useState("");
  return (
    <div>
      <ABCEditor responsive enableKbdShortcuts onChange={setAbc} />
      <br />
      <p>Generated ABC notation:</p>
      <textarea readOnly rows={6} cols={50} value={abc} />
    </div>
  );
}
