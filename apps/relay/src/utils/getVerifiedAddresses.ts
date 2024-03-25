import { VerificationsAPIResponse } from "../types";
import { getConfig } from "./getConfig";

const { hubUrl } = getConfig();

export async function getVerifiedAddresses(fid: number) {
  const verifications: VerificationsAPIResponse = await fetch(`${hubUrl}/v1/verificationsByFid?fid=${fid}`).then((r) =>
    r.json(),
  );

  return verifications.messages.map((message) => {
    return message.data?.verificationAddAddressBody?.address || message.data?.verificationAddEthAddressBody?.address;
  });
}
