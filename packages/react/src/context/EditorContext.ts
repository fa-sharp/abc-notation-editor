import {
  Accidental,
  EditorCommandState,
  EditorState,
  Rhythm,
  editorCommandReducer,
  setupKeyboardListener,
  setupMIDIListener,
  setupStaffMouseListeners,
} from "@abc-editor/core";
import type { AbcVisualParams, TuneObject } from "abcjs";
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
import { EditorProps } from "../components/editor/Editor";

interface EditorProviderProps {
  initialAbc?: string;
  abcjsOptions?: AbcVisualParams;
  chordTemplate?: string;
  enableKbdShortcuts?: boolean;
  ending?: EditorProps["ending"];
  onChange?: (
    abc: string,
    tuneObject: TuneObject,
    renderDiv?: HTMLDivElement,
  ) => void;
}

const useEditor = ({
  initialAbc,
  abcjsOptions,
  enableKbdShortcuts,
  chordTemplate,
  ending,
  onChange = () => {},
}: EditorProviderProps) => {
  const editorState = useRef<EditorState>(
    new EditorState(initialAbc, {
      chordTemplate,
      ending,
    }),
  );
  const [abc, setAbc] = useState(() => editorState.current.abc);

  const renderDiv = useRef<HTMLDivElement | null>(null);
  const setRenderDiv = useCallback(
    (div: HTMLDivElement | null) => (renderDiv.current = div),
    [],
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
      tied: false,
      midiEnabled: false,
    } satisfies EditorCommandState,
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

  const tiedRef = useRef(editorCommands.tied);
  useEffect(() => {
    tiedRef.current = editorCommands.tied;
  }, [editorCommands.tied]);

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
      tied: tiedRef.current,
    });
    setAbc(editorState.current.abc);
  }, []);

  // Render the ABC notation, update editor state
  useEffect(() => {
    if (!renderDiv.current) return;
    const isEndOfSong = !ending?.lastMeasure
      ? false
      : ending.lastBarline === "thin-thick"
        ? abc.trimEnd().endsWith("|]")
        : abc.trimEnd().endsWith("||");
    const [tuneObject] = renderAbc(
      renderDiv.current,
      abc + (!isEndOfSong ? "yy" : ""),
      {
        ...abcjsOptions,
        add_classes: true,
        selectTypes: ["note"],
        clickListener: (abcElem, _, _classes, analysis) =>
          editorState.current.selectNote(abcElem, analysis),
      },
    );
    editorState.current.updateTuneData(tuneObject);
    onChange(abc, tuneObject, renderDiv.current || undefined);

    // Determine beaming depending on next note
    dispatchEditorCommand({
      type: "setBeamed",
      beamed: editorState.current.shouldBeamNextNote(editorCommands.rhythm),
    });
    // Reset triplet command if needed
    if (editorState.current.isEndOfTriplet && tripletRef.current === true)
      dispatchEditorCommand({ type: "toggleTriplet" });

    import.meta.env.DEV && console.debug(editorState.current);
  }, [
    abc,
    abcjsOptions,
    editorCommands.rhythm,
    ending?.lastBarline,
    ending?.lastMeasure,
    onChange,
  ]);

  // Reset editor commands if abc changed
  useEffect(() => {
    dispatchEditorCommand({
      type: "setAccidental",
      accidental: Accidental.None,
    });
    dispatchEditorCommand({ type: "setDotted", dotted: false });
    if (restRef.current === true) dispatchEditorCommand({ type: "toggleRest" });
    if (tiedRef.current === true) dispatchEditorCommand({ type: "toggleTied" });
  }, [abc]);

  const onNoteUp = useCallback(() => {
    editorState.current.noteUp();
    setAbc(editorState.current.abc);
  }, []);

  const onNoteDown = useCallback(() => {
    editorState.current.noteDown();
    setAbc(editorState.current.abc);
  }, []);

  const onSelectNextNote = useCallback(() => {
    editorState.current.selectNextNote();
  }, []);

  const onSelectPrevNote = useCallback(() => {
    editorState.current.selectPrevNote();
  }, []);

  const onBackspace = useCallback(() => {
    editorState.current.backspace();
    setAbc(editorState.current.abc);
  }, []);

  const onNewLine = useCallback(() => {
    editorState.current.newLine();
    setAbc(editorState.current.abc);
  }, []);

  // Setup mouse listeners
  const lastKnownMousePos = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!renderDiv.current) return;

    const cleanUpStaffListeners = setupStaffMouseListeners({
      renderDiv: renderDiv.current,
      numTuneLines: editorState.current.tuneLines.length,
      clef: editorState.current.clef,
      rhythm: editorCommands.rhythm,
      rest: editorCommands.rest,
      accidental: editorCommands.accidental,
      dotted: editorCommands.dotted,
      triplet: editorCommands.triplet,
      onAddNote,
      lastMousePos: lastKnownMousePos.current,
      updateLastMousePos: (pos) => (lastKnownMousePos.current = pos),
    });
    return () => cleanUpStaffListeners();
  }, [
    abc,
    abcjsOptions,
    editorCommands.accidental,
    editorCommands.dotted,
    editorCommands.rest,
    editorCommands.rhythm,
    editorCommands.triplet,
    onAddNote,
  ]);

  // Setup keyboard listener
  useEffect(() => {
    if (!enableKbdShortcuts) return;
    import.meta.env.DEV && console.debug("Setting up keyboard listener");
    const cleanUpKbdListener = setupKeyboardListener(
      dispatchEditorCommand,
      onNoteUp,
      onNoteDown,
      onSelectNextNote,
      onSelectPrevNote,
      onBackspace,
      onNewLine,
    );
    return () => cleanUpKbdListener();
  }, [
    enableKbdShortcuts,
    onBackspace,
    onNewLine,
    onNoteDown,
    onNoteUp,
    onSelectNextNote,
    onSelectPrevNote,
  ]);

  // Setup MIDI listener
  useEffect(() => {
    if (!editorCommands.midiEnabled) return;
    import.meta.env.DEV && console.debug("Setting up MIDI listener");
    const cleanUpMidiListener = setupMIDIListener(onAddNote);
    return () => cleanUpMidiListener();
  }, [editorCommands.midiEnabled, onAddNote]);

  return {
    currentCommands: editorCommands,
    abcjsOptions,
    dispatchCommand: dispatchEditorCommand,
    setRenderDiv,
    onAddNote,
    onBackspace,
    onNewLine,
  };
};

const { BaseContext, Provider } = createProvider(useEditor);

export const useEditorContext = () => useContext(BaseContext);
export const EditorProvider = Provider;
