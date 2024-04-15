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
import TripletIcon from "~dist-icons/Triplet.svg?raw";

import BackspaceIcon from "~dist-icons/Backspace.svg?raw";
import NewLineIcon from "~dist-icons/NewLine.svg?raw";

enum Icon {
  Backspace,
  Beaming,
  Dot,
  EighthNote,
  EighthRest,
  Flat,
  HalfNote,
  HalfRest,
  Natural,
  NewLine,
  Piano,
  QuarterNote,
  QuarterRest,
  Sharp,
  SixteenthNote,
  SixteenthRest,
  Triplet,
  WholeNote,
  WholeRest,
}

/** Get the raw SVG of the given icon */
function getIcon(icon: Icon): string {
  switch (icon) {
    case Icon.Backspace:
      return BackspaceIcon;
    case Icon.Beaming:
      return BeamingIcon;
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
    case Icon.Triplet:
      return TripletIcon;
    case Icon.WholeNote:
      return WholeNoteIcon;
    case Icon.WholeRest:
      return WholeRestIcon;
  }
}

export { Icon, getIcon };
