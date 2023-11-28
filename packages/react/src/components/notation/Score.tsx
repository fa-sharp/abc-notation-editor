import { useEditorContext } from "../../context/EditorContext";

type ScoreProps = {
  minWidth?: number;
  maxHeight?: number;
};

/** The ABC score display. */
export default function Score({ minWidth = 600, maxHeight = 300 }: ScoreProps) {
  const { setRenderDiv } = useEditorContext();

  return (
    <div
      style={{
        minWidth,
        maxHeight,
        padding: 20,
        overflow: "auto",
      }}
    >
      <div ref={setRenderDiv} />
    </div>
  );
}
