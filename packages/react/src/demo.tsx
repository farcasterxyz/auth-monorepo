import { createRoot } from "react-dom/client";
import { Demo } from "./exports/index.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const domNode = document.getElementById("root");
// biome-ignore lint/style/noNonNullAssertion: for demo purposes
const root = createRoot(domNode!);

const queryClient = new QueryClient();
root.render(
  <QueryClientProvider client={queryClient}>
    <Demo />
  </QueryClientProvider>,
);
