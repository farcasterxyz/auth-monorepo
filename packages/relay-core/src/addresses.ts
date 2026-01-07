import { ResultAsync, err, ok } from "neverthrow";
import { createPublicClient, http } from "viem";
import type { PublicClient, HttpTransport, Hex } from "viem";
import { optimism } from "viem/chains";
import { type RelayAsyncResult, RelayError } from "./errors";

const ID_REGISTRY_ADDRESS = "0x00000000Fc6c5F01Fc30151999387Bb99A9f489b" as const;

const idRegistryABI = [
  {
    inputs: [{ internalType: "uint256", name: "fid", type: "uint256" }],
    name: "custodyOf",
    outputs: [{ internalType: "address", name: "custody", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface VerificationAddAddressBody {
  address: string;
}

interface ArbitraryVerificationMessageData {
  verificationAddEthAddressBody: never;
  verificationAddAddressBody: VerificationAddAddressBody;
}

interface EthVerificationMessageData {
  verificationAddEthAddressBody: VerificationAddAddressBody;
  verificationAddAddressBody: never;
}

type VerificationMessageData = ArbitraryVerificationMessageData | EthVerificationMessageData;

interface VerificationMessage {
  data: VerificationMessageData;
}

interface VerificationsAPIResponse {
  messages: VerificationMessage[];
}

export interface AddressServiceConfig {
  hubUrl: string;
  hubFallbackUrl: string;
  optimismRpcUrl: string;
}

export class AddressService {
  private publicClient: PublicClient<HttpTransport, typeof optimism>;
  private config: AddressServiceConfig;

  constructor(config: AddressServiceConfig) {
    this.config = config;
    this.publicClient = createPublicClient({
      chain: optimism,
      transport: http(config.optimismRpcUrl),
    });
  }

  async getAddresses(fid?: number): RelayAsyncResult<{ custody: Hex; verifications: string[] }> {
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
      (error) => new RelayError("unknown", error as Error),
    );
  }

  async verifications(fid?: number): RelayAsyncResult<string[]> {
    const url = `${this.config.hubUrl}/v1/verificationsByFid?fid=${fid}`;
    const fallbackUrl = `${this.config.hubFallbackUrl}/v1/verificationsByFid?fid=${fid}`;

    const fetchWithTimeout = async (targetUrl: string): Promise<VerificationsAPIResponse> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(targetUrl, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json() as Promise<VerificationsAPIResponse>;
      } finally {
        clearTimeout(timeout);
      }
    };

    return ResultAsync.fromPromise(fetchWithTimeout(url), (error) => new RelayError("unknown", error as Error))
      .orElse(() =>
        ResultAsync.fromPromise(fetchWithTimeout(fallbackUrl), (error) => new RelayError("unknown", error as Error)),
      )
      .andThen((data) =>
        ok(
          data.messages.map((message) => {
            return (
              message.data?.verificationAddAddressBody?.address || message.data?.verificationAddEthAddressBody?.address
            );
          }),
        ),
      );
  }
}
