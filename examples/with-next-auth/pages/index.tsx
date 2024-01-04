import '@farcaster/connect-kit/styles.css';

import Head from "next/head";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import { ConnectButton, ConnectKitProvider, useSignInMessage, useUserData } from "@farcaster/connect-kit";
import { useCallback, useEffect } from "react";

const config = {
  relay: 'https://connect.farcaster.xyz',
  rpcUrl: "https://mainnet.optimism.io",
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
  const message = useSignInMessage();
  const userData = useUserData();

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  useEffect(() => {
    if (message.message && message.signature) {
      signIn("credentials", {
        message: message.message,
        signature: message.signature + "0123123",
        name: userData.userData.username,
        pfp: userData.userData.pfpUrl,
        redirect: false
      })
    }
  }, [message]);

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
      <ConnectButton siweUri="http://example.com" domain="example.com" debug nonce={getNonce} />
    </>
  );
}
