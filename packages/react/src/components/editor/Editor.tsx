import { EditorProvider, useEditorContext } from "../../context/EditorContext";
import Score from "../notation/Score";
import Keyboard from "../piano/Keyboard";
import EditorControls from "./EditorControls";

import styles from "./Editor.module.css";

type EditorProps = {
  /** How wide the score should be, in pixels. @default 500 */
  width?: number;
  /** Maximum height of the score, in pixels. If the score needs more space than
   * this, it will scroll. @default 500 */
  maxHeight?: number;
  onChange?: (abc: string) => void;
};

/** The main ABC notation editor. */
export default function Editor({
  width = 400,
  maxHeight = 300,
  onChange = () => {},
}: EditorProps) {
  return (
    <EditorProvider staffWidth={width - 50} onChange={onChange}>
      <InnerEditor width={width} maxHeight={maxHeight} />
    </EditorProvider>
  );
}

function InnerEditor({
  width,
  maxHeight,
}: {
  width: number;
  maxHeight: number;
}) {
  const { currentCommands } = useEditorContext();
  return (
    <div className={styles.editor}>
      <Score width={width} maxHeight={maxHeight} />
      <EditorControls />
      {currentCommands.showKeyboard && <Keyboard startKey={60} endKey={84} />}
    </div>
  );
}
