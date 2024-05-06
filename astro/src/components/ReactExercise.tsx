import { useCallback } from "react";
import Confetti from "js-confetti";

import { ABCEditor, type ABCEditorChangeHandler } from "@abc-editor/react";
import "@abc-editor/react/dist/style.css";

const GMajorScaleAbc = "G2 A2 B2 c2 | d2 e2 ^f2 g2";

export default function ReactExercise() {
  const onChange: ABCEditorChangeHandler = useCallback((abc, _, renderDiv) => {
    if (abc.includes(GMajorScaleAbc)) {
      renderDiv
        ?.querySelectorAll(".abcjs-note")
        .forEach((note) => note.setAttribute("fill", "#10bb26"));
      new Confetti().addConfetti();
    }
  }, []);

  return (
    <div>
      <ABCEditor
        responsive
        ending={{ lastMeasure: 2 }}
        lineBreaks={[2]}
        selectTypes={false}
        onChange={onChange}
      />
    </div>
  );
}
