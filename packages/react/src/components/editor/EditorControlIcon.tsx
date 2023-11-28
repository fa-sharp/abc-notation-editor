import { useEffect, useRef } from "react";

type Props = {
  src: string;
  size?: number;
};

const EditorControlIcon = ({ src, size }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const svg = ref.current?.querySelector("svg");
    if (svg && src && size) {
      svg.style.height = `${size}px`;
      svg.style.width = `${size}px`;
    }
  }, [size, src]);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: src }} />;
};

export default EditorControlIcon;
