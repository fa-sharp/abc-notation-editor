import {
  Annotation,
  BarLine,
  Beam,
  Chord,
  Comment,
  Decoration,
  Expr,
  File_header,
  File_structure,
  Grace_group,
  Info_line,
  Inline_field,
  Lyric_section,
  MultiMeasureRest,
  Music_code,
  Note,
  Nth_repeat,
  Pitch,
  Rest,
  Rhythm,
  ExprSymbol,
  Tune,
  Tune_Body,
  Tune_header,
  Visitor,
  YSPACER,
  tune_body_code,
} from "../Expr";
import {
  isBeam,
  isChord,
  isGraceGroup,
  isMusicCode,
  isNote,
  isPitch,
  isToken,
} from "../helpers";
import { Token } from "../token";

export class Transposer implements Visitor<Expr | Token> {
  distance: number = 0;
  source: File_structure;
  constructor(source: File_structure) {
    this.source = source;
  }
  transpose(distance: number) {
    this.distance = distance;
    return this.visitFileStructureExpr(this.source);
  }

  /* create all the properties that are needed for the transposer
  for each expression, create a visit method
  that returns the expression */
  visitAnnotationExpr(expr: Annotation): Annotation {
    return expr;
  }
  visitBarLineExpr(expr: BarLine): BarLine {
    return expr;
  }
  visitChordExpr(expr: Chord): Chord {
    expr.contents.map((content) => {
      if (isNote(content)) {
        return this.visitNoteExpr(content);
      } else {
        return content;
      }
    });
    return expr;
  }
  visitCommentExpr(expr: Comment): Comment {
    return expr;
  }
  visitDecorationExpr(expr: Decoration): Decoration {
    return expr;
  }
  visitFileHeaderExpr(expr: File_header): File_header {
    return expr;
  }
  visitFileStructureExpr(expr: File_structure): File_structure {
    expr.tune = expr.tune.map((tune) => {
      return this.visitTuneExpr(tune);
    });
    return expr;
  }
  visitGraceGroupExpr(expr: Grace_group): Grace_group {
    expr.notes = expr.notes.map((e) => {
      if (isNote(e)) {
        return this.visitNoteExpr(e);
      } else {
        return e;
      }
    });
    return expr;
  }
  visitInfoLineExpr(expr: Info_line): Info_line {
    return expr;
  }
  visitInlineFieldExpr(expr: Inline_field): Inline_field {
    return expr;
  }
  visitLyricSectionExpr(expr: Lyric_section): Lyric_section {
    return expr;
  }
  visitMultiMeasureRestExpr(expr: MultiMeasureRest): MultiMeasureRest {
    return expr;
  }
  visitMusicCodeExpr(expr: Music_code): Music_code {
    expr.contents.map((e) => {
      if (isToken(e)) {
        return e;
      } else if (isBeam(e)) {
        return this.visitBeamExpr(e);
      } else if (isChord(e)) {
        return this.visitChordExpr(e);
      } else if (isNote(e)) {
        return this.visitNoteExpr(e);
      } else if (isGraceGroup(e)) {
        return this.visitGraceGroupExpr(e);
      } else {
        return e;
      }
    });
    return expr;
  }
  visitNoteExpr(expr: Note): Note {
    if (isPitch(expr.pitch)) {
      expr.pitch = this.visitPitchExpr(expr.pitch);
    }
    return expr;
  }
  visitNthRepeatExpr(expr: Nth_repeat): Nth_repeat {
    return expr;
  }
  visitPitchExpr(expr: Pitch): Pitch {
    // TODO
    return expr;
  }
  visitRestExpr(expr: Rest): Rest {
    return expr;
  }
  visitRhythmExpr(expr: Rhythm): Rhythm {
    return expr;
  }
  visitSymbolExpr(expr: ExprSymbol): ExprSymbol {
    return expr;
  }
  visitTuneBodyExpr(expr: Tune_Body): Tune_Body {
    expr.sequence = expr.sequence.map((e): tune_body_code | Token => {
      if (isToken(e)) {
        return e;
      } else if (isMusicCode(e)) {
        return this.visitMusicCodeExpr(e);
      } else if (isBeam(e)) {
        return this.visitBeamExpr(e);
      } else if (isChord(e)) {
        return this.visitChordExpr(e);
      } else if (isNote(e)) {
        return this.visitNoteExpr(e);
      } else if (isGraceGroup(e)) {
        return this.visitGraceGroupExpr(e);
      } else {
        return e;
      }
    });
    return expr;
  }
  visitTuneExpr(expr: Tune): Tune {
    if (expr.tune_body) {
      expr.tune_body = this.visitTuneBodyExpr(expr.tune_body);
    }
    return expr;
  }
  visitTuneHeaderExpr(expr: Tune_header): Tune_header {
    return expr;
  }
  visitYSpacerExpr(expr: YSPACER): YSPACER {
    return expr;
  }
  visitBeamExpr(expr: Beam): Beam {
    expr.contents.map((content) => {
      if (isToken(content)) {
        return content;
      } else if (isChord(content)) {
        return this.visitChordExpr(content);
      } else if (isNote(content)) {
        return this.visitNoteExpr(content);
      } else if (isGraceGroup(content)) {
        return this.visitGraceGroupExpr(content);
      } else {
        return content;
      }
    });
    return expr;
  }
}
