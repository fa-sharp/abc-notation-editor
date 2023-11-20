import { useEditorContext } from "~src/lib/context/EditorContext";
import * as styles from "./EditorControls.module.css";

export default function EditorControls() {
  const {
    currentRhythm,
    isBeamed,
    isDotted,
    isRest,
    onToggleRest,
    onToggleDotted,
    setBeamed,
    changeRhythm,
    onAddBarline,
    onAddLineBreak,
    onBackspace,
  } = useEditorContext();

  return (
    <div className={styles.controls}>
      <button onClick={() => changeRhythm(2)} disabled={currentRhythm === 2}>
        2
      </button>
      <button onClick={() => changeRhythm(4)} disabled={currentRhythm === 4}>
        4
      </button>
      <button onClick={() => changeRhythm(8)} disabled={currentRhythm === 8}>
        8
      </button>
      <button onClick={() => changeRhythm(16)} disabled={currentRhythm === 16}>
        16
      </button>
      Dotted:{" "}
      <input type="checkbox" checked={isDotted} onChange={onToggleDotted} />
      Rest: <input type="checkbox" checked={isRest} onChange={onToggleRest} />
      Beamed:{" "}
      <input
        type="checkbox"
        checked={isBeamed}
        onChange={() => setBeamed((prev) => !prev)}
        disabled={![8, 16].includes(currentRhythm)}
      />
      <button onClick={onAddBarline}>Add bar</button>
      <button onClick={onAddLineBreak}>Add line</button>
      <button onClick={onBackspace}>Backspace</button>
    </div>
  );
}
