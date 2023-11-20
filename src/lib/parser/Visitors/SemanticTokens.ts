import {
  Annotation,
  BarLine,
  Beam,
  Chord,
  Comment,
  Decoration,
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
  music_code,
} from "../Expr";
import { isToken, mergeTokens } from "../helpers";
import { Token } from "../token";

export class TokensVisitor implements Visitor<void> {
  public tokens: Array<Token> = [];

  analyze(file_structure: File_structure) {
    file_structure.accept(this);
    return this;
  }

  visitFileStructureExpr(file_structure: File_structure): void {
    const { file_header, tune } = file_structure;
    if (file_header) {
      file_header.accept(this);
    }
    tune.forEach((tune) => {
      const { tune_header, tune_body } = tune;
      if (!tune_body) {
        // TODO: don't return when missing body.
        return;
      }
      tune_header.accept(this);
      tune_body.accept(this);
    });
  }
  visitFileHeaderExpr(file_header: File_header) {
    this.tokens.push(mergeTokens(file_header?.tokens));
  }
  visitTuneHeaderExpr(tune_header: Tune_header): void {
    tune_header?.info_lines.forEach((info_line) => {
      info_line.accept(this);
    });
  }
  visitTuneBodyExpr(tune_body: Tune_Body): void {
    tune_body?.sequence.forEach((tuneBody_element) => {
      if (isToken(tuneBody_element)) {
        this.tokens.push(tuneBody_element);
      } else {
        tuneBody_element.accept(this);
      }
    });
  }
  visitBeamExpr(expr: Beam): void {
    expr.contents.forEach((content) => {
      if (isToken(content)) {
        this.tokens.push(content);
      } else {
        content.accept(this);
      }
    });
  }
  visitMusicCodeExpr(element: Music_code) {
    element.contents.forEach((content: music_code) => {
      if (isToken(content)) {
        this.tokens.push(content);
      } else {
        content.accept(this);
      }
    });
  }
  visitBarLineExpr(content: BarLine) {
    this.tokens.push(content.barline);
  }
  visitAnnotationExpr(content: Annotation) {
    this.tokens.push(content.text);
  }
  visitNoteExpr(content: Note) {
    if (content.pitch instanceof Rest) {
      this.tokens.push(content.pitch.rest);
    } else {
      content.pitch.accept(this);
    }
    if (content.rhythm) {
      content.rhythm.accept(this);
    }
    if (content.tie) {
      // TODO do nothing for now, ignore
    }
  }
  visitRhythmExpr(rhythm: Rhythm) {
    const { numerator, separator, denominator, broken } = rhythm;
    const list = [numerator, separator, denominator, broken].filter(
      (e): e is Token => !!e
    );
    list.forEach((element) => {
      this.tokens.push(element);
    });
  }
  visitPitchExpr(pitch: Pitch) {
    if (pitch.alteration) {
      this.tokens.push(pitch.alteration);
    }
    this.tokens.push(pitch.noteLetter);
    if (pitch.octave) {
      this.tokens.push(pitch.octave);
    }
  }
  visitInfoLineExpr(element: Info_line) {
    const { key, value } = element;
    this.tokens.push(key);
    this.tokens.push(mergeTokens(value));
  }
  visitCommentExpr(element: Comment) {
    this.tokens.push(element.token);
  }
  visitChordExpr(e: Chord) {
    e.contents.forEach((content) => {
      if (isToken(content)) {
        this.tokens.push(content);
      } else {
        content.accept(this);
      }
    });
    if (e.rhythm) {
      e.rhythm.accept(this);
    }
  }
  visitDecorationExpr(e: Decoration) {
    this.tokens.push(e.decoration);
  }
  visitGraceGroupExpr(e: Grace_group) {
    e.notes.forEach((e) => {
      e.accept(this);
    });
  }
  visitInlineFieldExpr(e: Inline_field) {
    this.tokens.push(e.field);
    e.text.forEach((element) => {
      this.tokens.push(element);
    });
  }
  visitLyricSectionExpr(e: Lyric_section) {
    e.info_lines.forEach((e) => {
      e.accept(this);
    });
  }
  visitMultiMeasureRestExpr(e: MultiMeasureRest) {
    this.tokens.push(e.rest);
    e.length && this.tokens.push(e.length);
  }
  visitNthRepeatExpr(e: Nth_repeat) {
    this.tokens.push(e.repeat);
  }
  visitRestExpr(e: Rest) {
    this.tokens.push(e.rest);
  }
  visitSymbolExpr(e: ExprSymbol) {
    this.tokens.push(e.symbol);
  }
  visitTuneExpr(e: Tune) {
    e.tune_header.accept(this);
    if (e.tune_body) {
      e.tune_body.accept(this);
    }
  }
  visitYSpacerExpr(e: YSPACER) {
    this.tokens.push(e.ySpacer);
    e.number && this.tokens.push(e.number);
  }
}

/**
 * TODO double check this
 */
