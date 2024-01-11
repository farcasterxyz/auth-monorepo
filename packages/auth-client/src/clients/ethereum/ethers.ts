import * as ethers from "ethers";

export const JsonRpcProvider =
  // @ts-expect-error -- ethers v6 compatibility hack
  ethers.providers ? ethers.providers.JsonRpcProvider : ethers.JsonRpcProvider;

export const Provider =
  // @ts-expect-error -- ethers v6 compatibility hack
  ethers.providers ? ethers.providers.Provider : ethers.Provider;

export type Provider = typeof Provider;
