import { EditorProvider } from "../../context/EditorContext";
import Score from "../notation/Score";
import Keyboard from "../piano/Keyboard";
import EditorControls from "./EditorControls";

import * as styles from "./Editor.module.css";

type Props = {
  width?: number;
  height?: number;
  onChange?: (abc: string) => void;
};

export default function Editor({
  width = 400,
  height = 300,
  onChange = () => {},
}: Props) {
  return (
    <EditorProvider staffWidth={width - 50} onChange={onChange}>
      <div className={styles.editor}>
        <Score width={width} height={height} />
        <EditorControls />
        <Keyboard startKey={60} endKey={84} />
      </div>
    </EditorProvider>
  );
}
