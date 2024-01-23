import axios, { AxiosInstance } from "axios";
import { ResultAsync, err, ok } from "neverthrow";
import { createPublicClient, http } from "viem";
import type { PublicClient, HttpTransport, Hex } from "viem";
import { optimism } from "viem/chains";
import { ID_REGISTRY_ADDRESS, idRegistryABI } from "@farcaster/core";

import { RelayAsyncResult, RelayError } from "./errors";
import { HUB_URL, OPTIMISM_RPC_URL } from "./env";

interface VerificationAddEthAddressBody {
  address: Hex;
}

interface VerificationMessageData {
  verificationAddEthAddressBody: VerificationAddEthAddressBody;
}

interface VerificationMessage {
  data: VerificationMessageData;
}

interface VerificationsAPIResponse {
  messages: VerificationMessage[];
}

export class AddressService {
  private http: AxiosInstance;
  private publicClient: PublicClient<HttpTransport, typeof optimism>;

  constructor() {
    this.http = axios.create();
    this.publicClient = createPublicClient({
      chain: optimism,
      transport: http(OPTIMISM_RPC_URL),
    });
  }

  async getAddresses(fid?: number): RelayAsyncResult<{ custody: Hex; verifications: Hex[] }> {
    const custody = await this.custody(fid);
    if (custody.isErr()) {
      return err(custody.error);
    }
    const verifications = await this.verifications(fid);
    if (verifications.isErr()) {
      return err(verifications.error);
    }
    return ok({
      custody: custody.value,
      verifications: verifications.value,
    });
  }

  async custody(fid?: number): RelayAsyncResult<Hex> {
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

  async verifications(fid?: number): RelayAsyncResult<Hex[]> {
    const url = `${HUB_URL}/v1/verificationsByFid?fid=${fid}`;
    return ResultAsync.fromPromise(this.http.get<VerificationsAPIResponse>(url), (error) => {
      return new RelayError("unknown", error as Error);
    }).andThen((res) => {
      return ok(res.data.messages.map((message) => message.data.verificationAddEthAddressBody.address));
    });
  }
}
