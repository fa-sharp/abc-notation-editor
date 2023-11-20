import { createRoot } from "react-dom/client";
import BasicExample from "./BasicExample";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<BasicExample />);
