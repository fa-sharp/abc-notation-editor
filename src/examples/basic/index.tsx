import { createRoot } from "react-dom/client";
import BasicExample from "./BasicExample";
import { StrictMode } from "react";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(
  <StrictMode>
    <BasicExample />
  </StrictMode>
);
