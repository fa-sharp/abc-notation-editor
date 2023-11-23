import { renderAbc } from "abcjs";
import { createProvider } from "puro";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { setupStaffListeners } from "~src/core/listeners/mouseListeners";
import EditorState from "~src/core/state/EditorState";
import { Accidental, Rhythm } from "~src/core/types/constants";

interface Props {
  staffWidth?: number;
  onChange?: (abc: string) => void;
}

const useEditor = ({ staffWidth = 300, onChange = () => {} }: Props) => {
  const editorState = useRef<EditorState>(new EditorState());
  const [abc, setAbc] = useState(() => editorState.current.abc);

  const renderDiv = useRef<HTMLDivElement | null>(null);
  const setRenderDiv = useCallback(
    (div: HTMLDivElement | null) => (renderDiv.current = div),
    []
  );

  const [rhythm, setRhythm] = useState<Rhythm>(Rhythm.Eighth);
  const [accidental, setAccidental] = useState<Accidental>(Accidental.None);
  const [dotted, setDotted] = useState(false);
  const [beamed, setBeamed] = useState(false);
  const [rest, setRest] = useState(false);

  const onAddNote = useCallback(
    (noteName: string | number) => {
      editorState.current.addNote(noteName, rhythm, {
        beamed,
        dotted,
        rest,
        accidental,
      });
      setAbc(editorState.current.abc);
    },
    [accidental, beamed, rhythm, dotted, rest]
  );

  // Render the ABC notation, update editor state, and setup staff listeners
  useEffect(() => {
    onChange(abc);
    if (!renderDiv.current) return;
    const [tuneObject] = renderAbc(renderDiv.current, abc + "yy", {
      add_classes: true,
      scale: 1,
      staffwidth: staffWidth,
      viewportHorizontal: true,
      wrap: { minSpacing: 2, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
    });
    editorState.current.updateTuneData(tuneObject.lines);
    console.debug(editorState.current);
    const cleanUpStaffListeners = setupStaffListeners(
      renderDiv.current,
      tuneObject.lines.length,
      rhythm,
      onAddNote
    );
    return () => {
      if (cleanUpStaffListeners) cleanUpStaffListeners();
    };
  }, [abc, onAddNote, onChange, rhythm, staffWidth]);

  const changeRhythm = useCallback((value: Rhythm) => {
    if (value !== Rhythm.Eighth && value !== Rhythm.Sixteenth) setBeamed(false);
    setRhythm(value);
  }, []);

  const onAddBarline = useCallback(() => {
    setAbc((prev) => prev + " | ");
  }, []);

  const onAddLineBreak = useCallback(() => {
    setAbc((prev) => prev + "\ny");
  }, []);

  const onBackspace = useCallback(() => {
    editorState.current.backspace();
    setAbc(editorState.current.abc);
  }, []);

  const onSetAccidental = useCallback((v: Accidental) => setAccidental(v), []);
  const onToggleRest = useCallback(() => setRest((prev) => !prev), []);
  const onToggleDotted = useCallback(() => setDotted((prev) => !prev), []);

  return {
    currentRhythm: rhythm,
    currentAccidental: accidental,
    isBeamed: beamed,
    isRest: rest,
    isDotted: dotted,
    changeRhythm,
    setBeamed,
    setRenderDiv,
    onAddNote,
    onAddBarline,
    onAddLineBreak,
    onBackspace,
    onToggleRest,
    onToggleDotted,
    onSetAccidental,
  };
};

const { BaseContext, Provider } = createProvider(useEditor);

export const useEditorContext = () => useContext(BaseContext);
export const EditorProvider = Provider;
