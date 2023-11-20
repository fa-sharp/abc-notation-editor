import { TuneObject, VoiceItem, renderAbc } from "abcjs";
import { createProvider } from "puro";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AbcNotation, Midi } from "tonal";

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

const useEditorState = ({ staffWidth = 300, onChange = () => {} }: Props) => {
  const [abc, setAbc] = useState("X:1\nL:1/8\n");
  const [tuneObject, setTuneObject] = useState<TuneObject>();
  const [tuneLines, setTuneLines] = useState<VoiceItem[][]>();
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
      console.log({ tuneObject, lines, abc });
      setTuneObject(tuneObject);
      setTuneLines(lines);
    }
    onChange(abc);
  }, [abc, staffWidth, onChange]);

  const changeRhythm = useCallback((value: Rhythm) => {
    if (value !== Rhythm.Eighth && value !== Rhythm.Sixteenth) setBeamed(false);
    setCurrentRhythm(value);
  }, []);

  const onAddNote = useCallback(
    (midiNum: number) => {
      const abcNote = AbcNotation.scientificToAbcNotation(
        Midi.midiToNoteName(midiNum)
      );
      setAbc(
        (prev) =>
          prev +
          `${beamed ? "" : " "}${!rest ? abcNote : "z"}${getAbcRhythm(
            currentRhythm,
            dotted
          )}`
      );
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
    if (!tuneLines) return;
    const line = tuneLines[tuneLines.length - 1];
    if (!line) return;
    const lastItem = line[line.length - 1];
    switch (lastItem?.el_type) {
      case "bar":
      case "note":
        setAbc((abc) => abc.slice(0, lastItem.startChar));
        break;
      default:
        break;
    }
  }, [tuneLines]);

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

const { BaseContext, Provider } = createProvider(useEditorState);

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
