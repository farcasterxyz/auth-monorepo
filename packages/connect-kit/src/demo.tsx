import { createRoot } from "react-dom/client";
import { Demo } from "./index";

const domNode = document.getElementById("root");
const root = createRoot(domNode!);
root.render(<Demo />);
