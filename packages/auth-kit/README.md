# `@farcaster/auth-kit`

A React library that makes it easy to add Sign In With Farcaster to your application.

## Getting Started

### Installation

Install AuthKit and its peer dependency [viem](https://viem.sh/).

```sh
npm install @farcaster/auth-kit viem
```

**Note:** AuthKit is a [React](https://reactjs.org/) library. If you're using another frontend framework, take a look at the [`@farcaster/auth-client`](../auth-client/) library instead.

### Import

Import styles and functions.

```tsx
import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider } from "@farcaster/auth-kit";
```

### Add Provider

Wrap your application with `AuthKitProvider`.

```tsx
const config = {
  // For a production app, replace this with an Optimism Mainnet
  // RPC URL from a provider like Alchemy or Infura.
  rpcUrl: "https://mainnet.optimism.io",
  domain: "example.com",
  siweUri: "https://example.com/login",
};

const App = () => {
  return <AuthKitProvider config={config}>{/* Your App */}</AuthKitProvider>;
};
```

## Add the sign in button

Then, in your app, import and render the `SignInButton` component.

```tsx
import { SignInButton } from "@farcaster/auth-kit";

export const SignIn = ({ nonce }: { nonce: string }) => {
  return <SignInButton nonce={nonce} />;
};
```

A Sign in with Farcaster button will be rendered. When the user clicks it they will be prompted to complete sign in using their Farcaster wallet application. Once they complete sign in a signed message will be returned to your callback.

## Examples

You can find official examples [here](https://github.com/farcasterxyz/connect-monorepo/tree/main/examples).

## Troubleshooting

Projects using [Create React App (CRA)](https://create-react-app.dev/) may run into TypeScript version conflicts, as `react-scripts@5.0.1` expects a peer dependency of TypeScript version `^3.2.1 || ^4`, while both viem and AuthKit require `>=5.0.4`.

To resolve this issue:

- Install the latest version of TypeScript: `npm i typescript -D`
- Add an override for `react-scripts` to your package.json file, to remove the version ceiling:

```json
"overrides": {
  "react-scripts": {
    "typescript": ">3.2.1"
  }
}
```

**Note**: Always be careful with overrides and ensure they are compatible with the packages using them.

## Components

### `AuthKitProvider`

Wrap your application in an `AuthKitProvider` to use Farcaster Auth.

```tsx
const config = {
  domain: "example.com",
  siweUri: "https://example.com/login",
  rpcUrl: "https://mainnet.optimism.io",
  relay: "https://relay.farcaster.xyz",
};

const App = () => {
  return <AuthKitProvider config={config}>{/* Your App */}</AuthKitProvider>;
};
```

#### Props

| Prop     | Type            | Required | Description                                           |
| -------- | --------------- | -------- | ----------------------------------------------------- |
| `config` | `AuthKitConfig` | Yes      | Configuration object. See options in the table below. |

`config` options:

| Parameter | Type     | Required | Description                         | Default                       |
| --------- | -------- | -------- | ----------------------------------- | ----------------------------- |
| `domain`  | `string` | Yes      | Domain of your application.         | None                          |
| `siweUri` | `string` | Yes      | A URI identifying your application. | None                          |
| `relay`   | `string` | No       | Farcaster Auth relay server URL     | `https://relay.farcaster.xyz` |
| `rpcUrl`  | `string` | No       | Optimism RPC server URL             | `https://mainnet.optimism.io` |
| `version` | `string` | No       | Farcaster Auth version              | `v1`                          |

### `SignInButton`

The main component. Renders a "Sign in With Farcaster" button that prompts the user to scan a QR code with their phone on web or redirects directly on a mobile device. You can use a callback prop or a hook to access the user's authentication status and profile information.

```tsx
import { SignInButton } from "@farcaster/auth-kit";

export const SignIn = ({ nonce }: { nonce: string }) => {
  return (
    <SignInButton
      nonce={nonce}
      onSuccess={({ fid, username }) =>
        console.log(`Hello, ${username}! Your fid is ${fid}.`)
      }
    />
  );
};
```

#### Props

| Prop               | Type                                | Required | Description                                                                         | Default              |
| ------------------ | ----------------------------------- | -------- | ----------------------------------------------------------------------------------- | -------------------- |
| `timeout`          | `number`                            | No       | Relay server timeout in ms.                                                         | `300000` (5 minutes) |
| `interval`         | `number`                            | No       | Relay server polling interval in ms.                                                | `1500` (1.5 seconds) |
| `nonce`            | `string`                            | No       | Random nonce to include in the Sign In With Farcaster message.                      | None                 |
| `notBefore`        | `string`                            | No       | Time when the SIWF message becomes valid. ISO 8601 datetime string.                 | None                 |
| `expirationTime`   | `string`                            | No       | Time when the SIWF message expires. ISO 8601 datetime string.                       | None                 |
| `requestId`        | `string`                            | No       | An optional system specific ID to include in the SIWF message.                      | None                 |
| `onSuccess`        | `(res: UseSignInData) => void`      | No       | Callback invoked when sign in is complete and the user is authenticated.            | None                 |
| `onStatusResponse` | `(res: UseWatchStatusData) => void` | No       | Callback invoked when the component receives a status update from the relay server. | None                 |
| `onError`          | `(error: AuthClientError) => void`  | No       | Error callback function.                                                            | None                 |
| `debug`            | `boolean`                           | No       | Render a debug panel displaying internal AuthKit state.                             | `false`              |

## Hooks

### `useSignIn`

Hook for signing in a user. Connects to the relay server, generates a QR code and sign in link to present to the user, and polls relay server for wallet signature.

```tsx
import { QRCode, useSignIn } from "@farcaster/auth-kit";

function App() {
  const {
    signIn,
    url
    data: { username },
    onSuccess: ({ fid }) => console.log("Your fid:", fid);
  } = useSignIn();

  return (
    <div>
      <button onClick={signIn}>Sign In</button>
      {qrCodeUri && (
        <span>
          Scan this: <QRCode uri={url} />
        </span>
      )}
      {username && `Hello, ${username}!`}
    </div>
  );
}
```

#### Parameters

| Parameter          | Type                                | Required | Description                                                                         | Default              |
| ------------------ | ----------------------------------- | -------- | ----------------------------------------------------------------------------------- | -------------------- |
| `timeout`          | `number`                            | No       | Relay server timeout in ms.                                                         | `300000` (5 minutes) |
| `interval`         | `number`                            | No       | Relay server polling interval in ms.                                                | `1500` (1.5 seconds) |
| `nonce`            | `string`                            | No       | Random nonce to include in the Sign In With Farcaster message.                      | None                 |
| `notBefore`        | `string`                            | No       | Time when the SIWF message becomes valid. ISO 8601 datetime string.                 | None                 |
| `expirationTime`   | `string`                            | No       | Time when the SIWF message expires. ISO 8601 datetime string.                       | None                 |
| `requestId`        | `string`                            | No       | An optional system specific ID to include in the SIWF message.                      | None                 |
| `onSuccess`        | `(res: UseSignInData) => void`      | No       | Callback invoked when sign in is complete and the user is authenticated.            | None                 |
| `onStatusResponse` | `(res: UseWatchStatusData) => void` | No       | Callback invoked when the component receives a status update from the relay server. | None                 |
| `onError`          | `(error: AuthClientError) => void`  | No       | Error callback function.                                                            | None                 |

#### Returns

```ts
  {
    signIn: () => void;
    reconnect: () => void;
    isSuccess: boolean;
    isPolling: boolean;
    isError: boolean;
    error: AuthClientError;
    channelToken: string;
    url: string;
    qrCodeUri: string;
    data: {
        state: "pending" | "complete";
        nonce: string;
        message: string;
        signature: string;
        fid: number;
        username: string;
        bio: string;
        displayName: string;
        pfpUrl: string;
        custody: Hex;
        verifications: Hex[];
    },
    validSignature: boolean;
  };
```

| Parameter            | Description                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `signIn`             | Call this function to connect to the relay and poll for a signature.                             |
| `reconnect`          | Reconnect to the relay and try again. Use in the event of an error.                              |
| `isSuccess`          | True when the relay server returns a valid signature.                                            |
| `isPolling`          | True when the relay state is `"pending"` and the app is polling the relay server for a response. |
| `isError`            | True when an error has occurred.                                                                 |
| `error`              | `AuthClientError` instance.                                                                      |
| `channelToken`       | Farcaster Auth relay channel token.                                                              |
| `url`                | Sign in With Farcaster URL to present to the user. Links to Warpcast in v1.                      |
| `qrcodeUri`          | QR code image data URI encoding `url`.                                                           |
| `data.state`         | Status of the sign in request, either `"pending"` or `"complete"`                                |
| `data.nonce`         | Random nonce used in the SIWE message. If you do not provide a custom nonce, read this value.    |
| `data.message`       | The generated SIWE message.                                                                      |
| `data.signature`     | Hex signature produced by the user's Warpcast wallet.                                            |
| `data.fid`           | User's Farcaster ID.                                                                             |
| `data.username`      | User's Farcaster username.                                                                       |
| `data.bio`           | User's Farcaster bio.                                                                            |
| `data.displayName`   | User's Farcaster display name.                                                                   |
| `data.pfpUrl`        | User's Farcaster profile picture URL.                                                            |
| `data.custody`       | User's Farcaster ID custody address.                                                             |
| `data.verifications` | User's verified addresses.                                                                       |
| `validSignature`     | True when the signature returned by the relay server is valid.                                   |

### `useProfile`

Hook for reading information about the authenticated user.

```tsx
import { useProfile } from "@farcaster/auth-kit";

function App() {
  const {
    isAuthenticated,
    profile: { fid, pfpUrl, username, displayName, bio },
  } = useProfile();

  return (
    <div>
     { isAuthenticated ? <p>Hello, {username}! Your fid is {fid}.<p>  : <p>You're not signed in.</p>}
    </div>
  );
}
```

#### Returns

```ts
  {
    isAuthenticated: boolean;
    profile: {
        fid: number;
        username: string;
        bio: string;
        displayName: string;
        pfpUrl: string;
    },
  };
```

| Parameter               | Description                           |
| ----------------------- | ------------------------------------- |
| `isAuthenticated`       | True if the user is authenticated.    |
| `profile.fid`           | User's Farcaster ID.                  |
| `profile.username`      | User's Farcaster username.            |
| `profile.bio`           | User's Farcaster bio.                 |
| `profile.displayName`   | User's Farcaster display name.        |
| `profile.pfpUrl`        | User's Farcaster profile picture URL. |
| `profile.custody`       | User's Farcaster ID custody address.  |
| `profile.verifications` | User's verified addresses.            |

### `useSignInMessage`

Hook for reading the SIWE message and signature used to authenticate the user.

```tsx
import { useSignInMessage } from "@farcaster/auth-kit";

function App() {
  const { message, signature } = useSignInMessage();

  return (
    <div>
      <p>You signed: {message}</p>
      <p>Your signature: {signature}</p>
    </div>
  );
}
```

#### Returns

```ts
{
  message: string;
  signature: string;
}
```

| Parameter   | Description                                       |
| ----------- | ------------------------------------------------- |
| `message`   | SIWE message signed by the user.                  |
| `signature` | Signature produced by the user's Warpcast wallet. |
