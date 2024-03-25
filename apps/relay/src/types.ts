import { type Hex } from "viem";

export type VerificationAddAddressBody = {
  address: Hex;
};

export type ArbitraryVerificationMessageData = {
  verificationAddEthAddressBody: never;
  verificationAddAddressBody: VerificationAddAddressBody;
};

export type EthVerificationMessageData = {
  verificationAddEthAddressBody: VerificationAddAddressBody;
  verificationAddAddressBody: never;
};

export type VerificationMessageData = ArbitraryVerificationMessageData | EthVerificationMessageData;

export type VerificationMessage = {
  data: VerificationMessageData;
};

export type VerificationsAPIResponse = {
  messages: VerificationMessage[];
};
