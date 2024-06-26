import { Accidental, Icon, Rhythm } from "@abc-editor/core";
import clsx from "clsx";
import { useEditorContext } from "../../context/EditorContext";
import EditorControlIcon from "./EditorControlIcon";

import styles from "./EditorControls.module.css";

export default function EditorControls() {
  const {
    currentCommands,
    abcjsOptions,
    dispatchCommand,
    onBackspace,
    onNewLine,
  } = useEditorContext();

  const iconSize = 18;

  return (
    <div className={styles.controls}>
      <fieldset className={styles.controlGroup}>
        <legend>Accidental</legend>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.accidental === Accidental.Flat,
          })}
          onClick={() =>
            dispatchCommand({
              type: "toggleAccidental",
              accidental: Accidental.Flat,
            })
          }
        >
          <EditorControlIcon icon={Icon.Flat} size={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.accidental === Accidental.Sharp,
          })}
          onClick={() =>
            dispatchCommand({
              type: "toggleAccidental",
              accidental: Accidental.Sharp,
            })
          }
        >
          <EditorControlIcon icon={Icon.Sharp} size={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]:
              currentCommands.accidental === Accidental.Natural,
          })}
          onClick={() =>
            dispatchCommand({
              type: "toggleAccidental",
              accidental: Accidental.Natural,
            })
          }
        >
          <EditorControlIcon icon={Icon.Natural} size={iconSize} />
        </button>
      </fieldset>
      <fieldset className={styles.controlGroup}>
        <legend>Rhythm</legend>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Whole,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Whole })
          }
        >
          {currentCommands.rest ? (
            <EditorControlIcon icon={Icon.WholeRest} size={iconSize} />
          ) : (
            <EditorControlIcon icon={Icon.WholeNote} size={iconSize} />
          )}
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Half,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Half })
          }
        >
          {currentCommands.rest ? (
            <EditorControlIcon icon={Icon.HalfRest} size={iconSize} />
          ) : (
            <EditorControlIcon icon={Icon.HalfNote} size={iconSize} />
          )}
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Quarter,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Quarter })
          }
        >
          {currentCommands.rest ? (
            <EditorControlIcon icon={Icon.QuarterRest} size={iconSize} />
          ) : (
            <EditorControlIcon icon={Icon.QuarterNote} size={iconSize} />
          )}
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Eighth,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Eighth })
          }
        >
          {currentCommands.rest ? (
            <EditorControlIcon icon={Icon.EighthRest} size={iconSize} />
          ) : (
            <EditorControlIcon icon={Icon.EighthNote} size={iconSize} />
          )}
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Sixteenth,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Sixteenth })
          }
        >
          {currentCommands.rest ? (
            <EditorControlIcon icon={Icon.SixteenthRest} size={iconSize} />
          ) : (
            <EditorControlIcon icon={Icon.SixteenthNote} size={iconSize} />
          )}
        </button>
        <div className={styles.spacer}></div>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.dotted,
          })}
          onClick={() => dispatchCommand({ type: "toggleDotted" })}
        >
          <EditorControlIcon icon={Icon.Dot} size={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rest,
          })}
          onClick={() => dispatchCommand({ type: "toggleRest" })}
        >
          <EditorControlIcon icon={Icon.QuarterRest} size={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.triplet,
          })}
          onClick={() => dispatchCommand({ type: "toggleTriplet" })}
        >
          <EditorControlIcon icon={Icon.Triplet} size={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.tied,
          })}
          onClick={() => dispatchCommand({ type: "toggleTied" })}
        >
          <EditorControlIcon icon={Icon.Tie} size={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.beamed,
          })}
          onClick={() => dispatchCommand({ type: "toggleBeamed" })}
          disabled={![8, 16].includes(currentCommands.rhythm)}
        >
          <EditorControlIcon icon={Icon.Beaming} size={iconSize} />
        </button>
      </fieldset>
      <fieldset className={styles.controlGroup}>
        <legend>Edit</legend>
        <button className={clsx(styles.iconButton)} onClick={onBackspace}>
          <EditorControlIcon icon={Icon.Backspace} size={iconSize} />
        </button>
        {!abcjsOptions?.lineBreaks && !abcjsOptions?.wrap && (
          <button className={clsx(styles.iconButton)} onClick={onNewLine}>
            <EditorControlIcon icon={Icon.NewLine} size={iconSize} />
          </button>
        )}
      </fieldset>
      <fieldset className={styles.controlGroup}>
        <legend>Input</legend>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.showKeyboard,
          })}
          onClick={() => dispatchCommand({ type: "toggleShowKeyboard" })}
        >
          <EditorControlIcon icon={Icon.Piano} size={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.midiEnabled,
          })}
          onClick={() => dispatchCommand({ type: "toggleMidi" })}
        >
          MIDI
        </button>
      </fieldset>
    </div>
  );
}
