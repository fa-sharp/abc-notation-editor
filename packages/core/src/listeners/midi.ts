/**
 * Setup a MIDI event listener, to add notes via a MIDI keyboard. Listens for the
 * MIDI `note-on` event on all detected MIDI inputs. Returns a cleanup function to remove the listeners. */
export const setupMIDIListener = (onAddNote: (midiNum: number) => void) => {
  let inputs: MIDIInputMap | null = null;

  const listener = (ev: MIDIMessageEvent) => {
    // 144 is the `note-on` event code
    if (ev?.data?.[0] === 144 && ev.data[1]) onAddNote(ev.data[1]);
  };

  navigator
    .requestMIDIAccess({ sysex: true })
    .then((midiAccess) => {
      inputs = midiAccess.inputs;
      inputs.forEach((input) => {
        input.addEventListener("midimessage", listener);
      });
    })
    .catch((err) => console.error("Error getting MIDI access:", err));

  return () => {
    inputs?.forEach((input) =>
      input.removeEventListener("midimessage", listener)
    );
    inputs = null;
  };
};
