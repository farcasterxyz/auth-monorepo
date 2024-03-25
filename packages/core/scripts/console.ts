import path from "path";
import { createAppClient, createWalletClient, viemConnector } from "../src/index";
import * as repl from "repl";

(async () => {
  console.log("Loading console environment...");

  const context = {
    createAppClient,
    createWalletClient,
    viemConnector,
    appClient: createAppClient({
      relay: "http://localhost:8000",
      ethereum: viemConnector(),
    }),

    walletClient: createWalletClient({
      relay: "http://localhost:8000",
      ethereum: viemConnector(),
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
