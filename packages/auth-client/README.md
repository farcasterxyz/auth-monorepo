# `@farcaster/auth-client`

A framework agnostic client library for Farcaster Auth.

## Getting Started

### Installation

Install the library and its peer dependency [viem](https://viem.sh/).

```sh
npm install @farcaster/auth-client viem
```

## Clients

If you're building a [connected app](https://docs.farcaster.xyz/learn/what-is-farcaster/apps#connected-apps), use an [_app client_](#app-client). An app client can connect to the relay server, generate a Sign in With Farcaster link, and verify the user's signature.

If you're building a [wallet app](https://docs.farcaster.xyz/learn/what-is-farcaster/apps#wallet-apps) and receiving signature requests, use a [_wallet client_](#wallet-client). A wallet client can parse a Sign in With Farcaster URL, build a message to present to the user, and submit the signed message to the relay server.

## App Client

You can use an app client to create a Farcaster Auth relay channel, generate a URL to request a signature from the user's Farcaster wallet app, and verify the returned signature.

```ts
import { createAppClient, viemConnector } from "@farcaster/auth-client";
import { JsonRpcProvider } from "ethers";

const appClient = createAppClient({
  relay: "https://relay.farcaster.xyz",
  ethereum: viemConnector(),
});
```

#### Parameters

##### ethereum

An Ethereum connector, used to query the Farcaster contracts and verify smart contract wallet signatures. `@farcaster/auth-client` currently provides only the `viemConnector` connector type.

To use a custom RPC, pass an RPC URL to the viem connector.

Type: `Ethereum`

Example: `viemConnector("http://mainnet.optimism.io")`

##### relay (optional)

Relay server URL. Defaults to the public relay at `https://relay.farcaster.xyz`.

Type: `string`

Example: `"https://relay.farcaster.xyz"`

##### version (optional)

Farcaster Auth version. Defaults to `"v1"`

Type: `string`

Example: `"v1"`

### Actions

#### `createChannel`

Create a Farcaster Auth relay channel.

Returns a secret token identifying the channel, and a URI to display to the end user as a link or QR code.

```ts
const channel = await appClient.createChannel({
  siweUri: "https://example.com/login",
  domain: "example.com",
});
```

##### Return Value

```ts
{
  response: Response;
  data: {
    channelToken: string;
    url: string;
  }
  isError: boolean;
  error: Error;
}
```

##### Parameters

##### siweUri

Login URL for your application.

Type: `string`

Example: `"https://example.com/login"`

##### domain

Domain of your application. Value should match the domain requesting the SIWE signature.

Type: `string`

Example: `"example.com"`

##### nonce (optional)

A custom nonce. Must be at least 8 alphanumeric characters.

Type: `string`

Example: `"ESsxs6MaFio7OvqWb"`

##### notBefore (optional)

Start time at which the SIWE signature becomes valid. ISO 8601 datetime.

Type: `string`

Example: `"2023-12-20T23:21:24.917Z"`

##### expirationTime (optional)

Expiration time at which the SIWE signature is no longer valid. ISO 8601 datetime.

Type: `string`

Example: `"2023-12-20T23:21:24.917Z"`

##### requestId (optional)

A system specific ID your app can use to refer to the sign in request.

Type: `string`

Example: `"8d0494d9-e0cf-402b-ab0a-394ac7fe07a0"`

#### `status`

Get current status of a Farcaster Auth request.

Returns the current state of the request, either `'pending'` if the user's Farcaster wallet app has not yet sent back a signature, or `'completed'` once the wallet app has returned a response.

In `'completed'` state, the response includes the generated Sign in With Farcaster message, a signature from the user's custody address, the user's verified fid, and user profile information.

```ts
const status = await appClient.status({
  channelToken: "210f1718-427e-46a4-99e3-2207f21f83ec",
});
```

##### Return Value

```ts
{
    response: Response
    data: {
        state: 'pending' | 'completed'
        nonce: string
        message?: string
        signature?: Hex
        fid?: number
        username?: string
        bio?: string
        displayName?: string
        pfpUrl?: string
        custody?: Hex
        verifications?: Hex[]
    }
    isError: boolean
    error: Error
}
```

##### Parameters

###### channelToken

Farcaster Auth relay channel token, returned by `createChannel`.

Type: `string`

Example: `"210f1718-427e-46a4-99e3-2207f21f83ec"`

#### `watchStatus`

Poll for the current status of a Farcaster Auth request.

When the status changes to `'complete'` this action resolves with the final channel value, including the Sign In With Farcaster message, signature, and user profile information.

```ts
const status = await appClient.watchStatus({
  channelToken: "210f1718-427e-46a4-99e3-2207f21f83ec",
  timeout: 60_000,
  interval: 1_000,
  onResponse: ({ response, data }) => {
    console.log("Response code:", response.status);
    console.log("Status data:", data);
  },
});
```

##### Return Value

```ts
{
    response: Response
    data: {
        state: 'completed'
        nonce: string
        message?: string
        signature?: Hex
        fid?: number
        username?: string
        bio?: string
        displayName?: string
        pfpUrl?: string
        custody?: Hex
        verifications?: Hex[]
    }
    isError: boolean
    error: Error
}
```

##### Parameters

###### channelToken

Farcaster Auth relay channel token, returned by `createChannel`.

Type: `string`

Example: `"210f1718-427e-46a4-99e3-2207f21f83ec"`

###### timeout (optional)

Polling timeout, in milliseconds. If the auth request is not completed before the timeout, `watchStatus` returns an error.

Type: `number`

Example: `300_000`

###### interval (optional)

Polling interval, in milliseconds. The client will check for updates at this frequency.

Type: `number`

Example: `1_000`

###### onResponse (optional)

Callback function invoked each time the client polls for an update and receives a response from the relay server. Receives the return value of the latest `status` request.

Type: `({ response, data }) => void`

Example:

```ts
({ response, data }) => {
  console.log("Response code:", response.status);
  console.log("Status data:", data);
};
```

#### `verifySignInMessage`

Verify a Sign In With Farcaster message. Your app should call this function and check that it succeeds after reading the message and signature provided by the user's Farcaster wallet over the Auth relay channel.

Returns the parsed Sign in With Farcaster message, the user's fid, and whether the verification succeeded.

```ts
const { data, success, fid } = await appClient.verifySignInMessage({
  nonce: "abcd1234",
  domain: "example.com",
  message: "example.com wants you to sign in with your Ethereum account: [...]",
  signature: "0x9335c3055d47780411a3fdabad293c68c84ea350a11794cdc811fd51b[...]",
});
```

##### Return Value

```ts
{
    data: SiweMessage,
    success: boolean,
    fid: number
    isError: boolean
    error: Error
}
```

##### Parameters

##### nonce

The nonce generated by your application. Must match the nonce in the SIWE message.

Type: `string`

Example: `"ESsxs6MaFio7OvqWb"`

##### domain

Domain of your application. Value must match the domain in the SIWE message.

Type: `string`

Example: `"example.com"`

###### message

The Sign in With Farcaster message to verify. This may be either a string or a parsed `SiweMessage`. Your app should read this value from the Auth relay channel once the request is completed.

Type: `string | SiweMessage`

Example: `"example.com wants you to sign in with your Ethereum account: [...]"`

###### signature

Signature provided by the user's Farcaster wallet. Your app should read this from the Auth relay channel once the request is completed.

Type: `0x${string}`

Example: `"0x9335c3055d4778013fdabad293c68c84ea350a11794cdc121c71fd51b[...]"`

## Auth Client

If you're building a [wallet app](https://docs.farcaster.xyz/learn/what-is-farcaster/apps#wallet-apps) and receiving signature requests, use a _wallet client_.

You can use an wallet client to parse an incoming Sign In With Farcaster request URL, build a Sign In With Farcaster message to present to the user, and submit the signed message to a Farcaster Auth relay channel.

```ts
import { createWalletClient, viemConnector } from "@farcaster/auth-client";

const walletClient = createWalletClient({
  relay: "https://relay.farcaster.xyz",
  ethereum: viemConnector(),
});
```

### Parameters

##### ethereum

An Ethereum connector, used to query the Farcaster contracts and verify smart contract wallet signatures. `@farcaster/auth-client` currently provides only the `viem` connector type.

To use a custom RPC, pass an RPC URl to the viem connector.

Type: `Ethereum`

Example: `viem("http://mainnet.optimism.io")`

##### relay (optional)

Relay server URL. Defaults to the public relay at `https://relay.farcaster.xyz`.

Type: `string`

Example: `"https://relay.farcaster.xyz"`

##### version (optional)

Farcaster Auth version. Defaults to `"v1"`

Type: `string`

Example: `"v1"`

### Actions

#### `parseSignInURI`

Parse the Sign In With Farcaster URI provided by a connected app user.

Returns the parsed parameters. Your app should use these to construct a Sign In With Farcaster message.

Returns an error if URI is invalid.

```ts
const params = walletClient.parseSignInURI({
  uri: "farcaster://connect?channelToken=76be6229-bdf7-4ad2-930a-540fb2de1e08&nonce=ESsxs6MaFio7OvqWb&siweUri=https%3A%2F%2Fexample.com%2Flogin&domain=example.com",
});
```

##### Return Value

```ts
{
  channelToken: string
  params: {
    domain: string
    uri: string
    nonce: string
    notBefore?: string
    expirationTime?: string
    requestId?: string
  }
  isError: boolean
  error: Error
}
```

##### Parameters

##### uri

Sign In With Farcaster protocol handler URI.

Type: `string`

Example: `"farcaster://connect?channelToken=76be6229-bdf7-4ad2-930a-540fb2de1e08&nonce=ESsxs6MaFio7OvqWb&siweUri=https%3A%2F%2Fexample.com%2Flogin&domain=example.com"`

#### `buildSignInMessage`

Build a Sign In With Farcaster message to present to the end user.

Adds required Sign In With Farcaster message attributes to any provided parameters. You should parse most of these parameters from the provided protocol URI. Your wallet app must provide the user's custody address and fid.

Returns a `SiweMessage` object and the message as a string.

```ts
const { siweMessage, message } = walletClient.buildSignInMessage({
  address: "0x63C378DDC446DFf1d831B9B96F7d338FE6bd4231",
  fid: 1,
  uri: "https://example.com/login",
  domain: "example.com",
  nonce: "ESsxs6MaFio7OvqWb",
});
```

##### Return Value

```ts
{
  siweMessage: SiweMessage;
  message: string;
  isError: boolean;
  error: Error;
}
```

##### Parameters

##### address

Wallet user's custody address. This address must sign the generated Sign In With Farcaster message. Your wallet app should provide the custody address of the authenticated user.

Type: `0x${string}`

Example: `"0x63C378DDC446DFf1d831B9B96F7d338FE6bd4231"`

##### fid

Wallet user's fid. Your wallet app should provide the fid of the authenticated user.

Type: `number`

Example: `1`

##### uri

Login URL of the relying connected app. Parse this from the provided Sign In With Farcaster URI.

Type: `string`

Example: `"https://example.com/login"`

##### domain

Domain of the relying connected app. Parse this from the provided Sign In With Farcaster URI.

Type: `string`

Example: `"example.com"`

##### nonce

Random nonce to include in the Sign In With Farcaster message. Must be at least 8 alphanumeric characters. Parse this from the provided Sign In With Farcaster URI.

Type: `string`

Example: `"ESsxs6MaFio7OvqWb"`

##### notBefore (optional)

Start time at which the SIWE signature becomes valid. ISO 8601 datetime. Parse this from the provided Sign In With Farcaster URI.

Type: `string`

Example: `"2023-12-20T23:21:24.917Z"`

##### expirationTime (optional)

Expiration time at which the SIWE signature is no longer valid. ISO 8601 datetime. Parse this from the provided Sign In With Farcaster URI.

Type: `string`

Example: `"2023-12-20T23:21:24.917Z"`

##### requestId (optional)

A system specific ID provided by the relying app. Parse this from the provided Sign In With Farcaster URI.

Type: `string`

Example: `"8d0494d9-e0cf-402b-ab0a-394ac7fe07a0"`

#### `authenticate`

Submit a Sign In With Farcaster message, user signature, and profile data to the Auth relay server.

```ts
const params = walletClient.authenticate({
  message: "example.com wants you to sign in with your Ethereum account: [...]",
  signature: "0x9335c3055d47780411a3fdabad293c68c84ea350a11794cdc811fd51b[...]",
  fid: 1,
  username: "alice",
  bio: "I'm a little teapot who didn't fill out my bio",
  displayName: "Alice Teapot",
  pfpUrl: "https://images.example.com/profile.png",
});
```

##### Return Value

```ts
{
  response: Response
  data: {
      state: 'completed'
      nonce: string
      message?: string
      signature?: `0x${string}`
      fid?: number
      username?: string
      bio?: string
      displayName?: string
      pfpUrl?: string
  }
  isError: boolean
  error: Error
}
```

##### Parameters

###### message

The Sign in With Farcaster message produced by your wallet app and signed by the user.

Type: `string`

Example: `"example.com wants you to sign in with your Ethereum account: [...]"`

###### signature

SIWE signature created by the wallet user's account.

Type: `0x${string}`

Example: `"0x9335c3055d4778013fdabad293c68c84ea350a11794cdc121c71fd51b[...]"`

##### fid

Wallet user's fid.

Type: `number`

Example: `1`

##### username

Wallet user's Farcaster username.

Type: `string`

Example: `"alice"`

##### bio

Wallet user's bio.

Type: `string`

Example: `"I'm a little teapot who didn't fill out my bio"`

##### displayName

Wallet user's display name.

Type: `string`

Example: `"Alice Teapot"`

##### pfpUrl

Wallet user's profile photo URL.

Type: `string`

Example: `"https://images.example.com/profile.png"`
