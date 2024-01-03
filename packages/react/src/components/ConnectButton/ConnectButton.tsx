import { useCallback, useState } from "react";
import useSignIn from "../../hooks/useSignIn.ts";
import { SignInButton } from "../SignInButton";
import { ProfileButton } from "../ProfileButton";
import { QRCodeDialog } from "../QRCodeDialog";

interface ConnectConfig {
  siweUri: string;
  domain: string;
  relayURI?: string;
  timeout?: number;
  interval?: number;
}

export function ConnectButton({
  config,
  debug,
}: {
  config: ConnectConfig;
  debug?: boolean;
}) {
  const signInState = useSignIn(config);
  const {
    signIn,
    reconnect,
    isSuccess,
    isError,
    error,
    qrCodeURI,
    connectURI,
    data,
    validSignature,
  } = signInState;

  const [showDialog, setShowDialog] = useState(false);

  const onClick = useCallback(() => {
    isError ? reconnect() : signIn();
    setShowDialog(true);
  }, [isError, reconnect, signIn]);

  const authenticated = isSuccess && validSignature;
  const connected = qrCodeURI && connectURI;

  return (
    <div>
      {authenticated ? (
        <ProfileButton userData={data} />
      ) : (
        <>
          <SignInButton onClick={onClick} />
          {connected && (
            <QRCodeDialog
              open={showDialog}
              onClose={() => setShowDialog(false)}
              qrCodeURI={qrCodeURI}
              connectURI={connectURI}
              isError={isError}
              error={error}
            />
          )}
        </>
      )}
      {debug && (
        <div
          style={{
            zIndex: 10,
            position: "fixed",
            backgroundColor: "white",
            padding: 24,
            bottom: 9,
            boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
            width: 600,
            overflow: "scroll",
          }}
        >
          <pre>{JSON.stringify(signInState, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
