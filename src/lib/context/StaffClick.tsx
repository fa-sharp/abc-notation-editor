import { TuneObject } from "abcjs";
import { useCallback } from "react";
import { Scale } from "tonal";
import { createRoot } from "react-dom/client";
import { Rhythm } from "./EditorContext";

import HalfNoteIcon from "~src/lib/icons/HalfNote.svg";
import QuarterNoteIcon from "~src/lib/icons/QuarterNote.svg";
import EighthNoteIcon from "~src/lib/icons/EighthNote.svg";
import SixteenthNoteIcon from "~src/lib/icons/SixteenthNote.svg";

interface StaffInfo {
  /** Distance between two staff lines */
  lineGap: number;
  /** Y coordinate of the top staff line */
  topLineY: number;
  clef: "bass" | "treble";
}

const c4MajorDegrees = Scale.degrees("C4 major");

const getStaffClickToNoteFn = ({ lineGap, topLineY, clef }: StaffInfo) => {
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

      // Staff click listener for adding notes
      const convertStaffClickToNote = getStaffClickToNoteFn({
        clef: "treble",
        topLineY: topLine.getBoundingClientRect().y,
        lineGap:
          secondLine.getBoundingClientRect().y -
          topLine.getBoundingClientRect().y,
      });
      const staffClickListener = (e: MouseEvent) => {
        onAddNote(convertStaffClickToNote(e.clientY));
      };

      // Movement listeners for the icon cursor
      const cursorIconDiv = document.createElement("div");
      const root = createRoot(cursorIconDiv);
      const iconSize = 36;
      const mouseEnterListener = (e: MouseEvent) => {
        Object.assign(cursorIconDiv.style, {
          position: "fixed",
          top: `${e.clientY - (iconSize - 8)}px`,
          left: `${e.clientX - iconSize / 2}px`,
        });
        renderDiv.appendChild(cursorIconDiv);
        root.render(getIcon(rhythm, iconSize));
      };
      const mouseMoveListener = (e: MouseEvent) => {
        cursorIconDiv.style.top = `${e.clientY - (iconSize - 8)}px`;
        cursorIconDiv.style.left = `${e.clientX - iconSize / 2}px`;
      };
      const mouseLeaveListener = () => {
        console.log("Removing cursor icon...", { renderDiv, cursorIconDiv });
        renderDiv.removeChild(cursorIconDiv);
      };

      renderDiv.addEventListener("mousedown", staffClickListener);
      renderDiv.addEventListener("mousemove", mouseMoveListener);
      renderDiv.addEventListener("mouseleave", mouseLeaveListener);
      renderDiv.addEventListener("mouseenter", mouseEnterListener);

      return () => {
        console.log("Setting up event listeners");
        renderDiv.removeEventListener("mousedown", staffClickListener);
        renderDiv.removeEventListener("mousemove", mouseMoveListener);
        renderDiv.removeEventListener("mouseleave", mouseLeaveListener);
        renderDiv.removeEventListener("mouseenter", mouseEnterListener);
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
