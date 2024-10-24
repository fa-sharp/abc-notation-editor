import { useEditorContext } from "../../context/EditorContext";

/** The ABC score display. */
export default function Score() {
  const { setRenderDiv } = useEditorContext();

  return (
    <div
      style={{
        padding: 10,
        overflow: "auto",
        width: "100%",
      }}
    >
      <div ref={setRenderDiv} />
    </div>
  );
}
