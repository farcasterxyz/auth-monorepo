# @farcaster/auth-kit

## 0.2.2

### Patch Changes

- 62874a0: - support redirectUrl
  - remove ethers hard dependency
- Updated dependencies [62874a0]
  - @farcaster/auth-client@0.1.1

## 0.2.1

### Patch Changes

- 1bee0fb: fix: memoize signIn/signOut in useSignIn

## 0.2.0

### Minor Changes

- fix: remove qrCodeUri return value

## 0.1.4

### Patch Changes

- fix: check using typeof

## 0.1.3

### Patch Changes

- 2c76849: fix: check for window in domain defaults

## 0.1.2

### Patch Changes

- c91fc13: Add onSignOut callback to SignInButton

## 0.1.1

### Patch Changes

- 5931f5a: fix: check window.location for RN compatibility
- 181e0e8: add verifications to profile
- 8913f4e: add optional disableSignOut prop
- 0c216c4: feat: optional provider config prop

## 0.1.0

### Minor Changes

- cfd30e4: Return custody address and verifications
- 5475d3d: Add Sign Out button

### Patch Changes

- 02479a5: Add CSS classes to components
- be9a35a: fix: iOS redirect delay
- 52bc8ab: Fix: memoize callbacks on SignInButton
- 47a8553: fix: reconnect on channel timeout
- 8303558: add default siweUri and domain
- Updated dependencies [cfd30e4]
  - @farcaster/auth-client@0.1.0

## 0.0.39

### Patch Changes

- cf802f0: fix already on mobile button

## 0.0.38

### Patch Changes

- 86deffa: update sign in UI

## 0.0.37

### Patch Changes

- Fix: read nonce from return value

## 0.0.36

### Patch Changes

- Updated dependencies
  - @farcaster/auth-client@0.0.22

## 0.0.35

### Patch Changes

- Updated dependencies
  - @farcaster/auth-client@0.0.21

## 0.0.34

### Patch Changes

- Updated dependencies
  - @farcaster/auth-client@0.0.20

## 0.0.33

### Patch Changes

- Updated dependencies
  - @farcaster/auth-client@0.0.19

## 0.0.32

### Patch Changes

- Rename package

## 0.0.31

### Patch Changes

- 65cc00f: Remove target="\_blank" workaround

## 0.0.30

### Patch Changes

- Updated dependencies
  - @farcaster/connect@0.0.17

## 0.0.29

### Patch Changes

- Updated dependencies [8f5c4c9]
  - @farcaster/connect@0.0.16

## 0.0.28

### Patch Changes

- Updated dependencies [23c673f]
  - @farcaster/connect@0.0.15

## 0.0.27

### Patch Changes

- 55a674c: convert relay to optional arg in config

## 0.0.26

### Patch Changes

- 1c02300: relax react-dom and viem peerDependency verion ranges
- 55d37f4: esm only build

## 0.0.25

### Patch Changes

- 0519b9c: revert declare types

## 0.0.24

### Patch Changes

- declare types in package.json

## 0.0.23

### Patch Changes

- 57fc065: use local nonce value

## 0.0.22

### Patch Changes

- Updated dependencies [fd65d37]
- Updated dependencies [1507332]
  - @farcaster/connect@0.0.14

## 0.0.21

### Patch Changes

- Updated dependencies
  - @farcaster/connect@0.0.13

## 0.0.20

### Patch Changes

- 76c2185: Use relay.farcaster.xyz as default relay URL
- Updated dependencies [76c2185]
  - @farcaster/connect@0.0.12

## 0.0.19

### Patch Changes

- ad62c7e: ship a polyfill for Buffer

## 0.0.18

### Patch Changes

- 603f005: fix re-opening of modal

## 0.0.17

### Patch Changes

- remove unused vite-plugin-node-polyfills dependency
- Updated dependencies
  - @farcaster/connect@0.0.11

## 0.0.16

### Patch Changes

- d2d6cb8: fix bad build

## 0.0.15

### Patch Changes

- fix onSuccess type

## 0.0.14

### Patch Changes

- fix bad build

## 0.0.13

### Patch Changes

- f148b73: open links if on mobile

## 0.0.12

### Patch Changes

- ace9fa1: Change Viem to peer dependency
- 1afd3e9: minor react optimizations in ConnectButton
- 683c5b2: Add callbacks to hooks/components
- 5009879: Set siweUri and domain on config
- Updated dependencies [ace9fa1]
  - @farcaster/connect@0.0.10

## 0.0.11

### Patch Changes

- support nonce getter fn
- Updated dependencies
  - @farcaster/connect@0.0.9

## 0.0.10

### Patch Changes

- Updated dependencies
  - @farcaster/connect@0.0.8

## 0.0.9

### Patch Changes

- 6de7239: Add useSignInMessage hook
- 394e75e: Lowercase URL/URI, add props to ConnectButton
- Updated dependencies [7694d67]
- Updated dependencies [394e75e]
  - @farcaster/connect@0.0.7

## 0.0.8

### Patch Changes

- d906f3c: Chore: prune bundles
- Updated dependencies [d906f3c]
  - @farcaster/connect@0.0.6

## 0.0.7

### Patch Changes

- Updated dependencies [6e70ebc]
  - @farcaster/connect@0.0.5

## 0.0.6

### Patch Changes

- Fix: roll up types

## 0.0.5

### Patch Changes

- Fix: bundle types

## 0.0.4

### Patch Changes

- Fix: add CSS to package

## 0.0.3

### Patch Changes

- 07597c6: Fix: include /dist in package

## 0.0.2

### Patch Changes

- Updated dependencies [02959e9]
  - @farcaster/connect@0.0.4

## 0.0.1

### Patch Changes

- Updated dependencies [bb9be41]
- Updated dependencies
  - @farcaster/connect@0.0.3
