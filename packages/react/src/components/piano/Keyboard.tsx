import { Icon } from "@abc-editor/core";
import { useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import EditorControlIcon from "../editor/EditorControlIcon";
import Key from "./Key";
import styles from "./Keyboard.module.scss";

type KeyboardProps = {
  startKey: number;
  endKey: number;
};

export default function Keyboard({ startKey, endKey }: KeyboardProps) {
  const { onAddNote } = useEditorContext();

  const [currentStartKey, setCurrentStartKey] = useState(startKey);

  const [keys, setKeys] = useState(
    new Array<boolean>(endKey - startKey).fill(false),
  );

  return (
    <div className={styles.keyboard}>
      <button
        className={styles.iconButton}
        title="Lower octave"
        onClick={() => setCurrentStartKey((prev) => prev - 12)}
        disabled={currentStartKey <= 12}
      >
        <EditorControlIcon icon={Icon.ChevronLeft} size={26} />
      </button>
      <div>
        {keys.map((isPlayed, idx) => {
          const midiNum = currentStartKey + idx;
          return (
            <Key
              key={midiNum}
              midiNum={midiNum}
              played={isPlayed}
              onKeyPlayed={() => {
                setKeys((prev) => prev.with(idx, true));
                onAddNote(midiNum);
              }}
              onKeyReleased={() => {
                setKeys((prev) => prev.with(idx, false));
              }}
            />
          );
        })}
      </div>
      <button
        className={styles.iconButton}
        title="Higher octave"
        onClick={() => setCurrentStartKey((prev) => prev + 12)}
        disabled={currentStartKey >= 96}
      >
        <EditorControlIcon icon={Icon.ChevronRight} size={26} />
      </button>
    </div>
  );
}
