import { useCallback, useRef, useState, type ChangeEventHandler } from "react";
import PlayIcon from "~icons/fa-solid/play";
import PauseIcon from "~icons/fa-solid/pause";
import StopIcon from "~icons/fa-solid/stop";

import abcjs, { type MidiBuffer, type TuneObject } from "abcjs";
import useLocalStorage from "use-local-storage-state";

import { ABCEditor, type ABCEditorChangeHandler } from "@abc-editor/react";
import "@abc-editor/react/dist/style.css";

export default function ReactDemoEditor() {
  const [abc, setAbc] = useLocalStorage("demoAbc", {
    defaultValue: `%%stretchlast false\nM:4/4\nK:D clef=treble\n`,
  });
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [playbackLoaded, setPlaybackLoaded] = useState(false);
  const [playback, setPlayback] = useState<"play" | "pause" | "stop">("stop");
  const [tempo, setTempo] = useState(120);

  const synthRef = useRef<MidiBuffer>();
  const tuneObjectRef = useRef<TuneObject>();

  const onChange: ABCEditorChangeHandler = useCallback((abc, tuneObject) => {
    setAbc(abc);
    synthRef.current?.stop();
    tuneObjectRef.current = tuneObject;
    setPlaybackLoaded(false);
  }, []);

  const playOrPause = async () => {
    if (!synthRef.current) synthRef.current = new abcjs.synth.CreateSynth();
    const synth = synthRef.current;

    if (playback === "play") {
      synth.pause();
      setPlayback("pause");
    } else {
      if (playbackLoaded) {
        synth.start();
        setPlayback("play");
        return;
      }
      setPlaybackLoading(true);
      try {
        await synth.init({
          visualObj: tuneObjectRef.current,
          options: {
            program: 4,
            qpm: tempo,
            onEnded: () => setPlayback("stop"),
          },
        });
        await synth.prime();
        setPlaybackLoaded(true);
        synth.start();
        setPlayback("play");
      } catch (err) {
        console.log("Error setting up audio:", err);
      }
      setPlaybackLoading(false);
    }
  };

  const stop = () => {
    synthRef.current?.stop();
  };

  const onChangeTempo: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTempo(e.currentTarget.valueAsNumber);
    stop();
    setPlaybackLoaded(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".5em" }}>
          <button
            style={{ display: "flex", alignItems: "center", gap: ".5em" }}
            onClick={playOrPause}
            disabled={playbackLoading}
          >
            {playback === "stop" || playback === "pause" ? (
              <>
                <PlayIcon />
                Play
              </>
            ) : (
              <>
                <PauseIcon />
                Pause
              </>
            )}
          </button>
          <button
            style={{ display: "flex", alignItems: "center", gap: ".5em" }}
            onClick={stop}
            disabled={playbackLoading}
          >
            <StopIcon /> Stop
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".5em" }}>
          <div style={{ minWidth: "5.5em" }}>Tempo: {tempo}</div>
          <input
            type="range"
            style={{ accentColor: "var(--sl-color-text-accent)" }}
            min={60}
            max={200}
            step={1}
            value={tempo}
            onChange={onChangeTempo}
          />
        </div>
      </div>
      <ABCEditor
        initialAbc={abc}
        onChange={onChange}
        onNote={onNote}
        enableKbdShortcuts
        responsive
      />
      <br />
      <p>Generated ABC notation:</p>
      <textarea readOnly rows={6} cols={50} value={abc} />
    </div>
  );
}

const onNote = (midiNum: number) => {
  abcjs.synth
    .playEvent(
      [
        {
          duration: 0.125,
          gap: 0,
          instrument: 4,
          pitch: midiNum,
          start: 0,
          volume: 100,
        },
      ],
      [],
      1000,
    )
    .catch((err) => console.error(err));
};
