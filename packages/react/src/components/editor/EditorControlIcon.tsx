type Props = {
  src: string;
  size?: number;
};

const EditorControlIcon = ({ src, size }: Props) => {
  return <img src={src} height={size} width={size} />;
};
export default EditorControlIcon;
