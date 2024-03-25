import { getCustodyAddress } from "./getCustodyAddress";
import { getVerifiedAddresses } from "./getVerifiedAddresses";

export async function getAddresses(fid: number) {
  const [custody, verifications] = await Promise.all([getCustodyAddress(fid), getVerifiedAddresses(fid)]);
  return { custody, verifications };
}
