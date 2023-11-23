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
    c4MajorDegrees(
      clef === "treble"
        ? degrees > -11
          ? degrees + 11
          : degrees + 10
        : degrees - 2 // TODO fix bass clef here
    );

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
        const topStaffLineY = topLine.getBoundingClientRect().y;
        const staffLineGap =
          secondLine.getBoundingClientRect().y - topStaffLineY;
        const convertStaffClickToNote = getStaffClickToNoteFn({
          clef: "treble",
          topLineY: topStaffLineY,
          lineGap: staffLineGap,
        });
        onAddNote(convertStaffClickToNote(e.clientY));
      };

      // Setup the cursor icon
      let showingCursor = false;
      const cursorIconDiv = document.createElement("div");
      cursorIconDiv.style.position = "fixed";
      const root = createRoot(cursorIconDiv);
      const iconSize = 36;
      const cursorTarget = renderDiv.parentElement!;
      const ledgerLineDivs: HTMLDivElement[] = [];

      /** Movement listener for showing & moving the cursor */
      const staffCursorListener = (e: PointerEvent) => {
        ledgerLineDivs.forEach((div) => div.remove());
        const cursorTargetRect = cursorTarget.getBoundingClientRect();
        const isMouseInsideStaff =
          e.clientX >= cursorTargetRect.left &&
          e.clientX <= cursorTargetRect.left + cursorTarget.clientWidth &&
          e.clientY >= cursorTargetRect.top &&
          e.clientY <= cursorTargetRect.top + cursorTarget.clientHeight;

        if (isMouseInsideStaff) {
          // Move the cursor
          cursorIconDiv.style.top = `${
            e.clientY - (iconSize - iconSize / 5)
          }px`;
          cursorIconDiv.style.left = `${e.clientX - iconSize / 2}px`;

          // Draw ledger lines if needed
          const topStaffLineY = topLine.getBoundingClientRect().y;
          const staffLineGap =
            secondLine.getBoundingClientRect().y - topStaffLineY;
          const bottomStaffLineY = topStaffLineY + staffLineGap * 4;
          const drawAnticipation = 4;

          // Ledger lines above staff
          if (e.clientY < topStaffLineY) {
            for (
              let y = topStaffLineY - staffLineGap;
              y >= e.clientY - drawAnticipation;
              y -= staffLineGap
            ) {
              const ledgerDiv = document.createElement("div");
              Object.assign(ledgerDiv.style, {
                position: "fixed",
                top: `${y}px`,
                left: `${e.clientX - 10}px`,
                height: "1px",
                width: "16px",
                backgroundColor: "#000",
              });
              ledgerLineDivs.push(ledgerDiv);
              renderDiv.appendChild(ledgerDiv);
            }
          }
          // Ledger lines below staff
          if (e.clientY > bottomStaffLineY) {
            for (
              let y = bottomStaffLineY + staffLineGap;
              y <= e.clientY + drawAnticipation;
              y += staffLineGap
            ) {
              const ledgerDiv = document.createElement("div");
              Object.assign(ledgerDiv.style, {
                position: "fixed",
                top: `${y}px`,
                left: `${e.clientX - 10}px`,
                height: "1px",
                width: "16px",
                backgroundColor: "#000",
              });
              ledgerLineDivs.push(ledgerDiv);
              renderDiv.appendChild(ledgerDiv);
            }
          }
        }
        if (isMouseInsideStaff && !showingCursor) {
          showingCursor = true;
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
