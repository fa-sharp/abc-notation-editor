import { TuneObject, renderAbc } from "abcjs";
import { createProvider } from "puro";
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  setupKeyboardListener,
  setupStaffMouseListeners,
  editorCommandReducer,
  EditorState,
  Accidental,
  Rhythm,
} from "@abc-editor/core";

interface EditorProviderProps {
  initialAbc?: string;
  staffWidth?: number;
  onChange?: (abc: string) => void;
}

const useEditor = ({
  initialAbc,
  staffWidth = 300,
  onChange = () => {},
}: EditorProviderProps) => {
  const editorState = useRef<EditorState>(new EditorState(initialAbc));
  const [abc, setAbc] = useState(() => editorState.current.abc);
  const [tuneObject, setTuneObject] = useState<TuneObject | null>(null);

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

  const restRef = useRef(editorCommands.rest);
  useEffect(() => {
    restRef.current = editorCommands.rest;
  }, [editorCommands.rest]);

  const rhythmRef = useRef(editorCommands.rhythm);
  useEffect(() => {
    rhythmRef.current = editorCommands.rhythm;
  }, [editorCommands.rhythm]);

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

  const onAddNote = useCallback((noteName: string | number) => {
    editorState.current.addNote(noteName, rhythmRef.current, {
      beamed: beamedRef.current,
      dotted: dottedRef.current,
      rest: restRef.current,
      accidental: accidentalRef.current,
      triplet: tripletRef.current,
    });
    setAbc(editorState.current.abc);
  }, []);

  // Render the ABC notation, update editor state
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
    setTuneObject(tuneObject);
    editorState.current.updateTuneData(tuneObject.lines);

    // Reset editor commands
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
  }, [abc, editorCommands.rhythm, onChange, staffWidth]);

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

  // Setup mouse listeners
  useEffect(() => {
    if (!renderDiv.current || !tuneObject) return;

    const cleanUpStaffListeners = setupStaffMouseListeners({
      renderDiv: renderDiv.current,
      numTuneLines: tuneObject.lines.length,
      rhythm: editorCommands.rhythm,
      rest: editorCommands.rest,
      onAddNote,
    });
    return () => cleanUpStaffListeners();
  }, [editorCommands.rest, editorCommands.rhythm, onAddNote, tuneObject]);

  // Setup keyboard listener
  useEffect(() => {
    console.debug("Setting up keyboard listener");
    const cleanUpKbdListener = setupKeyboardListener(
      dispatchEditorCommand,
      onBackspace
    );
    return () => cleanUpKbdListener();
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
