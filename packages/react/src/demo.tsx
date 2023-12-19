import { createRoot } from "react-dom/client";
import { SignInButton } from "./index";

const domNode = document.getElementById("root");
const root = createRoot(domNode!);
root.render(<SignInButton />);
