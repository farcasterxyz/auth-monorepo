# `@farcaster/connect`

Farcaster Connect client library.

## App Client

If you're building a [connected app](https://docs.farcaster.xyz/learn/what-is-farcaster/apps#connected-apps), use an app client.

You can use an app client to open a Farcaster Connect relay channel, request a signature from the user's Farcaster wallet app, and verify the returned signature.

```ts
import { createAppClient, viem } from "@farcaster/connect";

const appClient = createAppClient({
  relayURI: "https://connect.farcaster.xyz",
  ethereum: viem(),
});
```

### Actions

#### `connect`

Create a Farcaster Connect channel.

```ts
const {
  response,
  data: { channelToken, connectURI },
} = await appClient.connect({
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
}
```

##### Parameters

##### siweUri

Login URL for your application.

Type: `string`
Example: `"https://example.com/login"

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

```ts
const {
  data: { state, message, signature },
} = await appClient.status({
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
}
```

##### Parameters

###### channelToken

Farcaster Connect channel token, returned by `connect`.

Type: `string`
Example: `"210f1718-427e-46a4-99e3-2207f21f83ec"`

#### `watchStatus`

Poll current status of a Farcaster Connect request. This action resolves with the final channel value when the status changes to `'complete'`.

```ts
const {
  data: { channelToken, connectURI },
} = await appClient.watchStatus({
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
}
```

##### Parameters

###### channelToken

Farcaster Connect channel token, returned by `connect`.

Type: `string`
Example: `"210f1718-427e-46a4-99e3-2207f21f83ec"`

###### timeout

Polling timeout, in milliseconds. If the connect request is not completed before the timeout, `watchStatus` throws.

Type: `number`
Example: `60_000`

###### interval

Polling interval, in milliseconds. The client will check for updates at this frequency.

Type: `number`
Example: `1_000`

###### onResponse

Callback function invoked each time the client poll for an update. Receives the return value of the latest `status`.

Type: `({ response, data }) => void`
Example:

```ts
({ response, data }) => {
  console.log("Response code:", response.status);
  console.log("Status data:", data);
};
```

#### `verifySignInMessage`

Verify a Sign In With Farcaster message. Your app should check that this succeeds after reading the message and signature provided by the user's Farcaster wallet over the Connect channel.

```ts
const { data, success, fid } = await appClient.verifySignInMessage({
  message: "example.com wants you to sign in with your Ethereum account: [...]",
  signature: "0x9335c3055d477804113fdabad293...c68c84ea350a11794cdc121c71fd51b",
});
```

##### Return Value

```ts
{
    data: SiweMessage,
    success: boolean,
    fid: number
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
Example: `"0x9335c3055d477804113fdabad293...c68c84ea350a11794cdc121c71fd51b"``

## Auth Client

If you're building a [wallet app](https://docs.farcaster.xyz/learn/what-is-farcaster/apps#wallet-apps), use an auth client.

You can use an auth client to parse an incoming Sign In With Farcaster request, build a Sign In With Farcaster message and submit the signed message to a Farcaster Connect relay channel.

```ts
import { createAuthClient, viem } from "@farcaster/connect";

const authClient = createAuthClient({
  relayURI: "https://connect.farcaster.xyz",
  ethereum: viem(),
});
```
