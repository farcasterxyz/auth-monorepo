import { type VerificationsAPIResponse } from "../types/verifications.js";
import { getConfig } from "./getConfig.js";
import { fetch, Agent } from "undici";

const { hubUrl, hubFallbackUrl } = getConfig();

export async function getVerifiedAddresses(fid: number) {
  const mainUrl = `${hubUrl}/v1/verificationsByFid?fid=${fid}`;
  const fallbackUrl = `${hubFallbackUrl}/v1/verificationsByFid?fid=${fid}`;
  const verifications = await fetch(mainUrl, {
    dispatcher: new Agent({ connectTimeout: 1500 }),
  })
    // TODO: don't do type cast and do zod schema validation instead
    .then(async (r) => (await r.json()) as VerificationsAPIResponse)
    .catch(async () => {
      return fetch(fallbackUrl, {
        dispatcher: new Agent({ connectTimeout: 3500 }),
      }).then(async (r) => (await r.json()) as VerificationsAPIResponse);
    });

  return verifications.messages.map((message) => {
    return message.data?.verificationAddAddressBody?.address || message.data?.verificationAddEthAddressBody?.address;
  });
}
