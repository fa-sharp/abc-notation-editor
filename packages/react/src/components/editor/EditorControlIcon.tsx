import { useCallback, useMemo } from "react";
import { Icon, getIcon } from "@abc-editor/core";

type Props = {
  icon: Icon;
  size?: number;
};

const EditorControlIcon = ({ icon, size }: Props) => {
  const rawSvg = useMemo(() => getIcon(icon), [icon]);

  const refCallback = useCallback(
    (ref: HTMLDivElement | null) => {
      if (!ref) return;
      const svg = ref.querySelector("svg");
      if (svg && size) {
        svg.style.height = `${size}px`;
        svg.style.width = `${size}px`;
      }
    },
    [size]
  );

  return <div ref={refCallback} dangerouslySetInnerHTML={{ __html: rawSvg }} />;
};

export default EditorControlIcon;
