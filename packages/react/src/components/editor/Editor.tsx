import { AbcVisualParams, TuneObject } from "abcjs";
import { useMemo } from "react";
import { EditorProvider, useEditorContext } from "../../context/EditorContext";
import Score from "../notation/Score";
import Keyboard from "../piano/Keyboard";
import EditorControls from "./EditorControls";

import styles from "./Editor.module.css";

type EditorProps = {
  /** Maximum height of the score, in pixels. If the score needs more space than
   * this, it will scroll. @default 600 */
  maxHeight?: number;
  /** Minimum width of the score, in pixels. @default 600 */
  minWidth?: number;
  /** Make the printed music visually bigger or smaller @default 1 */
  scale?: number;
  /** Whether the printed music should grow/shrink according to the available width. Setting this to `true` overrides the `scale` option */
  responsive?: boolean;
  /**
   * Set this property in order to add line breaks automatically, rather than follow the line breaks in the
   * ABC score. You'll need to provide the available width for the staff, as well as the preferred number of measures in each line.
   * @see [abcjs docs](https://paulrosen.github.io/abcjs/visual/render-abc-options.html#wrap) for more details
   * on each of the options
   */
  autoLineBreaks?: {
    staffWidth: number;
    preferredMeasuresPerLine: number;
    minSpacing?: number;
    maxSpacing?: number;
  };
  /** Whether to enable keyboard shortcuts for the editor. TODO docs @default false */
  enableKbdShortcuts?: boolean;
  /**
   * Fires after each edit made to the score.
   * @param abc The updated ABC score
   * @param tuneObject The tuneObject returned by the abcjs rendering library. This object has useful
   * parsed information about the score, and can also be used to setup playback with the abcjs library.
   * For more info, see the abcjs docs:
   * [API of the returned object](https://paulrosen.github.io/abcjs/visual/render-abc-result.html) and
   * [setting up playback](https://paulrosen.github.io/abcjs/audio/synthesized-sound.html)
   */
  onChange?: (abc: string, tuneObject: TuneObject) => void;
};

/** The main ABC notation editor. */
export default function Editor({
  autoLineBreaks,
  responsive = false,
  scale = 1,
  enableKbdShortcuts = false,
  minWidth = 600,
  maxHeight = 600,
  onChange = () => {},
}: EditorProps) {
  const abcjsOptions: AbcVisualParams = useMemo(
    () => ({
      scale,
      responsive: responsive ? "resize" : undefined,
      ...(autoLineBreaks?.staffWidth
        ? {
            staffwidth: autoLineBreaks.staffWidth,
            wrap: {
              minSpacing: autoLineBreaks.minSpacing || 1.8,
              maxSpacing: autoLineBreaks.maxSpacing || 2.2,
              preferredMeasuresPerLine: autoLineBreaks.preferredMeasuresPerLine,
            },
          }
        : {}),
    }),
    [
      autoLineBreaks?.maxSpacing,
      autoLineBreaks?.minSpacing,
      autoLineBreaks?.preferredMeasuresPerLine,
      autoLineBreaks?.staffWidth,
      scale,
      responsive,
    ]
  );

  return (
    <EditorProvider
      abcjsOptions={abcjsOptions}
      enableKbdShortcuts={enableKbdShortcuts}
      onChange={onChange}
    >
      <InnerEditor minWidth={minWidth} maxHeight={maxHeight} />
    </EditorProvider>
  );
}

function InnerEditor({
  minWidth,
  maxHeight,
}: {
  minWidth: number;
  maxHeight: number;
}) {
  const { currentCommands } = useEditorContext();
  return (
    <div className={styles.editor}>
      <EditorControls />
      <Score minWidth={minWidth} maxHeight={maxHeight} />
      {currentCommands.showKeyboard && <Keyboard startKey={60} endKey={84} />}
    </div>
  );
}
