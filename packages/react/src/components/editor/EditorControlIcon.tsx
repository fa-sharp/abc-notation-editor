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
      if (!ref || !rawSvg) return;
      const svg = ref.querySelector("svg");
      if (svg && size) {
        svg.setAttribute("height", size.toString());
        svg.setAttribute("width", size.toString());
      }
    },
    [rawSvg, size]
  );

  return <div ref={refCallback} dangerouslySetInnerHTML={{ __html: rawSvg }} />;
};

export default EditorControlIcon;
