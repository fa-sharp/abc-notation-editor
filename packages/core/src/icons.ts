import EighthNoteIcon from "~dist-icons/EighthNote.svg?raw";
import HalfNoteIcon from "~dist-icons/HalfNote.svg?raw";
import QuarterNoteIcon from "~dist-icons/QuarterNote.svg?raw";
import SixteenthNoteIcon from "~dist-icons/SixteenthNote.svg?raw";
import WholeNoteIcon from "~dist-icons/WholeNote.svg?raw";

import EighthRestIcon from "~dist-icons/EighthRest.svg?raw";
import HalfRestIcon from "~dist-icons/HalfRest.svg?raw";
import QuarterRestIcon from "~dist-icons/QuarterRest.svg?raw";
import SixteenthRestIcon from "~dist-icons/SixteenthRest.svg?raw";
import WholeRestIcon from "~dist-icons/WholeRest.svg?raw";

import BeamingIcon from "~dist-icons/Beaming.svg?raw";
import DotIcon from "~dist-icons/Dot.svg?raw";
import FlatIcon from "~dist-icons/Flat.svg?raw";
import NaturalIcon from "~dist-icons/Natural.svg?raw";
import PianoIcon from "~dist-icons/Piano.svg?raw";
import SharpIcon from "~dist-icons/Sharp.svg?raw";
import TieIcon from "~dist-icons/Tie.svg?raw";
import TripletIcon from "~dist-icons/Triplet.svg?raw";

import BackspaceIcon from "~dist-icons/Backspace.svg?raw";
import NewLineIcon from "~dist-icons/NewLine.svg?raw";

import ChevronLeftIcon from "~dist-icons/ChevronLeft.svg?raw";
import ChevronRightIcon from "~dist-icons/ChevronRight.svg?raw";

import RedoIcon from "~dist-icons/Redo.svg?raw";
import UndoIcon from "~dist-icons/Undo.svg?raw";

type Icon =
  | "backspace"
  | "beaming"
  | "chevronLeft"
  | "chevronRight"
  | "dot"
  | "eighthNote"
  | "eighthRest"
  | "flat"
  | "halfNote"
  | "halfRest"
  | "natural"
  | "newLine"
  | "piano"
  | "quarterNote"
  | "quarterRest"
  | "redo"
  | "sharp"
  | "sixteenthNote"
  | "sixteenthRest"
  | "tie"
  | "triplet"
  | "undo"
  | "wholeNote"
  | "wholeRest";

/** Get the raw SVG of the given icon */
function getIcon(icon: Icon): string {
  switch (icon) {
    case "backspace":
      return BackspaceIcon;
    case "beaming":
      return BeamingIcon;
    case "chevronLeft":
      return ChevronLeftIcon;
    case "chevronRight":
      return ChevronRightIcon;
    case "dot":
      return DotIcon;
    case "eighthNote":
      return EighthNoteIcon;
    case "eighthRest":
      return EighthRestIcon;
    case "flat":
      return FlatIcon;
    case "halfNote":
      return HalfNoteIcon;
    case "halfRest":
      return HalfRestIcon;
    case "natural":
      return NaturalIcon;
    case "newLine":
      return NewLineIcon;
    case "piano":
      return PianoIcon;
    case "quarterNote":
      return QuarterNoteIcon;
    case "quarterRest":
      return QuarterRestIcon;
    case "redo":
      return RedoIcon;
    case "sharp":
      return SharpIcon;
    case "sixteenthNote":
      return SixteenthNoteIcon;
    case "sixteenthRest":
      return SixteenthRestIcon;
    case "tie":
      return TieIcon;
    case "triplet":
      return TripletIcon;
    case "undo":
      return UndoIcon;
    case "wholeNote":
      return WholeNoteIcon;
    case "wholeRest":
      return WholeRestIcon;
  }
}

export { getIcon, type Icon };
