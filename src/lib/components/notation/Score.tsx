import { useEditorContext } from "~src/lib/context/EditorContext";

type Props = {
  width?: number;
  height?: number;
};

export default function Score({ width = 400, height = 300 }: Props) {
  const { setRenderDiv } = useEditorContext();

  return (
    <div
      style={{ width, height, padding: 20, overflow: "auto", cursor: "none" }}
    >
      <div ref={setRenderDiv} />
    </div>
  );
}
