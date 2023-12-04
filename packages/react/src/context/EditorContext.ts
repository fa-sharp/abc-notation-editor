import { renderAbc, AbcVisualParams, TuneObject } from "abcjs";
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
  EditorCommandState,
  Accidental,
  Rhythm,
  setupMIDIListener,
} from "@abc-editor/core";

interface EditorProviderProps {
  initialAbc?: string;
  abcjsOptions?: AbcVisualParams;
  onChange?: (abc: string, tuneObject: TuneObject) => void;
}

const useEditor = ({
  initialAbc,
  abcjsOptions,
  onChange = () => {},
}: EditorProviderProps) => {
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
      midiEnabled: false,
    } satisfies EditorCommandState
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
    if (!renderDiv.current) return;
    const [tuneObject] = renderAbc(renderDiv.current, abc + "yy", {
      ...abcjsOptions,
      add_classes: true,
    });
    editorState.current.updateTuneData(tuneObject.lines);
    onChange(abc, tuneObject);

    // Determine beaming depending on next note
    dispatchEditorCommand({
      type: "setBeamed",
      beamed: editorState.current.shouldBeamNextNote(editorCommands.rhythm),
    });
    // Reset triplet command if needed
    if (editorState.current.isEndOfTriplet && tripletRef.current === true)
      dispatchEditorCommand({ type: "toggleTriplet" });
    console.debug(editorState.current);
  }, [abc, abcjsOptions, editorCommands.rhythm, onChange]);

  // Reset editor commands if abc changed
  useEffect(() => {
    dispatchEditorCommand({
      type: "setAccidental",
      accidental: Accidental.None,
    });
    dispatchEditorCommand({ type: "setDotted", dotted: false });
  }, [abc]);

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
  const lastKnownMousePos = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!renderDiv.current) return;

    const cleanUpStaffListeners = setupStaffMouseListeners({
      renderDiv: renderDiv.current,
      numTuneLines: editorState.current.tuneLines.length,
      rhythm: editorCommands.rhythm,
      rest: editorCommands.rest,
      onAddNote,
      lastMousePos: lastKnownMousePos.current,
      updateLastMousePos: (pos) => (lastKnownMousePos.current = pos),
    });
    return () => cleanUpStaffListeners();
  }, [
    abc,
    abcjsOptions,
    editorCommands.rest,
    editorCommands.rhythm,
    onAddNote,
  ]);

  // Setup keyboard listener
  useEffect(() => {
    console.debug("Setting up keyboard listener");
    const cleanUpKbdListener = setupKeyboardListener(
      dispatchEditorCommand,
      onBackspace
    );
    return () => cleanUpKbdListener();
  }, [onBackspace]);

  // Setup MIDI listener
  useEffect(() => {
    if (!editorCommands.midiEnabled) return;
    console.debug("Setting up MIDI listener");
    const cleanUpMidiListener = setupMIDIListener(onAddNote);
    return () => cleanUpMidiListener();
  }, [editorCommands.midiEnabled, onAddNote]);

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
