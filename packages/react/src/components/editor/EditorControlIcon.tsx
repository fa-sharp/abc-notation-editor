import { useCallback, useMemo } from "react";
import { Icon, getIcon } from "@abc-editor/core";

type Props = {
  icon: Icon;
  size?: number;
};

const EditorControlIcon = ({ icon, size }: Props) => {
  const rawSvg = useMemo(() => getIcon(icon), [icon]);

  const refCallback = useCallback(
    (div: HTMLDivElement | null) => {
      if (!div || !rawSvg) return;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = rawSvg;
      const svg = tempDiv.firstChild;
      if (svg instanceof SVGElement && size) {
        svg.setAttribute("height", size.toString());
        svg.setAttribute("width", size.toString());
      }
      svg && div.replaceChildren(svg);
    },
    [rawSvg, size]
  );

  return <div ref={refCallback} />;
};

export default EditorControlIcon;
