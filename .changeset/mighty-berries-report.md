---
"@farcaster/auth-client": minor
"@farcaster/auth-kit": patch
"with-next-auth": patch
"frontend-only": patch
"@farcaster/auth-relay": patch
---

This release drops `ethers` and `siwe` dependency in favour of `viem/siwe`

---

**Breaking changes**:

- `@farcaster/auth-client`:
  - `AppClient.verifySignInMessage` won't return `success` and instead will throw
    an error if the verification hasn't succeeded.
  - `issuedAt` is now of type `Date`, opposed to `string` in the past.
  - `viem` peer dependency bumped to `2.x` version and won't support `1.x` versions.
