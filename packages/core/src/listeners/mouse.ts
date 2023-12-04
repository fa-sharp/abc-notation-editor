import { Scale } from "tonal";
import { Icon, getIcon } from "../icons";
import { Accidental, Rhythm } from "../types/constants";

/**
 * Sets up listeners for tracking and responding to the mouse movements and clicks
 * on the staff. Returns a cleanup function to remove the listeners.
 */
export const setupStaffMouseListeners = ({
  renderDiv,
  numTuneLines,
  rhythm,
  dotted = false,
  accidental = Accidental.None,
  rest = false,
  onAddNote,
  lastMousePos,
  updateLastMousePos,
}: {
  renderDiv: HTMLDivElement;
  numTuneLines: number;
  rhythm: Rhythm;
  dotted?: boolean;
  accidental?: Accidental;
  rest?: boolean;
  onAddNote: (note: string) => void;

  /** Last known mouse position inside staff */
  lastMousePos?: {
    x: number;
    y: number;
  } | null;
  updateLastMousePos?: (pos: { x: number; y: number } | null) => void;
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
    const note = getStaffClickToNoteFn({
      clef: "treble",
      topLineY: topStaffLineY,
      lineGap: staffLineGap,
    })(e.clientY);
    if (note) onAddNote(note);
  };

  // Setup the cursor icon for the staff
  const topStaffLineY = topStaffLine.getBoundingClientRect().y;
  const staffLineGap =
    secondStaffLine.getBoundingClientRect().y - topStaffLineY;
  const iconSize = staffLineGap * 4;
  const cursorIconDiv = getCursorIcon({
    rhythm,
    rest,
    size: iconSize,
    accidental,
    dotted,
  });
  let ledgerLineDivs: HTMLDivElement[] = [];

  // If there is a last known mouse position inside staff, re-draw the cursor (and ledger lines if needed)
  if (lastMousePos) {
    cursorIconDiv.style.top = `${lastMousePos.y - iconSize * (4 / 5)}px`;
    cursorIconDiv.style.left = `${lastMousePos.x - iconSize / 2}px`;
    renderDiv.appendChild(cursorIconDiv);
    if (!rest) {
      ledgerLineDivs = drawLedgerLines({
        mousePos: lastMousePos,
        topStaffLineY,
        staffLineGap,
        renderDiv,
        cursorSize: iconSize,
      });
    }
  }

  const staffEnterListener = () => {
    renderDiv.appendChild(cursorIconDiv);
  };

  const staffLeaveListener = () => {
    if (renderDiv.contains(cursorIconDiv)) renderDiv.removeChild(cursorIconDiv);
    ledgerLineDivs.forEach((div) => div.remove());
    ledgerLineDivs = [];
    if (updateLastMousePos) updateLastMousePos(null);
  };

  const staffMoveListener = (e: PointerEvent) => {
    // Remove previous ledger lines
    ledgerLineDivs.forEach((div) => div.remove());

    // Move the cursor icon
    cursorIconDiv.style.top = `${e.clientY - iconSize * (4 / 5)}px`;
    cursorIconDiv.style.left = `${e.clientX - iconSize / 2}px`;
    if (updateLastMousePos) updateLastMousePos({ x: e.clientX, y: e.clientY });

    // Draw ledger lines if needed.
    if (!rest) {
      const topStaffLineY = topStaffLine.getBoundingClientRect().y;
      const staffLineGap =
        secondStaffLine.getBoundingClientRect().y - topStaffLineY;
      ledgerLineDivs = drawLedgerLines({
        topStaffLineY,
        staffLineGap,
        mousePos: { x: e.clientX, y: e.clientY },
        renderDiv,
        cursorSize: iconSize,
      });
    } else {
      ledgerLineDivs = [];
    }
  };

  console.debug("Setting up mouse listeners");
  renderDiv.addEventListener("pointerdown", staffClickListener);
  renderDiv.addEventListener("pointerenter", staffEnterListener);
  renderDiv.addEventListener("pointerleave", staffLeaveListener);
  renderDiv.addEventListener("pointermove", staffMoveListener);

  return () => {
    console.debug("Tearing down mouse listeners");
    renderDiv.removeEventListener("pointerdown", staffClickListener);
    renderDiv.removeEventListener("pointerenter", staffEnterListener);
    renderDiv.removeEventListener("pointerleave", staffLeaveListener);
    renderDiv.removeEventListener("pointermove", staffMoveListener);
    cursorIconDiv.remove();
    ledgerLineDivs.forEach((div) => div.remove());
  };
};

const getNoteFromC4MajorDegree = Scale.steps("C4 major");

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
      props.clef === "treble" ? degrees + 10 : degrees - 2
    );
  return (y: number) => {
    const distanceFromTopLine = props.topLineY - y;
    const estimatedDegreesFromTopLine = Math.round(
      distanceFromTopLine / (props.lineGap / 2)
    );
    return getNoteFromDegrees(estimatedDegreesFromTopLine);
  };
}

const ledgerLineStyle = Object.freeze({
  position: "fixed",
  height: "1px",
  backgroundColor: "currentColor",
});

/** Draw the ledger lines above/below the staff according to the mouse position */
function drawLedgerLines({
  cursorSize,
  mousePos,
  topStaffLineY,
  staffLineGap,
  renderDiv,
}: {
  cursorSize: number;
  mousePos: { y: number; x: number };
  topStaffLineY: number;
  staffLineGap: number;
  renderDiv: HTMLDivElement;
}) {
  const ledgerLineDivs: HTMLDivElement[] = [];
  const bottomStaffLineY = topStaffLineY + staffLineGap * 4;
  const maxLedgerDistance = staffLineGap * 6;
  const drawLedgerAnticipation = 4;

  // Above staff
  if (
    mousePos.y < topStaffLineY &&
    mousePos.y > topStaffLineY - maxLedgerDistance
  ) {
    for (
      let y = topStaffLineY - staffLineGap;
      y >= mousePos.y - drawLedgerAnticipation;
      y -= staffLineGap
    ) {
      const ledgerDiv = document.createElement("div");
      Object.assign(ledgerDiv.style, {
        ...ledgerLineStyle,
        top: `${y}px`,
        left: `${mousePos.x - cursorSize / 2.9}px`,
        width: `${cursorSize / 1.8}px`,
      });
      ledgerLineDivs.push(ledgerDiv);
      renderDiv.appendChild(ledgerDiv);
    }
  }
  // Below staff
  if (
    mousePos.y > bottomStaffLineY &&
    mousePos.y < bottomStaffLineY + maxLedgerDistance
  ) {
    for (
      let y = bottomStaffLineY + staffLineGap;
      y <= mousePos.y + drawLedgerAnticipation;
      y += staffLineGap
    ) {
      const ledgerDiv = document.createElement("div");
      Object.assign(ledgerDiv.style, {
        ...ledgerLineStyle,
        top: `${y}px`,
        left: `${mousePos.x - cursorSize / 2.9}px`,
        width: `${cursorSize / 1.8}px`,
      });
      ledgerLineDivs.push(ledgerDiv);
      renderDiv.appendChild(ledgerDiv);
    }
  }
  return ledgerLineDivs;
}

/** Get the cursor icon with the appropriate SVGs inside */
function getCursorIcon({
  rhythm,
  size = 36,
  rest = false,
  dotted = false,
  accidental = Accidental.None,
}: {
  rhythm: Rhythm;
  size?: number;
  rest?: boolean;
  dotted?: boolean;
  accidental?: Accidental;
}) {
  const svg = (() => {
    switch (rhythm) {
      case Rhythm.Eighth:
        return getIcon(rest ? Icon.EighthRest : Icon.EighthNote);
      case Rhythm.Whole:
        return null;
      case Rhythm.Half:
        return getIcon(rest ? Icon.HalfRest : Icon.HalfNote);
      case Rhythm.Quarter:
        return getIcon(rest ? Icon.QuarterRest : Icon.QuarterNote);
      case Rhythm.Sixteenth:
        return getIcon(rest ? Icon.SixteenthRest : Icon.SixteenthNote);
    }
  })();
  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.pointerEvents = "none";
  if (svg) {
    div.innerHTML = svg;
    const svgEl = div.querySelector("svg");
    if (svgEl) {
      svgEl.style.height = `${size}px`;
      svgEl.style.width = `${size}px`;
    }
  }
  if (!rest && accidental !== Accidental.None) {
    const accidentalSvg = (() => {
      switch (accidental) {
        case Accidental.Sharp:
          return getIcon(Icon.Sharp);
        case Accidental.Flat:
          return getIcon(Icon.Flat);
        case Accidental.Natural:
          return getIcon(Icon.Natural);
      }
    })();
    const accidentalDiv = document.createElement("div");
    accidentalDiv.innerHTML = accidentalSvg;
    const svgEl = accidentalDiv.querySelector("svg");
    if (svgEl)
      Object.assign(svgEl.style, {
        position: "absolute",
        right: `${size * 0.65}px`,
        top: `${size * 0.35}px`,
        height: `${size * 0.7}px`,
        width: `${size * 0.7}px`,
      });
    div.appendChild(accidentalDiv);
  }
  if (dotted) {
    const dotDiv = document.createElement("div");
    dotDiv.innerHTML = getIcon(Icon.Dot);
    const svgEl = dotDiv.querySelector("svg");
    if (svgEl)
      Object.assign(svgEl.style, {
        position: "absolute",
        left: `${rest ? size * 0.6 : size * 0.4}px`,
        top: `${rest ? size * 0.1 : size * 0.375}px`,
        height: `${size * 0.7}px`,
        width: `${size * 0.7}px`,
      });
    div.appendChild(dotDiv);
  }
  return div;
}
