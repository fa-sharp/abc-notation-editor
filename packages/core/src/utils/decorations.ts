import { Decoration } from "~src/types";

export function getDecorationAbc(decoration: Decoration) {
  switch (decoration) {
    case Decoration.Staccato:
      return ".";
    case Decoration.Trill:
      return "T";
    case Decoration.Accent:
      return "L";
    case Decoration.Tenuto:
      return "!tenuto!";
    case Decoration.Wedge:
      return "!wedge!";
    default:
      return "";
  }
}
