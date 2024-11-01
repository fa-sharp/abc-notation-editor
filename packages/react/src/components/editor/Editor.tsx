import type { AbcVisualParams, TuneObject } from "abcjs";
import { useMemo } from "react";
import { EditorProvider, useEditorContext } from "../../context/EditorContext";
import Score from "../notation/Score";
import Keyboard from "../piano/Keyboard";
import EditorControls from "./EditorControls";

import { EditorState } from "@abc-editor/core";
import styles from "./Editor.module.css";

export type EditorChangeHandler = (
  abc: string,
  tuneObject: TuneObject,
  renderDiv?: HTMLDivElement,
) => void;

export type EditorProps = {
  initialAbc?: string;
  chordTemplate?: string;
  jazzChords?: boolean;
  format?: AbcVisualParams["format"];
  visualTranspose?: AbcVisualParams["visualTranspose"];
  ending?: EditorState["ending"];
  errors?: EditorState["errorOptions"];
  colors?: {
    errorColor?: string;
    selectionColor?: string;
    menuButtonColor?: string;
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
   * Fires after each edit made to the score. Make sure to stabilize the event handler with `useCallback`
   * to avoid a re-render loop.
   * @param abc The updated ABC score
   * @param tuneObject The tuneObject returned by the abcjs rendering library. This object has useful
   * parsed information about the score, and can also be used to setup playback with the abcjs library.
   * For more info, see the abcjs docs:
   * [API of the returned object](https://paulrosen.github.io/abcjs/visual/render-abc-result.html) and
   * [setting up playback](https://paulrosen.github.io/abcjs/audio/synthesized-sound.html)
   * @param renderDiv The div element where the score is rendered. This can be used to manipulate
   * individual elements within the score. See [abcjs docs](https://paulrosen.github.io/abcjs/visual/classes.html)
   * on all the class names that can be used to select lines/notes/etc.
   */
  onChange?: EditorChangeHandler;
  /**
   * Fired after a note is added, edited, or selected in the score. Can be used for immediate playback of the note.
   * Make sure to stabilize the event handler with `useCallback` to avoid a re-render loop.
   * @param midiNum The MIDI number of the note just added to the score.
   */
  onNote?: (midiNum: number) => void;
};

/** The main ABC notation editor with a built-in toolbar. */
export default function Editor({
  initialAbc,
  chordTemplate,
  jazzChords,
  format,
  visualTranspose,
  autoLineBreaks,
  lineBreaks,
  ending,
  errors,
  colors: {
    errorColor = "#ff0000",
    selectionColor = "rgb(80, 100, 255)",
    menuButtonColor = "rgb(100, 183, 206)",
  } = {},
  responsive = false,
  scale = 1,
  enableKbdShortcuts = false,
  onChange = () => {},
  onNote,
}: EditorProps) {
  //@ts-expect-error FIXME wrong typing for `lineBreaks` - double array and 0-based
  const abcjsOptions: AbcVisualParams = useMemo(
    () => ({
      scale,
      responsive: responsive ? "resize" : undefined,
      jazzchords: jazzChords,
      format,
      visualTranspose,
      selectionColor,
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
      lineBreaks,
      selectionColor,
      autoLineBreaks?.staffWidth,
      autoLineBreaks?.minSpacing,
      autoLineBreaks?.maxSpacing,
      autoLineBreaks?.preferredMeasuresPerLine,
    ],
  );

  return (
    <EditorProvider
      {...{
        initialAbc,
        chordTemplate,
        abcjsOptions,
        ending,
        errors,
        enableKbdShortcuts,
        onChange,
        onNote,
      }}
    >
      <InnerEditor colors={{ selectionColor, menuButtonColor, errorColor }} />
    </EditorProvider>
  );
}

function InnerEditor(props: { colors: NonNullable<EditorProps["colors"]> }) {
  const { currentCommands } = useEditorContext();
  return (
    <div
      className={styles.editor}
      style={
        {
          "--abc-editor-error": props.colors.errorColor,
          "--abc-editor-selection": props.colors.selectionColor,
          "--abc-editor-menu-button": props.colors.menuButtonColor,
        } as React.CSSProperties
      }
    >
      <EditorControls />
      {currentCommands.showKeyboard && <Keyboard startKey={60} endKey={84} />}
      <Score />
    </div>
  );
}
