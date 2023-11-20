import { useState } from "react";
import Key from "./Key";

import * as styles from "./Keyboard.module.scss";
import { useEditorContext } from "~src/lib/context/EditorContext";

type Props = {
  startKey: number;
  endKey: number;
};

export default function Keyboard({ startKey, endKey }: Props) {
  const { onAddMidiNote } = useEditorContext();

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
                onAddMidiNote(midiNum);
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
