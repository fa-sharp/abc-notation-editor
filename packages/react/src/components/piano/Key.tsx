import clsx from "clsx";
import { useCallback } from "react";
import { Midi } from "tonal";

import styles from "./Key.module.scss";

const BLACK_KEY_HALF_STEPS = [1, 3, 6, 8, 10];
const BLACK_KEY_SHIFT_LEFT = [1, 6];
const BLACK_KEY_SHIFT_RIGHT = [3, 10];

interface Props {
  midiNum: number;
  played: boolean;
  onKeyPlayed: () => void;
  onKeyReleased: () => void;
}

export default function Key({
  midiNum,
  played,
  onKeyPlayed,
  onKeyReleased,
}: Props) {
  const halfSteps = midiNum % 12;
  const isBlackKey = BLACK_KEY_HALF_STEPS.includes(halfSteps);

  let adjustPosition: "none" | "left" | "right" = "none";
  if (isBlackKey) {
    if (BLACK_KEY_SHIFT_LEFT.includes(halfSteps)) adjustPosition = "left";
    else if (BLACK_KEY_SHIFT_RIGHT.includes(halfSteps))
      adjustPosition = "right";
  }

  const className = clsx(styles.key, {
    [styles.white]: !isBlackKey,
    [styles.black]: isBlackKey,
    [styles.left]: adjustPosition === "left",
    [styles.right]: adjustPosition === "right",
    [styles.played]: played,
  });

  const onMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      onKeyPlayed();
    },
    [onKeyPlayed]
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      onKeyReleased();
    },
    [onKeyReleased]
  );

  return (
    <div
      className={className}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onMouseDown}
      onTouchEnd={onMouseUp}
      draggable={false}
    >
      {halfSteps === 0 && (
        <div className={styles.keyLabel}>{Midi.midiToNoteName(midiNum)}</div>
      )}
    </div>
  );
}
