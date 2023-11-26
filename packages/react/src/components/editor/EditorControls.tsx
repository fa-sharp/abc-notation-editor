import clsx from "clsx";
import { Accidental, Rhythm } from "@abc-editor/core";
import { useEditorContext } from "../../context/EditorContext";

import DotIcon from "@icons/Dot.svg";
import EighthNoteIcon from "@icons/EighthNote.svg";
import EighthRestIcon from "@icons/EighthRest.svg";
import FlatIcon from "@icons/Flat.svg";
import HalfNoteIcon from "@icons/HalfNote.svg";
import HalfRestIcon from "@icons/HalfRest.svg";
import QuarterNoteIcon from "@icons/QuarterNote.svg";
import QuarterRestIcon from "@icons/QuarterRest.svg";
import SharpIcon from "@icons/Sharp.svg";
import SixteenthNoteIcon from "@icons/SixteenthNote.svg";
import SixteenthRestIcon from "@icons/SixteenthRest.svg";
import TripletIcon from "@icons/Triplet.svg";
import PianoIcon from "@icons/Piano.svg";

import styles from "./EditorControls.module.css";
import EditorControlIcon from "./EditorControlIcon";

export default function EditorControls() {
  const {
    currentCommands,
    dispatchCommand,
    onAddBarline,
    onAddLineBreak,
    onBackspace,
  } = useEditorContext();

  const iconSize = 20;

  return (
    <div className={styles.controls}>
      <fieldset className={styles.controlGroup}>
        <legend>Accidentals</legend>
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
          <EditorControlIcon src={FlatIcon} size={iconSize} />
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
          <EditorControlIcon src={SharpIcon} size={iconSize} />
        </button>
      </fieldset>
      <fieldset className={styles.controlGroup}>
        <legend>Rhythms</legend>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Half,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Half })
          }
          disabled={currentCommands.rhythm === Rhythm.Half}
        >
          {currentCommands.rest ? (
            <EditorControlIcon src={HalfRestIcon} size={iconSize} />
          ) : (
            <EditorControlIcon src={HalfNoteIcon} size={iconSize} />
          )}
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Quarter,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Quarter })
          }
          disabled={currentCommands.rhythm === Rhythm.Quarter}
        >
          {currentCommands.rest ? (
            <EditorControlIcon src={QuarterRestIcon} size={iconSize} />
          ) : (
            <EditorControlIcon src={QuarterNoteIcon} size={iconSize} />
          )}
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Eighth,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Eighth })
          }
          disabled={currentCommands.rhythm === Rhythm.Eighth}
        >
          {currentCommands.rest ? (
            <EditorControlIcon src={EighthRestIcon} size={iconSize} />
          ) : (
            <EditorControlIcon src={EighthNoteIcon} size={iconSize} />
          )}
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Sixteenth,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Sixteenth })
          }
          disabled={currentCommands.rhythm === Rhythm.Sixteenth}
        >
          {currentCommands.rest ? (
            <EditorControlIcon src={SixteenthRestIcon} size={iconSize} />
          ) : (
            <EditorControlIcon src={SixteenthNoteIcon} size={iconSize} />
          )}
        </button>
      </fieldset>
      <fieldset className={styles.controlGroup}>
        <legend>Toggles</legend>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.dotted,
          })}
          onClick={() => dispatchCommand({ type: "toggleDotted" })}
        >
          <EditorControlIcon src={DotIcon} size={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rest,
          })}
          onClick={() => dispatchCommand({ type: "toggleRest" })}
        >
          <EditorControlIcon src={QuarterRestIcon} size={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.triplet,
          })}
          onClick={() => dispatchCommand({ type: "toggleTriplet" })}
        >
          <EditorControlIcon src={TripletIcon} size={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.showKeyboard,
          })}
          onClick={() => dispatchCommand({ type: "toggleShowKeyboard" })}
        >
          <EditorControlIcon src={PianoIcon} size={iconSize} />
        </button>
      </fieldset>
      Beamed:{" "}
      <input
        type="checkbox"
        checked={currentCommands.beamed}
        onChange={() => dispatchCommand({ type: "toggleBeamed" })}
        disabled={![8, 16].includes(currentCommands.rhythm)}
      />
      <button onClick={onAddBarline}>Add bar</button>
      <button onClick={onAddLineBreak}>Add line</button>
      <button onClick={onBackspace}>Backspace</button>
    </div>
  );
}
