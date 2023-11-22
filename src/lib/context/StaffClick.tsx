import { TuneObject } from "abcjs";
import { useCallback, useState } from "react";
import { Scale } from "tonal";
import { createRoot } from "react-dom/client";
import { Rhythm } from "./EditorContext";

import HalfNoteIcon from "~src/lib/icons/HalfNote.svg";
import QuarterNoteIcon from "~src/lib/icons/QuarterNote.svg";
import EighthNoteIcon from "~src/lib/icons/EighthNote.svg";
import SixteenthNoteIcon from "~src/lib/icons/SixteenthNote.svg";

const c4MajorDegrees = Scale.degrees("C4 major");

/** Generate a function that will turn the mouse click's Y coordinate into a note. */
const getStaffClickToNoteFn = ({
  lineGap,
  topLineY,
  clef,
}: {
  clef: "bass" | "treble";
  /** Distance between two staff lines */
  lineGap: number;
  /** Y coordinate of the top staff line */
  topLineY: number;
}) => {
  const getNoteFromDegrees = (degrees: number) =>
    c4MajorDegrees(clef === "treble" ? degrees + 11 : degrees - 2);

  return (y: number) => {
    const distanceFromTopLine = topLineY - y;
    const estimatedDegreesFromTopLine = Math.round(
      distanceFromTopLine / (lineGap / 2)
    );
    return getNoteFromDegrees(estimatedDegreesFromTopLine);
  };
};

export const useStaffListeners = ({
  rhythm,
  onAddNote,
}: {
  rhythm: Rhythm;
  onAddNote: (note: string) => void;
}) => {
  /**
   * Sets up listeners for tracking and responding to the mouse movements and clicks
   * on the staff. Returns a cleanup function.
   */
  const setupStaffListeners = useCallback(
    (renderDiv: HTMLDivElement, tuneObject: TuneObject) => {
      const topLine = renderDiv.querySelector(
        `.abcjs-l${tuneObject.lines.length - 1} .abcjs-top-line`
      ) as SVGPathElement | undefined;
      const secondLine = topLine?.nextSibling as SVGPathElement | undefined;
      if (!topLine || !secondLine) return;

      const convertStaffClickToNote = getStaffClickToNoteFn({
        clef: "treble",
        topLineY: topLine.getBoundingClientRect().y,
        lineGap:
          secondLine.getBoundingClientRect().y -
          topLine.getBoundingClientRect().y,
      });

      const renderDivRect = renderDiv.getBoundingClientRect();
      const checkMouseInsideStaff = (e: PointerEvent) =>
        e.clientX >= renderDivRect.left &&
        e.clientX <= renderDivRect.right &&
        e.clientY >= renderDivRect.top &&
        e.clientY <= renderDivRect.bottom;

      // Click listener for adding notes with the mouse
      const staffClickListener = (e: PointerEvent) => {
        if (!checkMouseInsideStaff(e)) return;
        onAddNote(convertStaffClickToNote(e.clientY));
      };

      // Movement listeners for showing the note cursor
      let showingCursor = false;
      const cursorIconDiv = document.createElement("div");
      const root = createRoot(cursorIconDiv);
      const iconSize = 36;

      const staffCursorListener = (e: PointerEvent) => {
        const isMouseInsideStaff = checkMouseInsideStaff(e);
        if (isMouseInsideStaff && !showingCursor) {
          showingCursor = true;
          Object.assign(cursorIconDiv.style, {
            position: "fixed",
            top: `${e.clientY - (iconSize - 8)}px`,
            left: `${e.clientX - iconSize / 2}px`,
          });
          renderDiv.appendChild(cursorIconDiv);
          root.render(getIcon(rhythm, iconSize));
        } else if (!isMouseInsideStaff && showingCursor) {
          showingCursor = false;
          renderDiv.removeChild(cursorIconDiv);
        }
        cursorIconDiv.style.top = `${e.clientY - (iconSize - 8)}px`;
        cursorIconDiv.style.left = `${e.clientX - iconSize / 2}px`;
      };

      renderDiv.style.cursor = "none"; // disable regular cursor on the staff
      window.addEventListener("pointerdown", staffClickListener);
      window.addEventListener("pointermove", staffCursorListener);

      return () => {
        console.debug("Tearing down / setting up mouse click listeners");
        window.removeEventListener("pointerdown", staffClickListener);
        window.removeEventListener("pointermove", staffCursorListener);
      };
    },
    [onAddNote, rhythm]
  );

  return {
    setupStaffListeners,
  };
};

function getIcon(rhythm: Rhythm, size = 36) {
  switch (rhythm) {
    case Rhythm.Eighth:
      return <EighthNoteIcon height={size} width={size} />;
    case Rhythm.Whole:
      return null;
    case Rhythm.Half:
      return <HalfNoteIcon height={size} width={size} />;
    case Rhythm.Quarter:
      return <QuarterNoteIcon height={size} width={size} />;
    case Rhythm.Sixteenth:
      return <SixteenthNoteIcon height={size} width={size} />;
  }
}
