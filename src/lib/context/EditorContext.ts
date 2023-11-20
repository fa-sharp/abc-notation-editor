import { VoiceItem, renderAbc } from "abcjs";
import { createProvider } from "puro";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import EditorState from "./EditorState";

enum Rhythm {
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
  const [dotted, setDotted] = useState(false);
  const [beamed, setBeamed] = useState(false);
  const [rest, setRest] = useState(false);

  useEffect(() => {
    if (renderDiv.current) {
      const [tuneObject] = renderAbc(renderDiv.current, abc, {
        staffwidth: staffWidth,
        wrap: { minSpacing: 2, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
      });
      const lines = tuneObject.lines.reduce<VoiceItem[][]>((arr, line) => {
        const items = line.staff?.[0]?.voices?.[0];
        if (items) arr.push(items);
        return arr;
      }, []);
      editorState.current.updateTuneData(lines);
      console.log(editorState.current);
    }
    onChange(abc);
  }, [abc, staffWidth, onChange]);

  const changeRhythm = useCallback((value: Rhythm) => {
    if (value !== Rhythm.Eighth && value !== Rhythm.Sixteenth) setBeamed(false);
    setCurrentRhythm(value);
  }, []);

  const onAddNote = useCallback(
    (midiNum: number) => {
      editorState.current.addMidiNote(midiNum, currentRhythm, {
        beamed,
        dotted,
        rest,
      });
      setAbc(editorState.current.abc);
    },
    [beamed, currentRhythm, dotted, rest]
  );

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

  const onToggleRest = useCallback(() => setRest((prev) => !prev), []);
  const onToggleDotted = useCallback(() => setDotted((prev) => !prev), []);

  return {
    currentRhythm,
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
  };
};

const { BaseContext, Provider } = createProvider(useEditor);

export const useEditorContext = () => useContext(BaseContext);
export const EditorProvider = Provider;

function getAbcRhythm(currentRhythm: Rhythm, dotted: boolean) {
  return !dotted
    ? currentRhythm === Rhythm.Half
      ? "4"
      : currentRhythm === Rhythm.Quarter
        ? "2"
        : currentRhythm === Rhythm.Eighth
          ? ""
          : currentRhythm === Rhythm.Sixteenth
            ? "/2"
            : ""
    : currentRhythm === Rhythm.Half
      ? "6"
      : currentRhythm === Rhythm.Quarter
        ? "3"
        : currentRhythm === Rhythm.Eighth
          ? "3/2"
          : currentRhythm === Rhythm.Sixteenth
            ? "3/4"
            : "";
}
