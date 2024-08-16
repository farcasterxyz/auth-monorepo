import { ResultAsync, err, ok } from "neverthrow";
import { createPublicClient, http } from "viem";
import { PublicClient, HttpTransport, Hex } from "viem";
import { optimism } from "viem/chains";
import { ID_REGISTRY_ADDRESS, idRegistryABI, bytesToHexString, bytesToBase58 } from "@farcaster/hub-nodejs";

import { RelayAsyncResult, RelayError } from "./errors";
import { HUB_URL, HUB_FALLBACK_URL, OPTIMISM_RPC_URL } from "./env";
import { HubService } from "./hubs";

export class AddressService {
  private publicClient: PublicClient<HttpTransport, typeof optimism>;

  constructor() {
    this.publicClient = createPublicClient({
      chain: optimism,
      transport: http(OPTIMISM_RPC_URL),
    });
  }

  async getAddresses(fid: number): RelayAsyncResult<{ custody: Hex; verifications: string[] }> {
    const custody = await this.custody(fid);
    if (custody.isErr()) {
      return err(custody.error);
    }

    let verifications = await this.tryVerifications(fid, HUB_URL);
    if (verifications.isErr()) {
      verifications = await this.tryVerifications(fid, HUB_FALLBACK_URL);
    }

    if (verifications.isErr()) {
      return err(verifications.error);
    }

    return ok({
      custody: custody.value,
      verifications: verifications.value,
    });
  }

  async custody(fid: number): RelayAsyncResult<Hex> {
    return ResultAsync.fromPromise(
      this.publicClient.readContract({
        address: ID_REGISTRY_ADDRESS,
        abi: idRegistryABI,
        functionName: "custodyOf",
        args: [BigInt(fid ?? 0)],
      }),
      (error) => {
        return new RelayError("unknown", error as Error);
      },
    );
  }

  async tryVerifications(fid: number, hubEndpoint: string): RelayAsyncResult<string[]> {
    const hub = await HubService.getReadyClient(hubEndpoint);
    if (hub.isErr()) return err(hub.error);

    const { client } = hub.value;
    const verificationsResult = await client.getVerificationsByFid({
      fid,
    });
    if (verificationsResult.isErr()) {
      return err(new RelayError("unavailable", verificationsResult.error));
    }
    const verifications: string[] = [];
    for (const message of verificationsResult.value.messages) {
      const addressBytes = message.data?.verificationAddAddressBody?.address;
      if (addressBytes) {
        let encodedAddress: string;
        if (addressBytes.length === 20) {
          // Eth address
          const encoded = bytesToHexString(addressBytes);
          if (encoded.isErr()) {
            return err(new RelayError("unavailable", encoded.error));
          }
          encodedAddress = encoded.value;
        } else {
          // Solana address
          const encoded = bytesToBase58(addressBytes);
          if (encoded.isErr()) {
            return err(new RelayError("unavailable", encoded.error));
          }
          encodedAddress = encoded.value;
        }

        verifications.push(encodedAddress);
      }
    }
    return ok(verifications);
  }
}
