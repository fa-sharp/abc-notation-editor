import { Scale } from "tonal";
import { Rhythm } from "../types/constants";

import EighthNoteIcon from "bundle-text:~icons/EighthNote.svg";
import HalfNoteIcon from "bundle-text:~icons/HalfNote.svg";
import QuarterNoteIcon from "bundle-text:~icons/QuarterNote.svg";
import SixteenthNoteIcon from "bundle-text:~icons/SixteenthNote.svg";

/**
 * Sets up listeners for tracking and responding to the mouse movements and clicks
 * on the staff. Returns a cleanup function to remove the listeners.
 */
export const setupStaffListeners = (
  renderDiv: HTMLDivElement,
  numTuneLines: number,
  rhythm: Rhythm,
  onAddNote: (note: string) => void
) => {
  const topStaffLine = renderDiv.querySelector<SVGPathElement>(
    `.abcjs-l${numTuneLines - 1} .abcjs-top-line`
  );
  const secondStaffLine = topStaffLine?.nextSibling as SVGPathElement;
  if (!topStaffLine || !secondStaffLine) return;

  /** Click listener for adding notes with the mouse */
  const staffClickListener = (e: PointerEvent) => {
    const topStaffLineY = topStaffLine.getBoundingClientRect().y;
    const staffLineGap =
      secondStaffLine.getBoundingClientRect().y - topStaffLineY;
    const convertStaffClickToNote = getStaffClickToNoteFn({
      clef: "treble",
      topLineY: topStaffLineY,
      lineGap: staffLineGap,
    });
    onAddNote(convertStaffClickToNote(e.clientY));
  };

  // Setup the cursor icon for the staff
  let showingCursor = false;
  const iconSize = 32;
  const cursorIconDiv = getCursorIcon(rhythm, iconSize);
  const staffOuterElement = renderDiv.parentElement!;
  const ledgerLineDivs: HTMLDivElement[] = [];

  /** Movement listener for showing & moving the cursor */
  const staffCursorListener = (e: PointerEvent) => {
    ledgerLineDivs.forEach((div) => div.remove());

    const cursorTargetRect = staffOuterElement.getBoundingClientRect();
    const isMouseInsideStaff =
      e.clientX >= cursorTargetRect.left &&
      e.clientX <= cursorTargetRect.left + staffOuterElement.clientWidth &&
      e.clientY >= cursorTargetRect.top &&
      e.clientY <= cursorTargetRect.top + staffOuterElement.clientHeight;

    if (isMouseInsideStaff) {
      // Move the cursor
      cursorIconDiv.style.top = `${e.clientY - (iconSize - iconSize / 5)}px`;
      cursorIconDiv.style.left = `${e.clientX - iconSize / 2}px`;

      // Draw ledger lines if needed
      const topStaffLineY = topStaffLine.getBoundingClientRect().y;
      const staffLineGap =
        secondStaffLine.getBoundingClientRect().y - topStaffLineY;
      const bottomStaffLineY = topStaffLineY + staffLineGap * 4;
      const maxLedgerDistance = staffLineGap * 6;
      const drawLedgerAnticipation = 3;

      // Ledger lines above staff
      if (
        e.clientY < topStaffLineY &&
        e.clientY > topStaffLineY - maxLedgerDistance
      ) {
        for (
          let y = topStaffLineY - staffLineGap;
          y >= e.clientY - drawLedgerAnticipation;
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
      if (
        e.clientY > bottomStaffLineY &&
        e.clientY < bottomStaffLineY + maxLedgerDistance
      ) {
        for (
          let y = bottomStaffLineY + staffLineGap;
          y <= e.clientY + drawLedgerAnticipation;
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
    } else if (!isMouseInsideStaff && showingCursor) {
      showingCursor = false;
      renderDiv.removeChild(cursorIconDiv);
    }
  };

  console.debug("Setting up mouse click listeners");
  renderDiv.addEventListener("pointerdown", staffClickListener);
  window.addEventListener("pointermove", staffCursorListener);

  return () => {
    console.debug("Tearing down mouse click listeners");
    renderDiv.removeEventListener("pointerdown", staffClickListener);
    window.removeEventListener("pointermove", staffCursorListener);
  };
};

const getNoteFromC4MajorDegree = Scale.degrees("C4 major");

/**
 * Generate a function which will turn the mouse click's Y coordinate into a note. It estimates
 * the number of scale degrees we're away from the top staff line, and returns the corresponding
 * note from the C Major scale.
 */
function getStaffClickToNoteFn(props: {
  clef: "bass" | "treble";
  /** Distance from one staff line to the next */
  lineGap: number;
  /** Y coordinate of the top staff line */
  topLineY: number;
}) {
  const getNoteFromDegrees = (degrees: number) =>
    getNoteFromC4MajorDegree(
      props.clef === "treble"
        ? degrees > -11
          ? degrees + 11
          : degrees + 10
        : degrees - 2 // TODO fix bass clef here
    );
  return (y: number) => {
    const distanceFromTopLine = props.topLineY - y;
    const estimatedDegreesFromTopLine = Math.round(
      distanceFromTopLine / (props.lineGap / 2)
    );
    return getNoteFromDegrees(estimatedDegreesFromTopLine);
  };
}

function getCursorIcon(rhythm: Rhythm, size = 36) {
  let svg: string | null;
  switch (rhythm) {
    case Rhythm.Eighth:
      svg = EighthNoteIcon;
      break;
    case Rhythm.Whole:
      svg = null;
      break;
    case Rhythm.Half:
      svg = HalfNoteIcon;
      break;
    case Rhythm.Quarter:
      svg = QuarterNoteIcon;
      break;
    case Rhythm.Sixteenth:
      svg = SixteenthNoteIcon;
      break;
  }
  const div = document.createElement("div");
  div.style.position = "fixed";
  if (svg) {
    div.innerHTML = svg;
    const svgEl = div.querySelector("svg");
    if (svgEl) {
      svgEl.style.height = `${size}px`;
      svgEl.style.width = `${size}px`;
    }
  }
  return div;
}
