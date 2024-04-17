// Copied from https://github.com/wevm/wagmi/blob/main/packages/core/src/types/utils.ts
/** Combines members of an intersection into a readable type. */
// https://twitter.com/mattpocockuk/status/1622730173446557697?s=20&t=NdpAcmEFXY01xkqU3KO0Mg
export type Evaluate<type> = { [key in keyof type]: type[key] } & unknown;

/**
 * Makes all properties of an object optional.
 *
 * Compatible with [`exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes).
 */
export type ExactPartial<type> = {
  [key in keyof type]?: type[key] | undefined;
};

/** Strict version of built-in Omit type */
export type Omit<type, keys extends keyof type> = Pick<type, Exclude<keyof type, keys>>;
