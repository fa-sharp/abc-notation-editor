import { forwardRef, useCallback, ForwardRefRenderFunction } from "react";
import { useEditorContext } from "../../context/EditorContext";

const Score: ForwardRefRenderFunction<HTMLDivElement> = (_, forwardedRef) => {
  const { setRenderDiv } = useEditorContext();

  const ref = useCallback(
    (div: HTMLDivElement | null) => {
      setRenderDiv(div);
      if (forwardedRef instanceof Function) forwardedRef(div);
      else if (forwardedRef) forwardedRef.current = div;
    },
    [forwardedRef, setRenderDiv]
  );

  return (
    <div
      style={{
        padding: 20,
        overflow: "auto",
        width: "100%",
      }}
    >
      <div ref={ref} />
    </div>
  );
};

/** The ABC score display. */
const ScoreWithForwardedRef = forwardRef(Score);

export default ScoreWithForwardedRef;
