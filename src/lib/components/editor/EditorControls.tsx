import { useEditorContext } from "~src/lib/context/EditorContext";

import HalfNoteIcon from "~src/lib/icons/HalfNote.svg";
import QuarterNoteIcon from "~src/lib/icons/QuarterNote.svg";
import EighthNoteIcon from "~src/lib/icons/EighthNote.svg";
import SixteenthNoteIcon from "~src/lib/icons/SixteenthNote.svg";
import DotIcon from "~src/lib/icons/Dot.svg";
import ToggleRestIcon from "~src/lib/icons/ToggleRest.svg";
import FlatIcon from "~src/lib/icons/Flat.svg";
import SharpIcon from "~src/lib/icons/Sharp.svg";

import * as styles from "./EditorControls.module.css";
import clsx from "clsx";

export default function EditorControls() {
  const {
    currentRhythm,
    currentAccidental,
    isBeamed,
    isDotted,
    isRest,
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
      <div className={styles.controlGroup}>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentAccidental === "flat",
          })}
          onClick={() =>
            onSetAccidental(currentAccidental === "flat" ? "none" : "flat")
          }
        >
          <FlatIcon height={28} width={28} />
        </button>
        <button
          className={clsx(styles.iconButton, {
            [styles.selected]: currentAccidental === "sharp",
          })}
          onClick={() =>
            onSetAccidental(currentAccidental === "sharp" ? "none" : "sharp")
          }
        >
          <SharpIcon height={28} width={28} />
        </button>
      </div>
      <div className={styles.controlGroup}>
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
      </div>
      <div className={styles.controlGroup}>
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
      </div>
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
