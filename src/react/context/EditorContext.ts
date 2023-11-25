import { renderAbc } from "abcjs";
import { createProvider } from "puro";
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { setupKeyboardListeners } from "~src/core/listeners/keyboard";
import { setupStaffMouseListeners } from "~src/core/listeners/mouse";
import { editorCommandReducer } from "~src/core/state/EditorCommand";
import EditorState from "~src/core/state/EditorState";
import { Accidental, Rhythm } from "~src/core/types/constants";

interface Props {
  initialAbc?: string;
  staffWidth?: number;
  onChange?: (abc: string) => void;
}

const useEditor = ({
  initialAbc,
  staffWidth = 300,
  onChange = () => {},
}: Props) => {
  const editorState = useRef<EditorState>(new EditorState(initialAbc));
  const [abc, setAbc] = useState(() => editorState.current.abc);

  const renderDiv = useRef<HTMLDivElement | null>(null);
  const setRenderDiv = useCallback(
    (div: HTMLDivElement | null) => (renderDiv.current = div),
    []
  );

  const [editorCommands, dispatchEditorCommand] = useReducer(
    editorCommandReducer,
    {
      rhythm: Rhythm.Eighth,
      rest: false,
      accidental: Accidental.None,
      dotted: false,
      triplet: false,
      showKeyboard: false,
      beamed: false,
    }
  );

  const dottedRef = useRef(editorCommands.dotted);
  useEffect(() => {
    dottedRef.current = editorCommands.dotted;
  }, [editorCommands.dotted]);

  const accidentalRef = useRef(editorCommands.accidental);
  useEffect(() => {
    accidentalRef.current = editorCommands.accidental;
  }, [editorCommands.accidental]);

  const beamedRef = useRef(editorCommands.beamed);
  useEffect(() => {
    beamedRef.current = editorCommands.beamed;
  }, [editorCommands.beamed]);

  const tripletRef = useRef(editorCommands.triplet);
  useEffect(() => {
    tripletRef.current = editorCommands.triplet;
  }, [editorCommands.triplet]);

  const onAddNote = useCallback(
    (noteName: string | number) => {
      editorState.current.addNote(noteName, editorCommands.rhythm, {
        beamed: beamedRef.current,
        dotted: dottedRef.current,
        rest: editorCommands.rest,
        accidental: accidentalRef.current,
        triplet: tripletRef.current,
      });
      setAbc(editorState.current.abc);
    },
    [editorCommands.rest, editorCommands.rhythm]
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
      wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 5 },
    });
    editorState.current.updateTuneData(tuneObject.lines);
    dispatchEditorCommand({
      type: "setAccidental",
      accidental: Accidental.None,
    });
    dispatchEditorCommand({
      type: "setBeamed",
      beamed: editorState.current.shouldBeamNextNote(editorCommands.rhythm),
    });
    dispatchEditorCommand({ type: "setDotted", dotted: false });
    console.debug(editorState.current);
    const cleanUpStaffListeners = setupStaffMouseListeners(
      renderDiv.current,
      tuneObject.lines.length,
      editorCommands.rhythm,
      onAddNote
    );
    return () => {
      if (cleanUpStaffListeners) cleanUpStaffListeners();
    };
  }, [abc, editorCommands.rhythm, staffWidth, onAddNote, onChange]);

  const onAddBarline = useCallback(() => {
    setAbc((prev) => prev + " | ");
  }, []);

  const onAddLineBreak = useCallback(() => {
    setAbc((prev) => prev + "\n");
  }, []);

  const onBackspace = useCallback(() => {
    editorState.current.backspace();
    setAbc(editorState.current.abc);
  }, []);

  // Setup keyboard listener
  useEffect(() => {
    console.debug("Setting up keyboard listener");
    const cleanUpKbdListeners = setupKeyboardListeners(
      dispatchEditorCommand,
      onBackspace
    );
    return () => cleanUpKbdListeners();
  }, [onBackspace]);

  return {
    currentCommands: editorCommands,
    dispatchCommand: dispatchEditorCommand,
    setRenderDiv,
    onAddNote,
    onAddBarline,
    onAddLineBreak,
    onBackspace,
  };
};

const { BaseContext, Provider } = createProvider(useEditor);

export const useEditorContext = () => useContext(BaseContext);
export const EditorProvider = Provider;
