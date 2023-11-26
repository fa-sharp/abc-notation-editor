import { Scale } from "tonal";
import { Rhythm } from "../types/constants";

import EighthNoteIcon from "@icons/EighthNote.svg";
import HalfNoteIcon from "@icons/HalfNote.svg";
import QuarterNoteIcon from "@icons/QuarterNote.svg";
import SixteenthNoteIcon from "@icons/SixteenthNote.svg";

import EighthRestIcon from "@icons/EighthRest.svg";
import HalfRestIcon from "@icons/HalfRest.svg";
import QuarterRestIcon from "@icons/QuarterRest.svg";
import SixteenthRestIcon from "@icons/SixteenthRest.svg";

const ledgerLineStyle = Object.freeze({
  position: "fixed",
  height: "1px",
  width: "16px",
  backgroundColor: "#000",
});

/** Last known mouse position inside staff */
let lastMousePos: {
  clientX: number;
  clientY: number;
} | null = null;

/**
 * Sets up listeners for tracking and responding to the mouse movements and clicks
 * on the staff. Returns a cleanup function to remove the listeners.
 */
export const setupStaffMouseListeners = ({
  renderDiv,
  numTuneLines,
  rhythm,
  rest = false,
  onAddNote,
}: {
  renderDiv: HTMLDivElement;
  numTuneLines: number;
  rhythm: Rhythm;
  rest?: boolean;
  onAddNote: (note: string) => void;
}) => {
  const topStaffLine = renderDiv.querySelector<SVGPathElement>(
    `.abcjs-l${numTuneLines - 1} .abcjs-top-line`
  );
  const secondStaffLine = topStaffLine?.nextSibling as SVGPathElement;
  if (!topStaffLine || !secondStaffLine) return () => {};

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
  const cursorIconDiv = getCursorIcon({ rhythm, rest, size: iconSize });
  const staffOuterElement = renderDiv.parentElement!;
  const ledgerLineDivs: HTMLDivElement[] = [];

  // If last known mouse position was inside staff, draw the cursor
  if (lastMousePos) {
    showingCursor = true;
    cursorIconDiv.style.top = `${
      lastMousePos.clientY - (iconSize - iconSize / 5)
    }px`;
    cursorIconDiv.style.left = `${lastMousePos.clientX - iconSize / 2}px`;
    // TODO need to draw the ledger lines too!
    renderDiv.appendChild(cursorIconDiv);
  }

  /** Movement listener for showing & moving the cursor */
  const staffCursorListener = (e: PointerEvent) => {
    ledgerLineDivs.forEach((div) => div.remove());

    const cursorTargetRect = getBoundingRectMinusPadding(staffOuterElement);
    const isMouseInsideStaff =
      e.clientX >= cursorTargetRect.left &&
      e.clientX <= cursorTargetRect.right &&
      e.clientY >= cursorTargetRect.top &&
      e.clientY <= cursorTargetRect.bottom;

    if (isMouseInsideStaff) {
      // Move the cursor
      cursorIconDiv.style.top = `${e.clientY - (iconSize - iconSize / 5)}px`;
      cursorIconDiv.style.left = `${e.clientX - iconSize / 2}px`;
      lastMousePos = { clientX: e.clientX, clientY: e.clientY };

      // Draw ledger lines if needed. TODO refactor into separate function
      const topStaffLineY = topStaffLine.getBoundingClientRect().y;
      const staffLineGap =
        secondStaffLine.getBoundingClientRect().y - topStaffLineY;
      const bottomStaffLineY = topStaffLineY + staffLineGap * 4;
      const maxLedgerDistance = staffLineGap * 6;
      const drawLedgerAnticipation = 3;

      // Ledger lines above staff
      if (
        !rest &&
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
            ...ledgerLineStyle,
            top: `${y}px`,
            left: `${e.clientX - 10}px`,
          });
          ledgerLineDivs.push(ledgerDiv);
          renderDiv.appendChild(ledgerDiv);
        }
      }
      // Ledger lines below staff
      if (
        !rest &&
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
            ...ledgerLineStyle,
            top: `${y}px`,
            left: `${e.clientX - 10}px`,
          });
          ledgerLineDivs.push(ledgerDiv);
          renderDiv.appendChild(ledgerDiv);
        }
      }
    } else {
      lastMousePos = null;
    }
    if (isMouseInsideStaff && !showingCursor) {
      showingCursor = true;
      renderDiv.appendChild(cursorIconDiv);
    } else if (!isMouseInsideStaff && showingCursor) {
      showingCursor = false;
      if (renderDiv.contains(cursorIconDiv))
        renderDiv.removeChild(cursorIconDiv);
    }
  };

  console.debug("Setting up mouse listeners");
  renderDiv.addEventListener("pointerdown", staffClickListener);
  window.addEventListener("pointermove", staffCursorListener);

  return () => {
    console.debug("Tearing down mouse listeners");
    renderDiv.removeEventListener("pointerdown", staffClickListener);
    window.removeEventListener("pointermove", staffCursorListener);
    cursorIconDiv.remove();
    ledgerLineDivs.forEach((div) => div.remove());
  };
};

const getNoteFromC4MajorDegree = Scale.degrees("C4 major");

/**
 * Generate a function which will turn the mouse click's Y coordinate into a note. It estimates
 * the number of scale degrees we're away from the top staff line, and returns the corresponding
 * note from the C Major scale.
 */
export function getStaffClickToNoteFn(props: {
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

function getCursorIcon({
  rhythm,
  size = 36,
  rest = false,
}: {
  rhythm: Rhythm;
  size?: number;
  rest?: boolean;
}) {
  let svg: string | null;
  switch (rhythm) {
    case Rhythm.Eighth:
      svg = rest ? EighthRestIcon : EighthNoteIcon;
      break;
    case Rhythm.Whole:
      svg = null;
      break;
    case Rhythm.Half:
      svg = rest ? HalfRestIcon : HalfNoteIcon;
      break;
    case Rhythm.Quarter:
      svg = rest ? QuarterRestIcon : QuarterNoteIcon;
      break;
    case Rhythm.Sixteenth:
      svg = rest ? SixteenthRestIcon : SixteenthNoteIcon;
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

function getBoundingRectMinusPadding(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const computedStyle = getComputedStyle(element);

  const top = rect.top + parseFloat(computedStyle.paddingTop);
  const bottom = rect.bottom - parseFloat(computedStyle.paddingBottom);
  const left = rect.left + parseFloat(computedStyle.paddingLeft);
  const right = rect.right - parseFloat(computedStyle.paddingRight);

  return { top, bottom, left, right };
}
