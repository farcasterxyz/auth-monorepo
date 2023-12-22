# `@farcaster/connect`

Farcaster Connect client library.

## App Client

If you're building a [connected app](https://docs.farcaster.xyz/learn/what-is-farcaster/apps#connected-apps), use an _app client_.

You can use an app client to create a Farcaster Connect relay channel, generate a URL to request a signature from the user's Farcaster wallet app, and verify the returned signature.

```ts
import { createAppClient, viem } from "@farcaster/connect";

const appClient = createAppClient({
  relayURI: "https://connect.farcaster.xyz",
  ethereum: viem(),
});
```

### Actions

#### `connect`

Create a Farcaster Connect relay channel.

Returns a secret token identifying the channel, and a URI to display to the end user as a link or QR code.

```ts
const channel = await appClient.connect({
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
    connectURI: string;
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

Get current status of a Farcaster Connect request.

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

###### channelToken

Farcaster Connect channel token, returned by `connect`.

Type: `string`

Example: `"210f1718-427e-46a4-99e3-2207f21f83ec"`

#### `watchStatus`

Poll the current status of a Farcaster Connect request.

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

###### channelToken

Farcaster Connect channel token, returned by `connect`.

Type: `string`

Example: `"210f1718-427e-46a4-99e3-2207f21f83ec"`

###### timeout

Polling timeout, in milliseconds. If the connect request is not completed before the timeout, `watchStatus` returns an error.

Type: `number`

Example: `60_000`

###### interval

Polling interval, in milliseconds. The client will check for updates at this frequency.

Type: `number`

Example: `1_000`

###### onResponse

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

Verify a Sign In With Farcaster message. Your app should call this function and check that it succeeds after reading the message and signature provided by the user's Farcaster wallet over the Connect channel.

Returns the parsed Sign in With Farcaster message, the user's fid, and whether the verification succeeded.

```ts
const { data, success, fid } = await appClient.verifySignInMessage({
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

###### message

The Sign in With Farcaster message to verify. This may be either a string or a parsed `SiweMessage`. Your app should read this value from the Connect channel once the request is completed.

Type: `string | SiweMessage`

Example: `"example.com wants you to sign in with your Ethereum account: [...]"`

###### signature

Signature provided by the user's Farcaster wallet. Your app should read this from the Connect channel once the request is completed.

Type: `0x${string}`

Example: `"0x9335c3055d4778013fdabad293c68c84ea350a11794cdc121c71fd51b[...]"`

## Auth Client

If you're building a [wallet app](https://docs.farcaster.xyz/learn/what-is-farcaster/apps#wallet-apps) and receiving signature requests, use an _auth client_.

You can use an auth client to parse an incoming Sign In With Farcaster request URL, build a Sign In With Farcaster message to present to the user, and submit the signed message to a Farcaster Connect relay channel.

```ts
import { createAuthClient, viem } from "@farcaster/connect";

const authClient = createAuthClient({
  relayURI: "https://connect.farcaster.xyz",
  ethereum: viem(),
});
```

### Actions

#### `parseSignInURI`

Parse the Sign In With Farcaster URI provided by a connected app user.

Returns the parsed parameters. Your app should use these to construct a Sign In With Farcaster message.

Returns an error if URI is invalid.

```ts
const params = authClient.parseSignInURI({
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
const { siweMessage, message } = authClient.buildSignInMessage({
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

Submit a Sign In With Farcaster message, user signature, and profile data to the Connect relay server.

```ts
const params = authClient.authenticate({
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

Example: `"alice"``

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
