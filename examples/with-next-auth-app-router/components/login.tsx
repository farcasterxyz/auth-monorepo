"use client";

import "@farcaster/auth-kit/styles.css";
import Head from "next/head";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import {
  SignInButton,
  AuthKitProvider,
  StatusAPIResponse,
} from "@farcaster/auth-kit";
import { useCallback, useState } from "react";

const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: "http://example.com/login",
  domain: "example.com",
};

export default function Login() {
  return (
    <>
      <Head>
        <title>Farcaster AuthKit + NextAuth Demo</title>
      </Head>
      <main style={{ fontFamily: "Inter, sans-serif" }}>
        <AuthKitProvider config={config}>
          <Content />
        </AuthKitProvider>
      </main>
    </>
  );
}

function Content() {
  const [error, setError] = useState(false);

  const getNonce = useCallback(async () => {
    console.log("Getting CSRF token...");
    const nonce = await getCsrfToken();
    console.log("CSRF token:", nonce);
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSuccess = useCallback(
    (res: StatusAPIResponse) => {
      console.log("Success response:", res);
      signIn("credentials", {
        message: res.message,
        signature: res.signature,
        name: res.username,
        pfp: res.pfpUrl,
        csrfToken: (res as unknown as any).csrfToken,
        redirect: false,
      });
    },
    []
  );

  return (
    <div>
      <div style={{ position: "fixed", top: "12px", right: "12px" }}>
        <SignInButton
          nonce={getNonce}
          onSuccess={handleSuccess}
          onError={() => setError(true)}
          onSignOut={() => signOut()}
        />
        {error && <div>Unable to sign in at this time.</div>}
      </div>
      <div style={{ paddingTop: "33vh", textAlign: "center" }}>
        <h1>@farcaster/auth-kit + NextAuth</h1>
        <p>
          This example app shows how to use{" "}
          <a
            href="https://docs.farcaster.xyz/auth-kit/introduction"
            target="_blank" rel="noreferrer"
          >
            Farcaster AuthKit
          </a>{" "}
          and{" "}
          <a href="https://next-auth.js.org/" target="_blank" rel="noreferrer">
            NextAuth.js
          </a>
          .
        </p>
        <Profile />
        <div>
          <h2>Run this demo:</h2>
          <div
            style={{
              margin: "0 auto",
              padding: "24px",
              textAlign: "left",
              maxWidth: "640px",
              backgroundColor: "#fafafa",
              fontFamily: "monospace",
              fontSize: "1.25em",
              border: "1px solid #eaeaea",
            }}
          >
            git clone https://github.com/farcasterxyz/auth-monorepo.git &&
            <br />
            cd auth-monorepo/examples/with-next-auth &&
            <br />
            yarn install &&
            <br />
            yarn dev
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const { data: session } = useSession();

  return session ? (
    <div style={{ fontFamily: "sans-serif", color: 'black' }}>
      <p>Signed in as {session.user?.name}</p>
      <p>
        <button
          type="button"
          style={{ padding: "6px 12px", cursor: "pointer" }}
          onClick={() => signOut()}
        >
          Click here to sign out
        </button>
      </p>
    </div>
  ) : (
    <p>
      Click the &quot;Sign in with Farcaster&quot; button above, then scan the QR code to
      sign in.
    </p>
  );
}