import * as ethers from "ethers";

const { providers } = ethers;

export const JsonRpcProvider =
  // @ts-expect-error -- ethers v6 compatibility hack
  providers ? providers.JsonRpcProvider : ethers.JsonRpcProvider;

export const Provider =
  // @ts-expect-error -- ethers v6 compatibility hack
  providers ? providers.Provider : ethers.Provider;

export type Provider = typeof Provider;
