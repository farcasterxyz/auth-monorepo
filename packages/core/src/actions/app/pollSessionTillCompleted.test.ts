import { createAppClient } from "../../clients/createAppClient.js";
import { jest } from "@jest/globals";
import { viemConnector } from "../../clients/ethereum/viemConnector.js";

describe("session", () => {
  const client = createAppClient({
    ethereum: viemConnector(),
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("polls for session changes", async () => {
    const pending1 = new Response(JSON.stringify({ state: "pending" }), {
      status: 202,
    });
    const pending2 = new Response(JSON.stringify({ state: "pending" }), {
      status: 202,
    });
    const completed = new Response(JSON.stringify({ state: "completed" }));
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(pending1)
      .mockResolvedValueOnce(pending2)
      .mockResolvedValueOnce(completed);

    const res = await client.pollSessionTillCompleted({
      sessionToken: "some-session-token",
    });

    expect(res).toEqual({ state: "completed" });
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});
