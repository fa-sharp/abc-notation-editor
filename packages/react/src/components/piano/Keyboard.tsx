import { useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import Key from "./Key";

import styles from "./Keyboard.module.scss";

type KeyboardProps = {
  startKey: number;
  endKey: number;
};

export default function Keyboard({ startKey, endKey }: KeyboardProps) {
  const { onAddNote } = useEditorContext();

  const [keys, setKeys] = useState(
    new Array<boolean>(endKey - startKey).fill(false)
  );

  return (
    <div className={styles.keyboard}>
      <div>
        {keys.map((isPlayed, idx) => {
          const midiNum = startKey + idx;
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
    </div>
  );
}
