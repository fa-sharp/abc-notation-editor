import { useEditorContext } from "../../context/EditorContext";

type ScoreProps = {
  width?: number;
  maxHeight?: number;
};

/** The ABC score display. */
export default function Score({ width = 400, maxHeight = 300 }: ScoreProps) {
  const { setRenderDiv } = useEditorContext();

  return (
    <div style={{ width, maxHeight, padding: 20, overflow: "auto" }}>
      <div ref={setRenderDiv} />
    </div>
  );
}
