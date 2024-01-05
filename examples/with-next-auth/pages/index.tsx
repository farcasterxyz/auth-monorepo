import '@farcaster/connect-kit/styles.css';

import Head from "next/head";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import { ConnectButton, ConnectKitProvider, StatusAPIResponse } from "@farcaster/connect-kit";
import { useCallback, useState } from "react";

const config = {
  relay: 'https://connect.farcaster.xyz',
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: "http://example.com",
  domain: "example.com",
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Next Auth Sign in with Farcaster Demo</title>
      </Head>
      <main>
        <ConnectKitProvider config={config}>
          <Content />
        </ConnectKitProvider>
      </main>
    </>
  );
}

function Content() {
  const { data: session } = useSession();
  const [error, setError] = useState(false);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSuccess = useCallback((res: StatusAPIResponse) => {
    signIn("credentials", {
      message: res.message,
      signature: res.signature,
      name: res.username,
      pfp: res.pfpUrl,
      redirect: false
    })
  }, [signIn]);

  if (session) {
    return (
      <>
        Signed in as {session.user?.name} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <ConnectButton nonce={getNonce} onSuccess={handleSuccess} onError={() => setError(true)} />
      {error && <div>Unable to sign in at this time.</div>}
    </>
  );
}
