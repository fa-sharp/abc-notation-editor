import clsx from "clsx";
import { Accidental, Rhythm } from "~src/core/types/constants";
import { useEditorContext } from "../../context/EditorContext";

import DotIcon from "jsx:~icons/Dot.svg";
import EighthNoteIcon from "jsx:~icons/EighthNote.svg";
import EighthRestIcon from "jsx:~icons/EighthRest.svg";
import FlatIcon from "jsx:~icons/Flat.svg";
import HalfNoteIcon from "jsx:~icons/HalfNote.svg";
import HalfRestIcon from "jsx:~icons/HalfRest.svg";
import QuarterNoteIcon from "jsx:~icons/QuarterNote.svg";
import QuarterRestIcon from "jsx:~icons/QuarterRest.svg";
import SharpIcon from "jsx:~icons/Sharp.svg";
import SixteenthNoteIcon from "jsx:~icons/SixteenthNote.svg";
import SixteenthRestIcon from "jsx:~icons/SixteenthRest.svg";
import TripletIcon from "jsx:~icons/Triplet.svg";
import PianoIcon from "jsx:~icons/Piano.svg";

import * as styles from "./EditorControls.module.css";

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
          <FlatIcon height={iconSize} width={iconSize} />
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
          <SharpIcon height={iconSize} width={iconSize} />
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
            <HalfRestIcon height={iconSize} width={iconSize} />
          ) : (
            <HalfNoteIcon height={iconSize} width={iconSize} />
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
            <QuarterRestIcon height={iconSize} width={iconSize} />
          ) : (
            <QuarterNoteIcon height={iconSize} width={iconSize} />
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
            <EighthRestIcon height={iconSize} width={iconSize} />
          ) : (
            <EighthNoteIcon height={iconSize} width={iconSize} />
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
            <SixteenthRestIcon height={iconSize} width={iconSize} />
          ) : (
            <SixteenthNoteIcon height={iconSize} width={iconSize} />
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
          <DotIcon height={iconSize} width={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rest,
          })}
          onClick={() => dispatchCommand({ type: "toggleRest" })}
        >
          <QuarterRestIcon height={iconSize} width={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.triplet,
          })}
          onClick={() => dispatchCommand({ type: "toggleTriplet" })}
        >
          <TripletIcon height={iconSize} width={iconSize} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.showKeyboard,
          })}
          onClick={() => dispatchCommand({ type: "toggleShowKeyboard" })}
        >
          <PianoIcon height={iconSize} width={iconSize} />
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
