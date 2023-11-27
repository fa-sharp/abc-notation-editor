import clsx from "clsx";
import { Accidental, Rhythm } from "@abc-editor/core";
import { useEditorContext } from "../../context/EditorContext";

import BeamingIcon from "@icons/Beaming.svg?raw";
import DotIcon from "@icons/Dot.svg?raw";
import EighthNoteIcon from "@icons/EighthNote.svg?raw";
import EighthRestIcon from "@icons/EighthRest.svg?raw";
import FlatIcon from "@icons/Flat.svg?raw";
import HalfNoteIcon from "@icons/HalfNote.svg?raw";
import HalfRestIcon from "@icons/HalfRest.svg?raw";
import QuarterNoteIcon from "@icons/QuarterNote.svg?raw";
import QuarterRestIcon from "@icons/QuarterRest.svg?raw";
import SharpIcon from "@icons/Sharp.svg?raw";
import SixteenthNoteIcon from "@icons/SixteenthNote.svg?raw";
import SixteenthRestIcon from "@icons/SixteenthRest.svg?raw";
import TripletIcon from "@icons/Triplet.svg?raw";
import PianoIcon from "@icons/Piano.svg?raw";

import styles from "./EditorControls.module.css";
import EditorControlIcon from "./EditorControlIcon";

export default function EditorControls() {
  const { currentCommands, dispatchCommand, onBackspace } = useEditorContext();

  const iconSize = 20;

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
        <legend>Rhythm</legend>
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
        <div className={styles.spacer}></div>
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
            [styles.selected]: currentCommands.beamed,
          })}
          onClick={() => dispatchCommand({ type: "toggleBeamed" })}
          disabled={![8, 16].includes(currentCommands.rhythm)}
        >
          <EditorControlIcon src={BeamingIcon} size={iconSize} />
        </button>
      </fieldset>
      <fieldset className={styles.controlGroup}>
        <legend>Toggles</legend>

        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.showKeyboard,
          })}
          onClick={() => dispatchCommand({ type: "toggleShowKeyboard" })}
        >
          <EditorControlIcon src={PianoIcon} size={iconSize} />
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
      <button onClick={onBackspace}>Backspace</button>
    </div>
  );
}
