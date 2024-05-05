import type { AbcVisualParams, TuneObject } from "abcjs";
import { ForwardedRef, forwardRef, useMemo } from "react";
import { EditorProvider, useEditorContext } from "../../context/EditorContext";
import Score from "../notation/Score";
import Keyboard from "../piano/Keyboard";
import EditorControls from "./EditorControls";

import styles from "./Editor.module.css";

export type EditorProps = {
  initialAbc?: string;
  chordTemplate?: string;
  jazzChords?: boolean;
  selectTypes?: boolean;
  format?: AbcVisualParams["format"];
  visualTranspose?: AbcVisualParams["visualTranspose"];
  ending?: {
    lastMeasure: number;
    lastBarline?: "thin-thin" | "thin-thick";
  };
  /** Manually set the last measure number (zero-based) for each line, e.g. [3,7,11] */
  lineBreaks?: AbcVisualParams["lineBreaks"];
  /** Make the printed music visually bigger or smaller. Will be overridden if `responsive` is set to `true`. @default 1 */
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

/**
 * The main ABC notation editor with a built-in toolbar. Forwards a reference to the inner
 * div element where the score is rendered.
 */
export default forwardRef(function Editor(
  {
    initialAbc,
    chordTemplate,
    jazzChords,
    format,
    selectTypes,
    visualTranspose,
    autoLineBreaks,
    lineBreaks,
    ending,
    responsive = false,
    scale = 1,
    enableKbdShortcuts = false,
    onChange = () => {},
  }: EditorProps,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  //@ts-expect-error FIXME wrong typing for `lineBreaks` - double array and 0-based
  const abcjsOptions: AbcVisualParams = useMemo(
    () => ({
      scale,
      responsive: responsive ? "resize" : undefined,
      jazzchords: jazzChords,
      format,
      selectTypes,
      visualTranspose,
      lineBreaks: lineBreaks ? [lineBreaks] : undefined,
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
      scale,
      responsive,
      jazzChords,
      format,
      visualTranspose,
      selectTypes,
      lineBreaks,
      autoLineBreaks?.staffWidth,
      autoLineBreaks?.minSpacing,
      autoLineBreaks?.maxSpacing,
      autoLineBreaks?.preferredMeasuresPerLine,
    ]
  );

  return (
    <EditorProvider
      {...{
        initialAbc,
        chordTemplate,
        abcjsOptions,
        ending,
        enableKbdShortcuts,
        onChange,
      }}
    >
      <InnerEditor ref={forwardedRef} />
    </EditorProvider>
  );
});

const InnerEditor = forwardRef(function InnerEditor(
  _: object,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const { currentCommands } = useEditorContext();

  return (
    <div className={styles.editor}>
      <EditorControls />
      {currentCommands.showKeyboard && <Keyboard startKey={60} endKey={84} />}
      <Score ref={forwardedRef} />
    </div>
  );
});
