import path from "path";
import { createAppClient, createAuthClient, viem } from "../src/index";
import * as repl from "repl";

(async () => {
  console.log("Loading console environment...");

  const context = {
    createAppClient,
    createAuthClient,
    viem,
    appClient: createAppClient({
      relay: "http://localhost:8000",
      ethereum: viem(),
    }),

    authClient: createAuthClient({
      relay: "http://localhost:8000",
      ethereum: viem(),
    }),
  };

  const replServer = repl.start({ prompt: "> ", breakEvalOnSigint: true }).on("exit", () => {
    process.exit(0);
  });
  replServer.setupHistory(path.resolve(__dirname, "..", "..", ".console-history"), (err) => {
    if (err !== null) console.log(err);
  });
  for (const [key, value] of Object.entries(context)) {
    replServer.context[key] = value;
  }
})();
