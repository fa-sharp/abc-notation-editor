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

import ChevronLeft from "~dist-icons/ChevronLeft.svg?raw";
import ChevronRight from "~dist-icons/ChevronRight.svg?raw";

const Icon = Object.freeze({
  Backspace: "backspace",
  Beaming: "beaming",
  ChevronLeft: "chevronLeft",
  ChevronRight: "chevronRight",
  Dot: "dot",
  EighthNote: "eighthNote",
  EighthRest: "eighthRest",
  Flat: "flat",
  HalfNote: "halfNote",
  HalfRest: "halfRest",
  Natural: "natural",
  NewLine: "newLine",
  Piano: "piano",
  QuarterNote: "quarterNote",
  QuarterRest: "quarterRest",
  Sharp: "sharp",
  SixteenthNote: "sixteenthNote",
  SixteenthRest: "sixteenthRest",
  Tie: "tie",
  Triplet: "triplet",
  WholeNote: "wholeNote",
  WholeRest: "wholeRest",
});

type Icon = (typeof Icon)[keyof typeof Icon];

/** Get the raw SVG of the given icon */
function getIcon(icon: Icon): string {
  switch (icon) {
    case Icon.Backspace:
      return BackspaceIcon;
    case Icon.Beaming:
      return BeamingIcon;
    case Icon.ChevronLeft:
      return ChevronLeft;
    case Icon.ChevronRight:
      return ChevronRight;
    case Icon.Dot:
      return DotIcon;
    case Icon.EighthNote:
      return EighthNoteIcon;
    case Icon.EighthRest:
      return EighthRestIcon;
    case Icon.Flat:
      return FlatIcon;
    case Icon.HalfNote:
      return HalfNoteIcon;
    case Icon.HalfRest:
      return HalfRestIcon;
    case Icon.Natural:
      return NaturalIcon;
    case Icon.NewLine:
      return NewLineIcon;
    case Icon.Piano:
      return PianoIcon;
    case Icon.QuarterNote:
      return QuarterNoteIcon;
    case Icon.QuarterRest:
      return QuarterRestIcon;
    case Icon.Sharp:
      return SharpIcon;
    case Icon.SixteenthNote:
      return SixteenthNoteIcon;
    case Icon.SixteenthRest:
      return SixteenthRestIcon;
    case Icon.Tie:
      return TieIcon;
    case Icon.Triplet:
      return TripletIcon;
    case Icon.WholeNote:
      return WholeNoteIcon;
    case Icon.WholeRest:
      return WholeRestIcon;
  }
}

export { Icon, getIcon };
