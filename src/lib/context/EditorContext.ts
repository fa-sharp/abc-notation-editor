import { VoiceItem, renderAbc } from "abcjs";
import { createProvider } from "puro";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import EditorState from "./EditorState";
import { useStaffListeners } from "./StaffClick";

export enum Rhythm {
  Whole = 1,
  Half = 2,
  Quarter = 4,
  Eighth = 8,
  Sixteenth = 16,
}

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

  const [currentRhythm, setCurrentRhythm] = useState<Rhythm>(Rhythm.Eighth);
  const [accidental, setAccidental] = useState<"none" | "sharp" | "flat">(
    "none"
  );
  const [dotted, setDotted] = useState(false);
  const [beamed, setBeamed] = useState(false);
  const [rest, setRest] = useState(false);

  const onAddNote = useCallback(
    (noteName: string | number) => {
      editorState.current.addNote(noteName, currentRhythm, {
        beamed,
        dotted,
        rest,
        accidental,
      });
      setAbc(editorState.current.abc);
    },
    [accidental, beamed, currentRhythm, dotted, rest]
  );

  const { setupStaffListeners } = useStaffListeners({
    rhythm: currentRhythm,
    onAddNote,
  });

  useEffect(() => {
    onChange(abc);
    if (!renderDiv.current) return;
    const [tuneObject] = renderAbc(renderDiv.current, abc + "y", {
      add_classes: true,
      scale: 1.2,
      staffwidth: staffWidth,
      viewportHorizontal: true,
      wrap: { minSpacing: 2, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
    });
    const lines = tuneObject.lines.reduce<VoiceItem[][]>((arr, line) => {
      const items = line.staff?.[0]?.voices?.[0];
      if (items) arr.push(items);
      return arr;
    }, []);
    editorState.current.updateTuneData(lines);
    console.log(editorState.current);

    const cleanUpStaffListeners = setupStaffListeners(
      renderDiv.current,
      tuneObject
    );
    return () => {
      if (cleanUpStaffListeners) cleanUpStaffListeners();
    };
  }, [abc, onChange, setupStaffListeners, staffWidth]);

  const changeRhythm = useCallback((value: Rhythm) => {
    if (value !== Rhythm.Eighth && value !== Rhythm.Sixteenth) setBeamed(false);
    setCurrentRhythm(value);
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

  const onSetAccidental = useCallback(
    (v: "none" | "sharp" | "flat") => setAccidental(v),
    []
  );
  const onToggleRest = useCallback(() => setRest((prev) => !prev), []);
  const onToggleDotted = useCallback(() => setDotted((prev) => !prev), []);

  return {
    currentRhythm,
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
