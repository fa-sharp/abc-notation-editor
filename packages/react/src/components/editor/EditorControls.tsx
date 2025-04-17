import { Accidental, Rhythm } from "@abc-editor/core";
import clsx from "clsx";
import { useEditorContext } from "../../context/EditorContext";
import EditorControlIcon from "./EditorControlIcon";

import { useMemo } from "react";
import styles from "./EditorControls.module.css";
import EditorControlsMenu from "./EditorControlsMenu";

export default function EditorControls() {
  const {
    currentCommands,
    abcjsOptions,
    dispatchCommand,
    onBackspace,
    onNewLine,
    onChangeAccidental,
    onToggleBeaming,
    onToggleDecoration,
    onToggleTie,
    history,
    onUndo,
    onRedo,
    selectedNote,
  } = useEditorContext();

  const iconSize = 18;

  const accidentalControls = useMemo(
    () =>
      (["flat", "sharp", "natural"] as const).map((accidental) => ({
        label: accidental,
        checked: selectedNote?.data?.accidental === accidental,
        disabled: !selectedNote?.data || !!selectedNote.data?.rest,
        icon: accidental,
        onClick: () =>
          onChangeAccidental(
            selectedNote?.data?.accidental === accidental
              ? Accidental.None
              : accidental,
          ),
      })),
    [onChangeAccidental, selectedNote?.data],
  );

  const decorationControls = useMemo(
    () =>
      (["accent", "trill", "staccato", "tenuto"] as const).map(
        (decoration) => ({
          label: decoration,
          checked: !!selectedNote?.data?.decorations?.includes(decoration),
          disabled: !selectedNote?.data || !!selectedNote.data?.rest,
          icon: decoration,
          onClick: () => onToggleDecoration(decoration),
        }),
      ),
    [onToggleDecoration, selectedNote?.data],
  );

  return (
    <div className={styles.controls}>
      <fieldset className={styles.controlGroup}>
        <legend>Note entry</legend>
        <button
          title="Flat"
          role="switch"
          aria-checked={currentCommands.accidental === Accidental.Flat}
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
          <EditorControlIcon icon="flat" size={iconSize} />
        </button>
        <button
          title="Sharp"
          role="switch"
          aria-checked={currentCommands.accidental === Accidental.Sharp}
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
          <EditorControlIcon icon="sharp" size={iconSize} />
        </button>
        <button
          title="Natural"
          role="switch"
          aria-checked={currentCommands.accidental === Accidental.Natural}
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
          <EditorControlIcon icon="natural" size={iconSize} />
        </button>
        <div className={styles.spacer}></div>
        <button
          title="Whole note"
          role="switch"
          aria-checked={currentCommands.rhythm === Rhythm.Whole}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Whole,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Whole })
          }
        >
          {currentCommands.rest ? (
            <EditorControlIcon icon="wholeRest" size={iconSize} />
          ) : (
            <EditorControlIcon icon="wholeNote" size={iconSize} />
          )}
        </button>
        <button
          title="Half note"
          role="switch"
          aria-checked={currentCommands.rhythm === Rhythm.Half}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Half,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Half })
          }
        >
          {currentCommands.rest ? (
            <EditorControlIcon icon="halfRest" size={iconSize} />
          ) : (
            <EditorControlIcon icon="halfNote" size={iconSize} />
          )}
        </button>
        <button
          title="Quarter note"
          role="switch"
          aria-checked={currentCommands.rhythm === Rhythm.Quarter}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Quarter,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Quarter })
          }
        >
          {currentCommands.rest ? (
            <EditorControlIcon icon="quarterRest" size={iconSize} />
          ) : (
            <EditorControlIcon icon="quarterNote" size={iconSize} />
          )}
        </button>
        <button
          title="Eighth note"
          role="switch"
          aria-checked={currentCommands.rhythm === Rhythm.Eighth}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Eighth,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Eighth })
          }
        >
          {currentCommands.rest ? (
            <EditorControlIcon icon="eighthRest" size={iconSize} />
          ) : (
            <EditorControlIcon icon="eighthNote" size={iconSize} />
          )}
        </button>
        <button
          title="Sixteenth note"
          role="switch"
          aria-checked={currentCommands.rhythm === Rhythm.Sixteenth}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rhythm === Rhythm.Sixteenth,
          })}
          onClick={() =>
            dispatchCommand({ type: "setRhythm", rhythm: Rhythm.Sixteenth })
          }
        >
          {currentCommands.rest ? (
            <EditorControlIcon icon="sixteenthRest" size={iconSize} />
          ) : (
            <EditorControlIcon icon="sixteenthNote" size={iconSize} />
          )}
        </button>
        <div className={styles.spacer}></div>
        <button
          title="Toggle dotted note"
          role="switch"
          aria-checked={currentCommands.dotted}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.dotted,
          })}
          onClick={() => dispatchCommand({ type: "toggleDotted" })}
        >
          <EditorControlIcon icon="dot" size={iconSize} />
        </button>
        <button
          title="Toggle rest"
          role="switch"
          aria-checked={currentCommands.rest}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.rest,
          })}
          onClick={() => dispatchCommand({ type: "toggleRest" })}
        >
          <EditorControlIcon icon="quarterRest" size={iconSize} />
        </button>
        <button
          title="Toggle triplet"
          role="switch"
          aria-checked={currentCommands.triplet}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.triplet,
          })}
          onClick={() => dispatchCommand({ type: "toggleTriplet" })}
        >
          <EditorControlIcon icon="triplet" size={iconSize} />
        </button>
        <button
          title="Toggle tied note"
          role="switch"
          aria-checked={currentCommands.tied}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.tied,
          })}
          onClick={() => dispatchCommand({ type: "toggleTied" })}
        >
          <EditorControlIcon icon="tie" size={iconSize} />
        </button>
        <button
          title="Toggle beamed note"
          role="switch"
          aria-checked={currentCommands.beamed}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.beamed,
          })}
          onClick={() => dispatchCommand({ type: "toggleBeamed" })}
          disabled={![8, 16].includes(currentCommands.rhythm)}
        >
          <EditorControlIcon icon="beaming" size={iconSize} />
        </button>
      </fieldset>
      <fieldset className={styles.controlGroup}>
        <legend>Edit</legend>
        <EditorControlsMenu
          label="Open accidentals"
          controls={accidentalControls}
        />
        <EditorControlsMenu
          label="Open articulations"
          controls={decorationControls}
        />
        <button
          title="Toggle tied note"
          role="switch"
          aria-checked={selectedNote?.data?.tied}
          className={clsx(styles.iconButton, {
            [styles.selected]: selectedNote?.data?.tied,
          })}
          disabled={!selectedNote?.data || selectedNote.data.rest}
          onClick={onToggleTie}
        >
          <EditorControlIcon icon="tie" size={iconSize} />
        </button>
        <button
          title="Toggle beamed note"
          role="switch"
          aria-checked={selectedNote?.data?.beamed}
          className={clsx(styles.iconButton, {
            [styles.selected]: selectedNote?.data?.beamed,
          })}
          onClick={onToggleBeaming}
          disabled={
            !selectedNote?.data?.rhythm ||
            selectedNote.data.rest ||
            ![8, 16].includes(selectedNote.data.rhythm) ||
            selectedNote.data.beamed === undefined
          }
        >
          <EditorControlIcon icon="beaming" size={iconSize} />
        </button>
        <div className={styles.spacer}></div>
        <button
          title="Backspace"
          className={clsx(styles.iconButton)}
          onClick={onBackspace}
        >
          <EditorControlIcon icon="backspace" size={iconSize} />
        </button>
        {!abcjsOptions?.lineBreaks && !abcjsOptions?.wrap && (
          <button
            title="New line"
            className={clsx(styles.iconButton)}
            onClick={onNewLine}
          >
            <EditorControlIcon icon="newLine" size={iconSize} />
          </button>
        )}
        <button
          title="Undo"
          className={clsx(styles.iconButton)}
          disabled={!history.canUndo}
          onClick={onUndo}
        >
          <EditorControlIcon icon="undo" size={iconSize} />
        </button>
        <button
          title="Redo"
          className={clsx(styles.iconButton)}
          disabled={!history.canRedo}
          onClick={onRedo}
        >
          <EditorControlIcon icon="redo" size={iconSize} />
        </button>
      </fieldset>
      <fieldset className={styles.controlGroup}>
        <legend>Input</legend>
        <button
          title="Toggle visual keyboard"
          role="switch"
          aria-checked={currentCommands.showKeyboard}
          className={clsx(styles.iconButton, {
            [styles.selected]: currentCommands.showKeyboard,
          })}
          onClick={() => dispatchCommand({ type: "toggleShowKeyboard" })}
        >
          <EditorControlIcon icon="piano" size={iconSize} />
        </button>
        <button
          title="Toggle MIDI input"
          role="switch"
          aria-checked={currentCommands.midiEnabled}
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
