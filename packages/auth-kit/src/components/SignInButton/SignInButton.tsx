import { useCallback, useEffect, useState } from "react";
import useSignIn, { UseSignInArgs } from "../../hooks/useSignIn.ts";
import { ActionButton } from "../ActionButton/index.ts";
import { ProfileButton } from "../ProfileButton/index.ts";
import { QRCodeDialog } from "../QRCodeDialog/index.tsx";
import { isMobile } from "../../utils.ts";

type SignInButtonProps = UseSignInArgs & { debug?: boolean };

export function SignInButton({ debug, ...signInArgs }: SignInButtonProps) {
  const signInState = useSignIn(signInArgs);
  const { signIn, reconnect, isSuccess, isError, error, qrCodeUri, url, data, validSignature } = signInState;

  const [showDialog, setShowDialog] = useState(false);

  const onClick = useCallback(() => {
    isError ? reconnect() : signIn();
    setShowDialog(true);
  }, [isError, reconnect, signIn]);

  const authenticated = isSuccess && validSignature;

  useEffect(() => {
    if (url && isMobile()) {
      window.location.href = url;
    }
  }, [url, setShowDialog]);

  return (
    <div>
      {authenticated ? (
        <ProfileButton userData={data} />
      ) : (
        <>
          <ActionButton onClick={onClick} label="Sign in with Farcaster" />
          {qrCodeUri && url && (
            <QRCodeDialog
              open={showDialog && !isMobile()}
              onClose={() => setShowDialog(false)}
              qrCodeUri={qrCodeUri}
              url={url}
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
