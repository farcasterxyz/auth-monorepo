import { getCustodyAddress } from "./getCustodyAddress.js";
import { getVerifiedAddresses } from "./getVerifiedAddresses.js";

export async function getAddresses(fid: number) {
  const [custody, verifications] = await Promise.all([getCustodyAddress(fid), getVerifiedAddresses(fid)]);
  return { custody, verifications };
}
