import Confetti from "js-confetti";
import { useCallback } from "react";

import { ABCEditor, type ABCEditorChangeHandler } from "@abc-editor/react";
import "@abc-editor/react/dist/style.css";

const GMajorScaleAbc = "G2 A2 B2 c2 | d2 e2 ^f2 g2";

export default function ReactExercise() {
  const onChange: ABCEditorChangeHandler = useCallback(
    (abc, _tuneObj, _errors, renderDiv) => {
      if (abc.includes(GMajorScaleAbc)) {
        renderDiv
          ?.querySelectorAll(".abcjs-note")
          .forEach((note) => note.setAttribute("fill", "#10bb26"));
        new Confetti().addConfetti();
      }
    },
    [],
  );

  return (
    <div>
      <ABCEditor
        responsive
        ending={{ lastMeasure: 2 }}
        lineBreaks={[2]}
        onChange={onChange}
      />
    </div>
  );
}
