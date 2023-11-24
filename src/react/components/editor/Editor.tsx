import { EditorProvider, useEditorContext } from "../../context/EditorContext";
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
      <InnerEditor width={width} height={height} />
    </EditorProvider>
  );
}

function InnerEditor({ width, height }: { width: number; height: number }) {
  const { showKeyboard } = useEditorContext();
  return (
    <div className={styles.editor}>
      <Score width={width} height={height} />
      <EditorControls />
      {showKeyboard && <Keyboard startKey={60} endKey={84} />}
    </div>
  );
}
