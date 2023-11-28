/// <reference types="vite/client" />

declare module "*.svg" {
  const inlineSvg: string;
  export default inlineSvg;
}
