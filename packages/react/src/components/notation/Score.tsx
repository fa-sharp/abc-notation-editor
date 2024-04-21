import { useEditorContext } from "../../context/EditorContext";

/** The ABC score display. */
export default function Score() {
  const { setRenderDiv } = useEditorContext();

  return (
    <div
      style={{
        padding: 20,
        overflow: "auto",
        width: "100%",
        cursor: import.meta.env.PROD ? "none" : undefined,
      }}
    >
      <div ref={setRenderDiv} />
    </div>
  );
}
