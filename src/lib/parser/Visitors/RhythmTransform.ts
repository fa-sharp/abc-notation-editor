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
  isInRange,
  isMusicCode,
  isNote,
  isToken,
} from "../helpers";
import { Token } from "../token";
import { TokenType } from "../types";

export class RhythmVisitor implements Visitor<Expr | Token> {
  source: File_structure;
  factor?: "*" | "/";
  times?: number;
  range?: { start: number; end: number };

  constructor(source: File_structure) {
    this.source = source;
  }

  transform(
    factor: "*" | "/",
    times?: number,
    range?: { start: number; end: number }
  ) {
    this.factor = factor;
    this.times = times;
    this.range = range;
    return this.visitFileStructureExpr(this.source);
  }

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
    if (expr.rhythm) {
      expr.rhythm = this.visitRhythmExpr(expr.rhythm);
    }
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
    if (expr.rhythm) {
      expr.rhythm = this.visitRhythmExpr(expr.rhythm);
    } else {
      if (this.factor === "*") {
        expr.rhythm = new Rhythm(
          new Token(TokenType.NUMBER, "2", null, -1, -1)
        );
      } else {
        expr.rhythm = new Rhythm(
          null,
          new Token(TokenType.SLASH, "/", null, -1, -1)
        );
      }
    }
    return expr;
  }
  visitNthRepeatExpr(expr: Nth_repeat): Nth_repeat {
    return expr;
  }
  visitPitchExpr(expr: Pitch): Pitch {
    return expr;
  }
  visitRestExpr(expr: Rest): Rest {
    return expr;
  }
  visitRhythmExpr(expr: Rhythm): Rhythm {
    if (!this.factor) {
      return expr;
    }
    if ((this.range && isInRange(this.range, expr)) || !this.range) {
      if (this.factor === "*") {
        return this.duplicateLength(expr);
      } else {
        return this.divideLength(expr);
      }
    } else {
      return expr;
    }
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
  private duplicateLength(expr: Rhythm): Rhythm {
    if (expr.separator) {
      if (!expr.denominator) {
        /**
         * remove a separator
         * if there was only one separator, remove the token altogether
         */
        expr.separator.lexeme = expr.separator.lexeme.substring(
          0,
          expr.separator.lexeme.length - 1
        );
        if (expr.separator.lexeme === "") {
          expr.separator = undefined;
        }
      } else {
        let denominator_int = parseInt(expr.denominator.lexeme);
        /**
         * count the separators
         * add them to the denominator
         */
        expr.denominator.lexeme = (denominator_int / 2).toString();
        if (expr.denominator.lexeme === "1") {
          expr.denominator = undefined;
          expr.separator = undefined;
        }
      }
    } else if (expr.numerator) {
      expr.numerator.lexeme = (parseInt(expr.numerator.lexeme) * 2).toString();
    } else {
      expr.numerator = new Token(TokenType.NUMBER, "2", null, -1, -1);
    }
    return expr;
  }
  private divideLength(expr: Rhythm): Rhythm {
    if (expr.separator) {
      if (!expr.denominator) {
        /**
         * add a separator, format the separators
         */
        const numDivisions = expr.separator.lexeme.length + 1;
        expr.separator.lexeme += `/${numDivisions * 2}`;
      } else {
        let denominator_int = parseInt(expr.denominator.lexeme);
        /**
         * count the separators
         * add them to the denominator
         */
        expr.denominator.lexeme = (denominator_int * 2).toString();
      }
    } else if (expr.numerator) {
      expr.numerator.lexeme = (parseInt(expr.numerator.lexeme) / 2).toString();
      if (expr.numerator.lexeme === "1") {
        expr.numerator = undefined;
        expr.separator = undefined;
      }
    } else {
      expr.separator = new Token(TokenType.SLASH, "/", null, -1, -1);
    }
    return expr;
  }
}
