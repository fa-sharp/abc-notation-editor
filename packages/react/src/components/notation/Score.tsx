import { useEditorContext } from "../../context/EditorContext";

/** The ABC score display. */
export default function Score() {
  const { setRenderDiv } = useEditorContext();

  return (
    <div
      style={{
        padding: 20,
        overflow: "auto",
      }}
    >
      <div ref={setRenderDiv} />
    </div>
  );
}
