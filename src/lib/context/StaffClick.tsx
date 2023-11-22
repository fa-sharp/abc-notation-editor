import { TuneObject } from "abcjs";
import { useCallback } from "react";
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

      /** Click listener for adding notes with the mouse */
      const staffClickListener = (e: PointerEvent) => {
        const convertStaffClickToNote = getStaffClickToNoteFn({
          clef: "treble",
          topLineY: topLine.getBoundingClientRect().y,
          lineGap:
            secondLine.getBoundingClientRect().y -
            topLine.getBoundingClientRect().y,
        });
        onAddNote(convertStaffClickToNote(e.clientY));
      };

      // Setup the cursor icon
      let showingCursor = false;
      const cursorIconDiv = document.createElement("div");
      const root = createRoot(cursorIconDiv);
      const iconSize = 36;
      const cursorTarget = renderDiv.parentElement!;

      /** Movement listener for showing & moving the cursor */
      const staffCursorListener = (e: PointerEvent) => {
        const cursorTargetRect = cursorTarget.getBoundingClientRect();
        const isMouseInsideStaff =
          e.clientX >= cursorTargetRect.left &&
          e.clientX <= cursorTargetRect.left + cursorTarget.clientWidth &&
          e.clientY >= cursorTargetRect.top &&
          e.clientY <= cursorTargetRect.top + cursorTarget.clientHeight;
        if (isMouseInsideStaff && showingCursor) {
          cursorIconDiv.style.top = `${e.clientY - (iconSize - 8)}px`;
          cursorIconDiv.style.left = `${e.clientX - iconSize / 2}px`;
        } else if (isMouseInsideStaff && !showingCursor) {
          showingCursor = true;
          Object.assign(cursorIconDiv.style, {
            position: "fixed",
            top: `${e.clientY - (iconSize - 8)}px`, // TODO adjust the icon position
            left: `${e.clientX - iconSize / 2}px`,
          });
          renderDiv.appendChild(cursorIconDiv);
          root.render(getIcon(rhythm, iconSize));
        } else if (!isMouseInsideStaff && showingCursor) {
          showingCursor = false;
          renderDiv.removeChild(cursorIconDiv);
        }
      };

      renderDiv.addEventListener("pointerdown", staffClickListener);
      window.addEventListener("pointermove", staffCursorListener);

      return () => {
        console.debug("Tearing down / setting up mouse click listeners");
        renderDiv.removeEventListener("pointerdown", staffClickListener);
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
