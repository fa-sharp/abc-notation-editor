import clsx from "clsx";
import { MdOutlinePiano } from "react-icons/md";
import { Accidental } from "~src/core/types/constants";
import { useEditorContext } from "../../context/EditorContext";

import DotIcon from "jsx:~icons/Dot.svg";
import EighthNoteIcon from "jsx:~icons/EighthNote.svg";
import FlatIcon from "jsx:~icons/Flat.svg";
import HalfNoteIcon from "jsx:~icons/HalfNote.svg";
import QuarterNoteIcon from "jsx:~icons/QuarterNote.svg";
import SharpIcon from "jsx:~icons/Sharp.svg";
import SixteenthNoteIcon from "jsx:~icons/SixteenthNote.svg";
import ToggleRestIcon from "jsx:~icons/ToggleRest.svg";

import * as styles from "./EditorControls.module.css";

export default function EditorControls() {
  const {
    currentRhythm,
    currentAccidental,
    isBeamed,
    isDotted,
    isRest,
    showKeyboard,
    onToggleShowKeyboard,
    onToggleRest,
    onToggleDotted,
    setBeamed,
    changeRhythm,
    onAddBarline,
    onAddLineBreak,
    onSetAccidental,
    onBackspace,
  } = useEditorContext();

  return (
    <div className={styles.controls}>
      <fieldset className={styles.controlGroup}>
        <legend>Accidentals</legend>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentAccidental === Accidental.Flat,
          })}
          onClick={() =>
            onSetAccidental(
              currentAccidental === Accidental.Flat
                ? Accidental.None
                : Accidental.Flat
            )
          }
        >
          <FlatIcon height={28} width={28} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentAccidental === Accidental.Sharp,
          })}
          onClick={() =>
            onSetAccidental(
              currentAccidental === Accidental.Sharp
                ? Accidental.None
                : Accidental.Sharp
            )
          }
        >
          <SharpIcon height={28} width={28} />
        </button>
      </fieldset>
      <fieldset className={styles.controlGroup}>
        <legend>Rhythms</legend>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentRhythm === 2,
          })}
          onClick={() => changeRhythm(2)}
          disabled={currentRhythm === 2}
        >
          <HalfNoteIcon height={28} width={28} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentRhythm === 4,
          })}
          onClick={() => changeRhythm(4)}
          disabled={currentRhythm === 4}
        >
          <QuarterNoteIcon height={28} width={28} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentRhythm === 8,
          })}
          onClick={() => changeRhythm(8)}
          disabled={currentRhythm === 8}
        >
          <EighthNoteIcon height={28} width={28} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentRhythm === 16,
          })}
          onClick={() => changeRhythm(16)}
          disabled={currentRhythm === 16}
        >
          <SixteenthNoteIcon height={28} width={28} />
        </button>
      </fieldset>
      <fieldset className={styles.controlGroup}>
        <legend>Toggles</legend>
        <button
          className={clsx(styles.iconButton, { [styles.selected]: isDotted })}
          onClick={onToggleDotted}
        >
          <DotIcon height={28} width={28} />
        </button>
        <button
          className={clsx(styles.iconButton, { [styles.selected]: isRest })}
          onClick={onToggleRest}
        >
          <ToggleRestIcon height={28} width={28} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: showKeyboard,
          })}
          onClick={onToggleShowKeyboard}
        >
          <MdOutlinePiano size={28} />
        </button>
      </fieldset>
      Beamed:{" "}
      <input
        type="checkbox"
        checked={isBeamed}
        onChange={() => setBeamed((prev) => !prev)}
        disabled={![8, 16].includes(currentRhythm)}
      />
      <button onClick={onAddBarline}>Add bar</button>
      <button onClick={onAddLineBreak}>Add line</button>
      <button onClick={onBackspace}>Backspace</button>
    </div>
  );
}
